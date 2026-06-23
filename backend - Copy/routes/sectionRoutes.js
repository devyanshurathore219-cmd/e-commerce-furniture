const express = require("express");

const router = express.Router();

const section =
require("../controllers/sectionController");

// GET ALL SECTIONS FOR A PRODUCT
router.get(
    "/:productId",
    section.getSections
);

// CREATE SECTION
router.post(
    "/",
    section.createSection
);

// UPDATE SECTION
router.put(
    "/:id",
    section.updateSection
);

// DELETE SECTION
router.delete(
    "/:id",
    section.deleteSection
);

module.exports = router;
