const db = require("../config/db");
const path = require('path');

exports.merchandiseCustomize = (req, res) => {
    console.log("Received Request Body:", req.body);

    const { name, description, category, price, quantity } = req.body;
    
    const images = req.files?.map((file) => {
        const filename = path.parse(file.originalname).name;  // Extracts the filename without extension
        return `${file.filename}`;  // Store only the unique filename (without extension)
    }) || [];
    

    // Handle variants
    let variants;
    try {
        variants = JSON.parse(req.body.colorSizes || "[]");
        if (!Array.isArray(variants) || variants.length === 0) {
            return res.status(400).json({ error: "Variants must be a non-empty array" });
        }
    } catch (error) {
        console.error("JSON Parse Error:", error);
        return res.status(400).json({ error: "Invalid JSON format in colorSizes" });
    }

    // Insert product into `merchandise_products`
    const sql = `
        INSERT INTO merchandise_products (name, description, category, price, quantity) 
        VALUES (?, ?, ?, ?, ?)
    `;

    db.query(sql, [name, description, category, price, quantity], (err, result) => {
        if (err) {
            console.error("Database Error:", err);
            return res.status(500).json({ error: "Database error" });
        }

        const productId = result.insertId;

        // Insert variants with images
        const variantSql = `
            INSERT INTO merchandise_products_variants (product_id, color, sizes, image) 
            VALUES ?
        `;

        const variantValues = variants.map((v, index) => [
            productId,
            v.color,
            JSON.stringify(v.sizes),
            images[index] || null
        ]);

        if (variantValues.length > 0) {
            db.query(variantSql, [variantValues], (err) => {
                if (err) {
                    console.error("Error inserting variants:", err);
                    return res.status(500).json({ error: "Error inserting variants" });
                }
                res.json({ message: "Product added successfully", productId });
            });
        } else {
            res.json({ message: "Product added successfully", productId });
        }
    });
};

exports.getMerchandise = (req, res) => {
    const sql = `
        SELECT 
            mp.id, 
            mp.name, 
            mp.description, 
            mp.category, 
            mp.price, 
            mp.quantity,
            mv.color,
            mv.sizes,
            mv.image
        FROM merchandise_products mp
        LEFT JOIN merchandise_products_variants mv ON mp.id = mv.product_id
    `;

    db.query(sql, (err, results) => {
        if (err) {
            console.error("Database Error:", err);
            return res.status(500).json({ error: "Database error" });
        }

        // Transforming results to merge variants by product ID
        const merged = results.reduce((acc, row) => {
            const { id, name, description, category, price, quantity, color, sizes, image } = row;

            if (!acc[id]) {
                acc[id] = {
                    id,
                    name,
                    description,
                    category,
                    price,
                    quantity,
                    variants: []
                };
            }

            if (color || sizes || image) {
                acc[id].variants.push({ color, sizes, image });
            }

            return acc;
        }, {});

        // Converting the object back to an array
        const response = Object.values(merged);

        res.json(response);
    });
};


exports.getMerchandiseById = (req, res) => {
    const { id } = req.params;

    const sql = `
        SELECT 
            mp.id, 
            mp.name, 
            mp.description, 
            mp.category, 
            mp.price, 
            mp.quantity,
            mv.color,
            mv.sizes,
            mv.image
        FROM merchandise_products mp
        LEFT JOIN merchandise_products_variants mv ON mp.id = mv.product_id
        WHERE mp.id = ?
    `;

    db.query(sql, [id], (err, results) => {
        if (err) {
            console.error("Database Error:", err);
            return res.status(500).json({ error: "Database error" });
        }
        if (results.length === 0) {
            return res.status(404).json({ error: "Product not found" });
        }

        // Merging data
        const mergedResult = results.reduce((acc, product) => {
            // If the product is already in the accumulator, merge the variants
            if (acc.length > 0 && acc[0].id === product.id) {
                acc[0].color.push(product.color);
                acc[0].sizes = [...new Set([...acc[0].sizes, ...JSON.parse(product.sizes)])]; // Merge and remove duplicates
                acc[0].image.push(product.image);
            } else {
                // Add new product with variant data
                acc.push({
                    id: product.id,
                    name: product.name,
                    description: product.description,
                    category: product.category,
                    price: product.price,
                    quantity: product.quantity,
                    color: [product.color],
                    sizes: JSON.parse(product.sizes),
                    image: [product.image]
                });
            }
            return acc;
        }, []);

        res.json(mergedResult);
    });
};





// Update merchandise product (only description, name, price, quantity)
exports.updateMerchandise = (req, res) => {
    const { id } = req.params;
    const { name, description, price, quantity } = req.body;

    const sql = `
        UPDATE merchandise_products
        SET name = ?, description = ?, price = ?, quantity = ?
        WHERE id = ?
    `;

    db.query(sql, [name, description, price, quantity, id], (err, result) => {
        if (err) {
            console.error("Error updating product:", err);
            return res.status(500).json({ error: "Database error" });
        }
        res.json({ message: "Product updated successfully" });
    });
};

// Delete merchandise product and its variants
exports.deleteMerchandise = (req, res) => {
    const { id } = req.params;

    const deleteVariantsSql = `
        DELETE FROM merchandise_products_variants WHERE product_id = ?
    `;

    db.query(deleteVariantsSql, [id], (err) => {
        if (err) {
            console.error("Error deleting variants:", err);
            return res.status(500).json({ error: "Database error" });
        }

        const deleteProductSql = `
            DELETE FROM merchandise_products WHERE id = ?
        `;

        db.query(deleteProductSql, [id], (err) => {
            if (err) {
                console.error("Error deleting product:", err);
                return res.status(500).json({ error: "Database error" });
            }
            res.json({ message: "Product and its variants deleted successfully" });
        });
    });
};
