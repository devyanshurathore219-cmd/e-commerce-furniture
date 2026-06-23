const express = require("express");

const router = express.Router();

const spec = require("../controllers/specController");

// GET /api/specs/:productId - Get specifications for a product
router.get(
    "/:productId",
    spec.getSpecs
);

// POST /api/specs - Create a new specification
router.post(
    "/",
    spec.createSpec
);

// DELETE /api/specs/:id - Delete a specification
router.delete(
    "/:id",
    spec.deleteSpec
);

module.exports = router;