const express = require("express");
const cors = require("cors");
const bodyParser = require("body-parser");
const dotenv = require("dotenv");
const authRoutes = require("./routes/authRoutes");
const userRoutes = require("./routes/userRoutes");
const categoryRoutes = require("./routes/categoryRoutes");
const productsRoutes = require("./routes/productsRoutes");
const accessoryRoutes = require("./routes/accessoryRoutes");
const accessoriesCustomizeRoutes = require("./routes/accessoriesCustomizeRoutes");  // Ensure this path is correct
const merchandiseRoutes = require("./routes/merchandiseRoutes");
const multer = require("multer");
const path = require("path");

// ✅ Initialize the app FIRST
dotenv.config();
const app = express();

// ✅ Apply CORS
app.use(cors({
    origin: ["http://localhost:3000", "http://localhost:3001"],
    methods: ["GET", "POST", "PUT", "DELETE"],
    allowedHeaders: ["Content-Type", "Authorization"]
}));

// ✅ Use body-parser before routes
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: true }));

// ✅ Serve static files for uploaded images
app.use("/uploads", express.static(path.join(__dirname, "uploads")));

// ✅ Multer configuration for image uploads
const storage = multer.diskStorage({
    destination: (req, file, cb) => {
        cb(null, "uploads/");
    },
    filename: (req, file, cb) => {
        cb(null, `${Date.now()}_${file.originalname}`);
    }
});

const upload = multer({
    storage,
    limits: { fileSize: 5 * 1024 * 1024 }, // 5MB file size limit
    fileFilter: (req, file, cb) => {
        const fileTypes = /jpeg|jpg|png|gif/;
        const mimeType = fileTypes.test(file.mimetype);
        const extname = fileTypes.test(path.extname(file.originalname).toLowerCase());

        if (mimeType && extname) {
            return cb(null, true);
        } else {
            cb(new Error("Only images are allowed"), false);
        }
    }
});


// ✅ Route for accessories with proper multer handling
app.post('/api/accessories', upload.fields([
    { name: 'files', maxCount: 5 },          // Up to 5 'files'
    { name: 'slide_images', maxCount: 5 }    // Up to 5 'slide_images'
]), (req, res) => {
    console.log('Files:', req.files);   // Verify file uploads
    console.log('Body:', req.body);

    const { name, description, category, price, quantity, color } = req.body;

    const files = req.files['files'] || [];
    const slideImages = req.files['slide_images'] || [];

    res.status(201).json({
        message: "Stock added successfully",
        files: files.map(file => file.filename),
        slideImages: slideImages.map(file => file.filename)
    });
});

// ✅ Error handling middleware for multer
app.use((err, req, res, next) => {
    if (err instanceof multer.MulterError) {
        return res.status(400).json({ error: err.message });
    }
    next();
});

// ✅ Define Routes
app.use("/api/accessories", accessoryRoutes);
app.use("/api/auth", authRoutes);
app.use("/api", userRoutes);
app.use("/api/categories", categoryRoutes);
app.use("/api/product", productsRoutes);
app.use("/api/accessories-customize", accessoriesCustomizeRoutes);  // Use the customize route only once!
app.use("/api/merchandise", merchandiseRoutes);

// ✅ Start the server
const PORT = process.env.PORT || 5000;
app.listen(PORT, () => {
    console.log(`Server running on port ${PORT}`);
});
