const express = require("express");
const { register, login ,googleSignup} = require("../controllers/authController");

const router = express.Router();

router.post("/signup", register);
router.post("/login", login);
router.post("/google-signup",googleSignup);

module.exports = router;
