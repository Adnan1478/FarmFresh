const cloudinary = require("cloudinary").v2;
const fs = require("fs");

// Configure Cloudinary from environment variables
const configureCloudinary = () => {
  const cloud_name = process.env.CLOUDINARY_CLOUD_NAME || process.env.CLOUD_NAME;
  const api_key = process.env.CLOUDINARY_API_KEY;
  const api_secret = process.env.CLOUDINARY_API_SECRET;

  if (process.env.CLOUDINARY_URL) {
    cloudinary.config();
  } else if (cloud_name && api_key && api_secret) {
    cloudinary.config({
      cloud_name,
      api_key,
      api_secret,
      secure: true,
    });
  }
};

configureCloudinary();

// Upload Buffer directly to Cloudinary (Memory Storage - No disk writing)
const uploadBufferToCloudinary = (buffer, folder = "farmfresh_uploads") => {
  configureCloudinary();

  return new Promise((resolve, reject) => {
    const uploadStream = cloudinary.uploader.upload_stream(
      {
        folder: folder,
        resource_type: "auto",
      },
      (error, result) => {
        if (error) {
          console.error("Cloudinary Buffer Upload Error:", error);
          return reject(error);
        }
        resolve({
          success: true,
          url: result.secure_url,
          public_id: result.public_id,
        });
      }
    );

    uploadStream.end(buffer);
  });
};

// Upload local file to Cloudinary
const uploadToCloudinary = async (filePath, folder = "farmfresh_uploads") => {
  configureCloudinary();

  try {
    const result = await cloudinary.uploader.upload(filePath, {
      folder: folder,
      resource_type: "auto",
    });

    if (fs.existsSync(filePath)) {
      fs.unlinkSync(filePath);
    }

    return {
      success: true,
      url: result.secure_url,
      public_id: result.public_id,
    };
  } catch (error) {
    console.error("Cloudinary Upload Error:", error);
    throw error;
  }
};

module.exports = {
  cloudinary,
  uploadToCloudinary,
  uploadBufferToCloudinary,
};
