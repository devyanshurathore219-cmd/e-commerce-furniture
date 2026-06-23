const db = require("../database/db");

// GET ALL ENQUIRIES
exports.getEnquiries = (req, res) => {
    db.all(
        `SELECT e.*, p.name AS product_name
         FROM enquiries e
         LEFT JOIN products p ON e.product_id = p.id
         ORDER BY e.created_at DESC`,
        [],
        (err, rows) => {
            if (err) {
                return res.status(500).json({ error: err.message });
            }
            res.json(rows);
        }
    );
};

// GET SINGLE ENQUIRY
exports.getEnquiry = (req, res) => {
    const enquiryId = req.params.id;

    db.get(
        `SELECT e.*, p.name AS product_name
         FROM enquiries e
         LEFT JOIN products p ON e.product_id = p.id
         WHERE e.id = ?`,
        [enquiryId],
        (err, row) => {
            if (err) {
                return res.status(500).json({ error: err.message });
            }
            if (!row) {
                return res.status(404).json({ message: "Enquiry not found" });
            }
            res.json(row);
        }
    );
};

// CREATE ENQUIRY
exports.createEnquiry = (req, res) => {
    const { name, email, phone, product_id, message } = req.body;

    if (!name || !email) {
        return res.status(400).json({ error: "Name and email are required" });
    }

    db.run(
        `INSERT INTO enquiries (name, email, phone, product_id, message)
         VALUES (?, ?, ?, ?, ?)`,
        [name, email, phone || null, product_id || null, message || null],
        function (err) {
            if (err) {
                return res.status(500).json({ error: err.message });
            }

            res.status(201).json({
                success: true,
                enquiryId: this.lastID,
                message: "Enquiry submitted successfully"
            });
        }
    );
};

// MARK AS CONTACTED
exports.markContacted = (req, res) => {
    const enquiryId = req.params.id;

    db.run(
        `UPDATE enquiries
         SET status = 'contacted', contacted_at = CURRENT_TIMESTAMP
         WHERE id = ?`,
        [enquiryId],
        function (err) {
            if (err) {
                return res.status(500).json({ error: err.message });
            }
            if (this.changes === 0) {
                return res.status(404).json({ message: "Enquiry not found" });
            }
            res.json({
                success: true,
                message: "Enquiry marked as contacted"
            });
        }
    );
};

// DELETE ENQUIRY
exports.deleteEnquiry = (req, res) => {
    const enquiryId = req.params.id;

    db.run(
        "DELETE FROM enquiries WHERE id = ?",
        [enquiryId],
        function (err) {
            if (err) {
                return res.status(500).json({ error: err.message });
            }
            if (this.changes === 0) {
                return res.status(404).json({ message: "Enquiry not found" });
            }
            res.json({
                success: true,
                message: "Enquiry deleted successfully"
            });
        }
    );
};