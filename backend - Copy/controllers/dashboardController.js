const db = require("../database/db");

// GET DASHBOARD STATS
exports.getDashboardStats = (req, res) => {
    db.serialize(() => {
        const result = {};

        // Total Products
        db.get("SELECT COUNT(*) AS total FROM products", [], (err, row) => {
            if (err) return res.status(500).json({ error: err.message });
            result.totalProducts = row.total;

            // Total Categories
            db.get("SELECT COUNT(*) AS total FROM categories", [], (err, row) => {
                if (err) return res.status(500).json({ error: err.message });
                result.totalCategories = row.total;

                // Total Enquiries
                db.get("SELECT COUNT(*) AS total FROM enquiries", [], (err, row) => {
                    if (err) return res.status(500).json({ error: err.message });
                    result.totalEnquiries = row.total;

                    // Enquiries by status
                    db.get(`SELECT COUNT(CASE WHEN status = 'new' THEN 1 END) AS new_enquiries, COUNT(CASE WHEN status = 'contacted' THEN 1 END) AS contacted_enquiries FROM enquiries`, [], (err, row) => {
                        if (err) return res.status(500).json({ error: err.message });
                        result.newEnquiries = row.new_enquiries;
                        result.contactedEnquiries = row.contacted_enquiries;

                        // Published vs Draft products
                        db.get(`SELECT COUNT(CASE WHEN status = 'published' THEN 1 END) AS published_products, COUNT(CASE WHEN status = 'draft' THEN 1 END) AS draft_products FROM products`, [], (err, row) => {
                            if (err) return res.status(500).json({ error: err.message });
                            result.publishedProducts = row.published_products;
                            result.draftProducts = row.draft_products;

                            // Total Sections
                            db.get("SELECT COUNT(*) AS total FROM product_sections", [], (err, row) => {
                                if (err) return res.status(500).json({ error: err.message });
                                result.totalSections = row.total;

                                // Total Gallery Images
                                db.get("SELECT COUNT(*) AS total FROM product_gallery", [], (err, row) => {
                                    if (err) return res.status(500).json({ error: err.message });
                                    result.totalGalleryImages = row.total;

                                    // Total FAQs
                                    db.get("SELECT COUNT(*) AS total FROM product_faqs", [], (err, row) => {
                                        if (err) return res.status(500).json({ error: err.message });
                                        result.totalFaqs = row.total;

                                        // Total Specifications
                                        db.get("SELECT COUNT(*) AS total FROM product_specifications", [], (err, row) => {
                                            if (err) return res.status(500).json({ error: err.message });
                                            result.totalSpecs = row.total;

                                            // Recent enquiries (last 5)
                                            db.all(`SELECT e.*, p.name AS product_name FROM enquiries e LEFT JOIN products p ON e.product_id = p.id ORDER BY e.created_at DESC LIMIT 5`, [], (err, rows) => {
                                                if (err) return res.status(500).json({ error: err.message });
                                                result.recentEnquiries = rows;

                                                // Recent products (last 5)
                                                db.all(`SELECT id, name, price, status, created_at FROM products ORDER BY created_at DESC LIMIT 5`, [], (err, rows) => {
                                                    if (err) return res.status(500).json({ error: err.message });
                                                    result.recentProducts = rows;

                                                    // Products by category count
                                                    db.all(`SELECT c.name AS category_name, COUNT(p.id) AS product_count FROM categories c LEFT JOIN products p ON c.id = p.category_id GROUP BY c.id ORDER BY product_count DESC`, [], (err, rows) => {
                                                        if (err) return res.status(500).json({ error: err.message });
                                                        result.productsByCategory = rows;
                                                        res.json(result);
                                                    });
                                                });
                                            });
                                        });
                                    });
                                });
                            });
                        });
                    });
                });
            });
        });
    });
};