const express = require("express");
const multer = require("multer");
const router = express.Router();
const customizeAccessoriesController = require("../controllers/customizeAccessoriesController");

// Multer configuration for image uploads
const storage = multer.diskStorage({
    destination: (req, file, cb) => {
        cb(null, "uploads/");
    },
    filename: (req, file, cb) => {
        cb(null, `${Date.now()}-${file.originalname}`);
    },
});

const upload = multer({ storage });

// Routes
router.post("/", upload.array("images"), customizeAccessoriesController.createCustomizeAccessory);
router.get("/", customizeAccessoriesController.getCustomizeAccessories);
router.get("/:id", customizeAccessoriesController.getCustomizeAccessoryById);
router.put("/:id", customizeAccessoriesController.updateCustomizeAccessory);
router.delete("/:id", customizeAccessoriesController.deleteCustomizeAccessory);

module.exports = router;
