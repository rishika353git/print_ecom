const express = require("express");
const router = express.Router();
const productController = require("../controllers/productController");
const upload = require("../middlewares/productMiddleware");

// Add Product API
router.post("/add-product", upload.array("images", 2), productController.addProduct);router.post("/add-product", (req, res, next) => {
    console.log("Files received:", req.files);  // Log uploaded files
    console.log("Body:", req.body);             // Log form data
    next();
}, upload.array("images", 2), productController.addProduct);

router.get("/", productController.getAllProducts);
router.get("/:id", productController.getProductById);
router.put("/:id", productController.updateProduct);
router.delete("/:id", productController.deleteProduct);
router.get("/category/:category", productController.getProductsByCategory);

module.exports = router;