const express = require("express");

const router = express.Router();

const product =
require("../controllers/productController");

// GET /api/products - Get all products
router.get(
    "/",
    product.getProducts
);

// GET /api/products/:id - Get single product by ID
router.get(
    "/:id",
    product.getProductById
);

// GET /api/products/:id/gallery - Get product gallery
router.get(
    "/:id/gallery",
    product.getGallery
);

// GET /api/products/:id/faqs - Get product FAQs
router.get(
    "/:id/faqs",
    product.getFaqs
);

// GET /api/products/:id/specs - Get product specifications
router.get(
    "/:id/specs",
    product.getSpecs
);

// POST /api/products - Create a new product
router.post(
    "/",
    product.createProduct
);

// PUT /api/products/:id - Update a product
router.put(
    "/:id",
    product.updateProduct
);

// DELETE /api/products/:id - Delete a product
router.delete(
    "/:id",
    product.deleteProduct
);

module.exports = router;
