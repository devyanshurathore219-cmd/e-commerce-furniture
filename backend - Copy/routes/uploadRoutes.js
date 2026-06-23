const express = require("express");
const router = express.Router();
const upload = require("../middleware/upload");
const uploadController = require("../controllers/uploadController");

// POST /api/upload - Upload a single image
router.post("/", upload.single("image"), uploadController.uploadImage);

// GET /api/upload - List all uploaded images
router.get("/", uploadController.listImages);

module.exports = router;
