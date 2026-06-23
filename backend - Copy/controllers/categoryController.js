const db = require("../database/db");

// GET ALL CATEGORIES
exports.getCategories = (req, res) => {
    db.all(
        "SELECT * FROM categories ORDER BY created_at DESC",
        [],
        (err, rows) => {
            if (err) {
                return res.status(500).json(err);
            }
            res.json(rows);
        }
    );
};

// GET SINGLE CATEGORY BY ID
exports.getCategoryById = (req, res) => {
    const categoryId = req.params.id;

    db.get(
        "SELECT * FROM categories WHERE id = ?",
        [categoryId],
        (err, row) => {
            if (err) {
                return res.status(500).json(err);
            }
            if (!row) {
                return res.status(404).json({
                    message: "Category not found"
                });
            }
            res.json(row);
        }
    );
};

// ADD CATEGORY
exports.createCategory = (req, res) => {
    const { name, slug } = req.body;

    if (!name) {
        return res.status(400).json({
            message: "Category name is required"
        });
    }

    db.run(
        `
        INSERT INTO categories (name, slug)
        VALUES (?, ?)
        `,
        [name, slug || name.toLowerCase().replace(/\s+/g, '-')],
        function(err) {
            if (err) {
                return res.status(500).json({ error: err.message });
            }
            res.json({
                success: true,
                categoryId: this.lastID
            });
        }
    );
};

// UPDATE CATEGORY
exports.updateCategory = (req, res) => {
    const categoryId = req.params.id;
    const { name, slug } = req.body;

    if (!name) {
        return res.status(400).json({
            message: "Category name is required"
        });
    }

    db.run(
        `
        UPDATE categories
        SET name = ?, slug = ?
        WHERE id = ?
        `,
        [
            name,
            slug || name.toLowerCase().replace(/\s+/g, '-'),
            categoryId
        ],
        function(err) {
            if (err) {
                return res.status(500).json({ error: err.message });
            }
            if (this.changes === 0) {
                return res.status(404).json({ message: "Category not found" });
            }
            res.json({
                success: true,
                changes: this.changes
            });
        }
    );
};

// DELETE CATEGORY
exports.deleteCategory = (req, res) => {
    const categoryId = req.params.id;

    // Set category_id to NULL for all products in this category
    db.serialize(() => {
        db.run("UPDATE products SET category_id = NULL WHERE category_id = ?", [categoryId]);
        
        db.run(
            "DELETE FROM categories WHERE id = ?",
            [categoryId],
            function(err) {
                if (err) {
                    return res.status(500).json({ error: err.message });
                }
                if (this.changes === 0) {
                    return res.status(404).json({ message: "Category not found" });
                }
                res.json({
                    success: true,
                    message: "Category deleted successfully"
                });
            }
        );
    });
};