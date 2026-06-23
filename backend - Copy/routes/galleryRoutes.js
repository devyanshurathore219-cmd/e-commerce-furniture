const express = require("express");

const router = express.Router();

const gallery = require("../controllers/galleryController");

// GET /api/gallery/:productId - Get gallery images for a product
router.get(
    "/:productId",
    gallery.getGallery
);

// POST /api/gallery - Create a new gallery image
router.post(
    "/",
    gallery.createGallery
);

// DELETE /api/gallery/:id - Delete a gallery image
router.delete(
    "/:id",
    gallery.deleteGallery
);

module.exports = router;