const multer = require("multer");
const path = require("path");

// In-Memory Storage: Buffers files in RAM for direct Cloudinary streaming without local disk clutters
const storage = multer.memoryStorage();

// Strict File Filter: Reject executable scripts, HTML, XML/SVG JavaScript injections
const fileFilter = (req, file, cb) => {
  // SVG (.svg) removed to prevent XML/SVG Script Execution (Stored XSS)
  const allowedExtensions = [".jpg", ".jpeg", ".png", ".webp", ".gif"];
  const allowedMimeTypes = ["image/jpeg", "image/png", "image/webp", "image/gif"];

  const ext = path.extname(file.originalname).toLowerCase();
  const mime = file.mimetype.toLowerCase();

  // Check both extension AND MIME type against whitelist
  if (allowedExtensions.includes(ext) && allowedMimeTypes.includes(mime)) {
    cb(null, true);
  } else {
    cb(
      new Error(
        "Security Guard: Unsafe file format rejected. Only binary images (.jpg, .jpeg, .png, .webp, .gif) are allowed."
      ),
      false
    );
  }
};

const upload = multer({
  storage,
  fileFilter,
  limits: {
    fileSize: 5 * 1024 * 1024, // 5MB Maximum File Size Limit
    files: 1, // Limit to 1 file per request
  },
});

module.exports = upload;