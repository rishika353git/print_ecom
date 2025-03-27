const db = require("../config/db");
const path = require("path");
const fs = require("fs");

// Create Customize Accessory with one image per color
exports.createCustomizeAccessory = async (req, res) => {
    try {
        console.log("Request Body:", req.body);
        console.log("Uploaded Files:", req.files);

        const { name, description, category, price, color, quantity } = req.body;

        if (!name || !category || !price || !quantity || !color || !req.files) {
            return res.status(400).json({ error: "All fields including color and images are required" });
        }

        const colors = color.split(",").map(c => c.trim());
        const images = req.files.map(file => file.filename);

        if (colors.length !== images.length) {
            return res.status(400).json({ error: "Number of colors and images must be equal" });
        }

        for (let i = 0; i < colors.length; i++) {
            await db.execute(
                `INSERT INTO customize_accessories 
                (name, description, category, price, color, quantity, image) 
                VALUES (?, ?, ?, ?, ?, ?, ?)`,
                [name, description, category, price, colors[i], quantity, images[i]]
            );
        }

        return res.status(201).json({
            message: "Customize Accessory added successfully",
            name: name,
        });

    } catch (err) {
        console.error("Error:", err);
        res.status(500).json({ error: err.message });
    }
};

// Get All Customize Accessories
exports.getCustomizeAccessories = (req, res) => {
    const sql = "SELECT * FROM customize_accessories";
    db.query(sql, (err, results) => {
        if (err) return res.status(500).json({ error: err.message });
        res.status(200).json(results);
    });
};

// Get Customize Accessory by ID
exports.getCustomizeAccessoryById = (req, res) => {
    const { id } = req.params;
    const sql = "SELECT * FROM customize_accessories WHERE id = ?";
    db.query(sql, [id], (err, result) => {
        if (err) return res.status(500).json({ error: err.message });
        if (result.length === 0) return res.status(404).json({ message: "Customize Accessory not found" });
        res.status(200).json(result[0]);
    });
};

// Update Customize Accessory (only name, price, and quantity)
exports.updateCustomizeAccessory = (req, res) => {
    const { id } = req.params;
    const { name, price, quantity } = req.body;
    
    const sql = "UPDATE customize_accessories SET name=?, price=?, quantity=? WHERE id=?";
    db.query(sql, [name, price, quantity, id], (err, result) => {
        if (err) return res.status(500).json({ error: err.message });
        res.status(200).json({ message: "Customize Accessory updated successfully!" });
    });
};

// Delete Customize Accessory
exports.deleteCustomizeAccessory = (req, res) => {
    const { id } = req.params;
    const sql = "DELETE FROM customize_accessories WHERE id=?";
    db.query(sql, [id], (err, result) => {
        if (err) return res.status(500).json({ error: err.message });
        res.status(200).json({ message: "Customize Accessory deleted successfully!" });
    }); 
};
