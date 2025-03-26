const express = require("express");
const cors = require("cors");
const bodyParser = require("body-parser");
const dotenv = require("dotenv");
const authRoutes = require("./routes/authRoutes");
const userRoutes = require("./routes/userRoutes");
const categoryRoutes = require("./routes/categoryRoutes");
const productsRoutes = require("./routes/productsRoutes");
const accessoryRoutes = require("./routes/accessoryRoutes");
const multer = require("multer");
const path = require("path");

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
const upload = multer({ storage });

// ✅ Error handling middleware for multer
app.use((err, req, res, next) => {
    if (err instanceof multer.MulterError) {
        return res.status(400).json({ error: err.message });
    }
    next();
});

// ✅ Use upload middleware with the correct field name "images"
app.use("/api/accessories", upload.array("files", 10), accessoryRoutes);  

app.use("/api/accessories", accessoryRoutes);  // Regular routes
app.use("/api/auth", authRoutes);
app.use("/api", userRoutes);
app.use("/api/categories", categoryRoutes);
app.use("/api/product", productsRoutes);

const PORT = process.env.PORT || 5000;
app.listen(PORT, () => {
    console.log(`Server running on port ${PORT}`);
});
