const express = require("express");
const router = express.Router();
const enquiryController = require("../controllers/enquiryController");

// GET /api/enquiries - List all enquiries
router.get("/", enquiryController.getEnquiries);

// GET /api/enquiries/:id - Get single enquiry
router.get("/:id", enquiryController.getEnquiry);

// POST /api/enquiries - Create a new enquiry
router.post("/", enquiryController.createEnquiry);

// PUT /api/enquiries/:id/contacted - Mark as contacted
router.put("/:id/contacted", enquiryController.markContacted);

// DELETE /api/enquiries/:id - Delete an enquiry
router.delete("/:id", enquiryController.deleteEnquiry);

module.exports = router;