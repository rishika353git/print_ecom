const db = require("../config/db");
const path = require("path");
const fs = require("fs");

exports.addProduct = (req, res) => {
  console.log("Received Request Body:", req.body); // Debugging Line

  const { description, category, price, quantity } = req.body;
  const images = req.files?.map((file) => file.filename).join(",") || "";

  let variants;
  try {
      variants = JSON.parse(req.body.colorSizes);
      console.log("Parsed Variants:", variants); // Debugging Line

      if (!Array.isArray(variants) || variants.length === 0) {
          return res.status(400).json({ error: "Variants must be a non-empty array" });
      }
  } catch (error) {
      console.error("JSON Parse Error:", error); // Debugging Line
      return res.status(400).json({ error: "Invalid JSON format in colorSizes" });
  }

  const sql = `INSERT INTO products (description, category, images, price, quantity) VALUES (?, ?, ?, ?, ?)`;

  db.query(sql, [description, category, images, price, quantity], (err, result) => {
      if (err) {
          return res.status(500).json({ error: "Database error" });
      }

      const productId = result.insertId;

      const variantSql = `INSERT INTO product_variants (product_id, color, sizes) VALUES ?`;
      const variantValues = variants.map(v => [productId, v.color, JSON.stringify(v.sizes)]);

      db.query(variantSql, [variantValues], (err) => {
          if (err) {
              return res.status(500).json({ error: "Error inserting variants" });
          }
          res.json({ message: "Product added successfully", productId });
      });
  });
};



exports.getAllProducts = (req, res) => {
  const sql = `
      SELECT 
          p.id AS product_id,
          p.description,
          p.category,
          p.images,
          p.price,
          p.quantity,
          IFNULL(
              GROUP_CONCAT(
                  CONCAT(
                      '{"variant_id":', v.id, 
                      ',"color":"', v.color, 
                      '","sizes":', v.sizes, '}'
                  )
              ),
              '[]'
          ) AS variants
      FROM products p
      LEFT JOIN product_variants v ON p.id = v.product_id
      GROUP BY p.id
  `;

  db.query(sql, (err, results) => {
      if (err) {
          console.error("Database error:", err);
          return res.status(500).json({ error: "Database error" });
      }

      // Format the variants as JSON and ensure images are properly structured
      const products = results.map(product => ({
          ...product,
          images: product.images ? product.images.split(",") : [],
          variants: product.variants ? JSON.parse(`[${product.variants}]`) : []
      }));

      res.json({ products });
  });
};


  
exports.getProductById = (req, res) => {
  const productId = req.params.id; // Get the product ID from URL params

  const productSql = `
      SELECT 
          p.id, 
          p.description, 
          p.category, 
          p.images, 
          p.price, 
          p.quantity,
          JSON_ARRAYAGG(
              JSON_OBJECT(
                  'id', v.id,
                  'color', v.color,
                  'sizes', JSON_PARSE(v.sizes)
              )
          ) AS variants
      FROM products p
      LEFT JOIN product_variants v ON p.id = v.product_id
      WHERE p.id = ?
      GROUP BY p.id
  `;

  db.query(productSql, [productId], (err, results) => {
      if (err) {
          console.error("Database Error:", err);
          return res.status(500).json({ error: "Database error" });
      }

      if (results.length === 0) {
          return res.status(404).json({ message: "Product not found" });
      }

      const product = results[0];

      // ✅ Parse images into an array
      product.images = product.images ? product.images.split(",") : [];

      // ✅ Parse variants if available
      product.variants = product.variants ? JSON.parse(product.variants) : [];

      res.json(product);
  });
};

  
exports.updateProduct = (req, res) => {
    const productId = req.body.productId || req.body.get("productId");
    const description = req.body.description || req.body.get("description");
    const price = req.body.price || req.body.get("price");
    const quantity = req.body.quantity || req.body.get("quantity");

    if (!productId || !description || !price) {
        return res.status(400).json({ error: "Product ID, description, and price are required" });
    }

    const sql = `UPDATE products SET description = ?, price = ?, quantity = ? WHERE id = ?`;

    db.query(sql, [description, price, quantity, productId], (err, result) => {
        if (err) return res.status(500).json({ error: "Database error" });

        if (result.affectedRows === 0) {
            return res.status(404).json({ error: "Product not found" });
        }

        res.json({ message: "Product updated successfully" });
    });
};

  



  
exports.deleteProduct = (req, res) => {
  const productId = req.params.id; // Get the product ID from URL params

  // ✅ Delete variants first (due to foreign key relationship)
  const deleteVariantsSql = `DELETE FROM product_variants WHERE product_id = ?`;

  db.query(deleteVariantsSql, [productId], (err, variantResult) => {
      if (err) {
          console.error("Error deleting variants:", err);
          return res.status(500).json({ error: "Failed to delete product variants" });
      }

      // ✅ Delete the main product
      const deleteProductSql = `DELETE FROM products WHERE id = ?`;

      db.query(deleteProductSql, [productId], (err, productResult) => {
          if (err) {
              console.error("Error deleting product:", err);
              return res.status(500).json({ error: "Failed to delete product" });
          }

          if (productResult.affectedRows === 0) {
              return res.status(404).json({ message: "Product not found" });
          }

          res.json({ message: "Product and its variants deleted successfully" });
      });
  });
};




exports.getProductsByCategory = (req, res) => {
    const { category } = req.params;

    // First, get all products in the given category
    const productQuery = `SELECT * FROM products WHERE category = ?`;

    db.query(productQuery, [category], (err, products) => {
        if (err) {
            console.error("Database error:", err);
            return res.status(500).json({ error: "Database error" });
        }

        if (products.length === 0) {
            return res.status(404).json({ message: "No products found in this category" });
        }

        // Get product IDs to fetch variants
        const productIds = products.map(product => product.id);
        if (productIds.length === 0) {
            return res.json({ products: products.map(p => ({ ...p, images: p.images ? p.images.split(",") : [], variants: [] })) });
        }

        // Fetch variants separately
        const variantQuery = `SELECT * FROM product_variants WHERE product_id IN (?)`;

        db.query(variantQuery, [productIds], (err, variants) => {
            if (err) {
                console.error("Database error:", err);
                return res.status(500).json({ error: "Database error" });
            }

            // Map variants to their respective products
            const productMap = {};
            products.forEach(product => {
                productMap[product.id] = {
                    ...product,
                    images: product.images ? product.images.split(",") : [],
                    variants: []
                };
            });

            variants.forEach(variant => {
                if (productMap[variant.product_id]) {
                    productMap[variant.product_id].variants.push({
                        variant_id: variant.id,
                        color: variant.color,
                        sizes: variant.sizes
                    });
                }
            });

            res.json({ products: Object.values(productMap) });
        });
    });
};



