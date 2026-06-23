const fs = require("fs");
const path = require("path");

// Single image upload
exports.uploadImage = (req, res) => {
  if (!req.file) {
    return res.status(400).json({ error: "No file uploaded" });
  }

  const imageUrl = "/uploads/" + req.file.filename;

  res.json({
    imageUrl: imageUrl,
  });
};

// List all uploaded images
exports.listImages = (req, res) => {
  const uploadDir = path.join(__dirname, "../uploads");

  fs.readdir(uploadDir, (err, files) => {
    if (err) {
      return res.status(500).json({ error: "Failed to read uploads directory" });
    }

    // Filter image files and map to URLs
    const imageExtensions = /\.(jpeg|jpg|png|gif|webp|svg|bmp|tiff|ico)$/i;
    const images = files
      .filter((file) => imageExtensions.test(file))
      .map((file) => ({
        filename: file,
        url: "/uploads/" + file,
        uploadedAt: fs.statSync(path.join(uploadDir, file)).mtime,
      }))
      .sort((a, b) => new Date(b.uploadedAt) - new Date(a.uploadedAt));

    res.json(images);
  });
};