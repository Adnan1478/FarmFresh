const Product = require("../models/product.model");
const Category = require("../models/category.model");

const slugify = (text) => {
  return text
    .toString()
    .toLowerCase()
    .trim()
    .replace(/\s+/g, "-")
    .replace(/[^\w\-]+/g, "")
    .replace(/\-\-+/g, "-");
};

// @desc    Get all products with category population
// @route   GET /api/products
// @access  Public
exports.getProducts = async (req, res) => {
  try {
    const { category, search, filter } = req.query;
    let query = { isActive: true };

    // Search filter
    if (search) {
      query.$or = [
        { name: { $regex: search, $options: "i" } },
        { description: { $regex: search, $options: "i" } }
      ];
    }

    // Category filter by ID or slug
    if (category) {
      const catDoc = await Category.findOne({
        $or: [{ _id: category.match(/^[0-9a-fA-F]{24}$/) ? category : null }, { slug: category }]
      });
      if (catDoc) {
        query.category = catDoc._id;
      }
    }

    if (filter === "organic") {
      query.isOrganic = true;
    }

    const products = await Product.find(query)
      .populate("category", "name slug image")
      .sort({ createdAt: -1 });

    return res.json({
      success: true,
      count: products.length,
      data: products
    });
  } catch (error) {
    console.error("Get Products Error:", error);
    return res.status(500).json({ success: false, message: "Error fetching products" });
  }
};

// @desc    Get single product by ID
// @route   GET /api/products/:id
// @access  Public
exports.getProductById = async (req, res) => {
  try {
    const product = await Product.findById(req.params.id).populate("category", "name slug image");
    if (!product) {
      return res.status(404).json({ success: false, message: "Product not found" });
    }
    return res.json({ success: true, data: product });
  } catch (error) {
    return res.status(500).json({ success: false, message: "Error fetching product" });
  }
};

// @desc    Create product (Admin) — Requires valid category ID!
// @route   POST /api/products
// @access  Private (Admin)
exports.createProduct = async (req, res) => {
  try {
    const {
      name,
      description,
      category,
      images,
      price,
      discountPrice,
      unit,
      stock,
      minOrderQuantity,
      maxOrderQuantity,
      isOrganic,
      isFeatured
    } = req.body;

    if (!name || !description || !category || price === undefined || !unit) {
      return res.status(400).json({
        success: false,
        message: "Name, description, category, price, and unit are required fields"
      });
    }

    // Verify Category exists in MongoDB
    const categoryDoc = await Category.findById(category);
    if (!categoryDoc) {
      return res.status(400).json({
        success: false,
        message: "Invalid Category ID. Please create a category first before adding products."
      });
    }

    const generatedSlug = slugify(name) + "-" + Date.now().toString().slice(-4);

    const newProduct = await Product.create({
      name: name.trim(),
      slug: generatedSlug,
      description: description.trim(),
      category: categoryDoc._id,
      images: images || [],
      price: Number(price),
      discountPrice: discountPrice ? Number(discountPrice) : undefined,
      unit,
      stock: stock !== undefined ? Number(stock) : 0,
      minOrderQuantity: minOrderQuantity || 1,
      maxOrderQuantity: maxOrderQuantity || 20,
      isOrganic: Boolean(isOrganic),
      isFeatured: Boolean(isFeatured)
    });

    const populated = await Product.findById(newProduct._id).populate("category", "name slug image");

    return res.status(201).json({
      success: true,
      message: "Product created successfully",
      data: populated
    });
  } catch (error) {
    console.error("Create Product Error:", error);
    return res.status(500).json({
      success: false,
      message: error.message || "Error creating product"
    });
  }
};

// @desc    Update product (Admin)
// @route   PUT /api/products/:id
// @access  Private (Admin)
exports.updateProduct = async (req, res) => {
  try {
    let product = await Product.findById(req.params.id);
    if (!product) {
      return res.status(404).json({ success: false, message: "Product not found" });
    }

    const {
      name,
      description,
      category,
      images,
      price,
      discountPrice,
      unit,
      stock,
      isOrganic,
      isFeatured,
      isActive
    } = req.body;

    if (name) {
      product.name = name.trim();
      product.slug = slugify(name) + "-" + Date.now().toString().slice(-4);
    }
    if (description !== undefined) product.description = description.trim();
    if (category) {
      const catExists = await Category.findById(category);
      if (!catExists) {
        return res.status(400).json({ success: false, message: "Selected category does not exist" });
      }
      product.category = category;
    }
    if (images !== undefined) product.images = images;
    if (price !== undefined) product.price = Number(price);
    if (discountPrice !== undefined) product.discountPrice = Number(discountPrice);
    if (unit) product.unit = unit;
    if (stock !== undefined) product.stock = Number(stock);
    if (isOrganic !== undefined) product.isOrganic = Boolean(isOrganic);
    if (isFeatured !== undefined) product.isFeatured = Boolean(isFeatured);
    if (isActive !== undefined) product.isActive = Boolean(isActive);

    await product.save();

    const populated = await Product.findById(product._id).populate("category", "name slug image");

    return res.json({
      success: true,
      message: "Product updated successfully",
      data: populated
    });
  } catch (error) {
    console.error("Update Product Error:", error);
    return res.status(500).json({ success: false, message: "Error updating product" });
  }
};

// @desc    Delete product (Admin)
// @route   DELETE /api/products/:id
// @access  Private (Admin)
exports.deleteProduct = async (req, res) => {
  try {
    const product = await Product.findById(req.params.id);
    if (!product) {
      return res.status(404).json({ success: false, message: "Product not found" });
    }

    await product.deleteOne();

    return res.json({
      success: true,
      message: "Product deleted successfully"
    });
  } catch (error) {
    console.error("Delete Product Error:", error);
    return res.status(500).json({ success: false, message: "Error deleting product" });
  }
};
