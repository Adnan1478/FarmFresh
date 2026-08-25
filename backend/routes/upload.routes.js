const express = require("express");
const router = express.Router();
const upload = require("../middlewares/upload.middleware");
const { uploadBufferToCloudinary } = require("../config/cloudinary");

// @desc    Upload image file directly to Cloudinary via memory buffer
// @route   POST /api/upload
// @access  Public / Private
router.post("/", (req, res) => {
  upload.single("image")(req, res, async (err) => {
    if (err) {
      return res.status(400).json({
        success: false,
        message: err.message || "Error processing image file",
      });
    }

    if (!req.file) {
      return res.status(400).json({
        success: false,
        message: "Please select an image file to upload",
      });
    }

    const cloudName = process.env.CLOUDINARY_CLOUD_NAME || process.env.CLOUD_NAME;
    const apiKey = process.env.CLOUDINARY_API_KEY;
    const isCloudinaryConfigured =
      cloudName &&
      apiKey &&
      cloudName !== "your_cloudinary_cloud_name" &&
      apiKey !== "your_cloudinary_api_key";

    try {
      if (isCloudinaryConfigured || process.env.CLOUDINARY_URL) {
        // Upload image buffer directly to Cloudinary CDN
        const result = await uploadBufferToCloudinary(req.file.buffer, "farmfresh_uploads");
        return res.json({
          success: true,
          message: "Image uploaded to Cloudinary successfully",
          url: result.url,
          public_id: result.public_id,
        });
      } else {
        return res.status(400).json({
          success: false,
          message: "Cloudinary API keys missing! Please add CLOUDINARY_CLOUD_NAME, CLOUDINARY_API_KEY, and CLOUDINARY_API_SECRET in backend/.env",
        });
      }
    } catch (uploadError) {
      console.error("Upload Route Error:", uploadError);
      return res.status(500).json({
        success: false,
        message: uploadError.message || "Error uploading image to Cloudinary",
      });
    }
  });
});

module.exports = router;
