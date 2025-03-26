const db = require("../config/db");
const path = require("path");
const fs = require("fs");

exports.createAccessory = async (req, res) => {
    try {
        console.log("Request Body:", req.body);
        console.log("Uploaded Files:", req.files);

        const { name, description, category, price, color, quantity } = req.body;

        // ✅ Map the uploaded images properly
        const images = req.files ? req.files.map((file) => file.filename).join(",") : null;
        const colors = color ? JSON.stringify(color.split(",")) : null;

        if (!name || !category || !price || !quantity) {
            return res.status(400).json({ error: "Name, category, price, and quantity are required" });
        }

        const result = await db.execute(
            `INSERT INTO accessories 
            (name, description, category, price, colors, quantity, images) 
            VALUES (?, ?, ?, ?, ?, ?, ?)`,
            [name, description, category, price, colors, quantity, images]
        );

        console.log("DB Result:", result);

        return res.status(201).json({
            message: "Accessory added successfully",
            name: name,
        });

    } catch (err) {
        console.error("Error:", err);
        res.status(500).json({ error: err.message });
    }
};


// Get All Accessories
exports.getAccessories = (req, res) => {
    const sql = "SELECT * FROM accessories";
    db.query(sql, (err, results) => {
        if (err) return res.status(500).json({ error: err.message });
        res.status(200).json(results);
    });
};

// Get Accessory by ID
exports.getAccessoryById = (req, res) => {
    const { id } = req.params;
    const sql = "SELECT * FROM accessories WHERE id = ?";
    db.query(sql, [id], (err, result) => {
        if (err) return res.status(500).json({ error: err.message });
        if (result.length === 0) return res.status(404).json({ message: "Accessory not found" });
        res.status(200).json(result[0]);
    });
};

// Update Accessory (only name, price, and quantity)
exports.updateAccessory = (req, res) => {
    const { id } = req.params;
    const { name, price, quantity } = req.body;
    
    const sql = "UPDATE accessories SET name=?, price=?, quantity=? WHERE id=?";
    db.query(sql, [name, price, quantity, id], (err, result) => {
        if (err) return res.status(500).json({ error: err.message });
        res.status(200).json({ message: "Accessory updated successfully!" });
    });
};


// Delete Accessory
exports.deleteAccessory = (req, res) => {
    const { id } = req.params;
    const sql = "DELETE FROM accessories WHERE id=?";
    db.query(sql, [id], (err, result) => {
        if (err) return res.status(500).json({ error: err.message });
        res.status(200).json({ message: "Accessory deleted successfully!" });
    });
};



// Get Accessories by Category
exports.getAccessoryByCategory = (req, res) => {
  const { category } = req.params;  // Get category from URL parameter

  const sql = "SELECT * FROM accessories WHERE category = ?";
  
  db.query(sql, [category], (err, results) => {
      if (err) return res.status(500).json({ error: err.message });
      
      if (results.length === 0) {
          return res.status(404).json({ message: "No accessories found for this category" });
      }
      
      res.status(200).json(results);
  });
};


exports.getProducts = async (req, res) => {
  try {
      const accessoriesResult = await db.execute(`SELECT id, name, description, category, price, quantity, colors, images, created_at FROM accessories`);
      const accessories = accessoriesResult[0] || [];

      const categoriesResult = await db.execute(`SELECT id, name, description, image, created_at FROM categories`);
      const categories = categoriesResult[0] || [];

      const products = [
          ...accessories.map(item => ({
              id: item.id,
              name: item.name || null,
              description: item.description,
              category: item.category,
              price: item.price,
              quantity: item.quantity,
              colors: item.colors ? JSON.parse(item.colors) : [],
              sizes: [],
              images: item.images ? item.images.split(',') : [],
              created_at: item.created_at
          })),
          ...categories.map(item => ({
              id: item.id,
              name: item.name,
              description: item.description,
              category: null,
              price: null,
              quantity: null,
              colors: [],
              sizes: [],
              images: item.image ? [item.image] : [],
              created_at: item.created_at
          }))
      ];

      res.status(200).json({ products });

  } catch (err) {
      console.error("Error:", err);
      res.status(500).json({ error: err.message });
  }
};
