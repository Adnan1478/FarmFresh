const mongoose = require("mongoose");
const dotenv = require("dotenv");
const path = require("path");
const Category = require("../models/category.model");
const Product = require("../models/product.model");

dotenv.config({ path: path.join(__dirname, "../.env") });

const mongoURI = process.env.MONGO_URI || "mongodb://127.0.0.1:27017/FarmFresh";

const slugify = (text) => {
  return text
    .toString()
    .toLowerCase()
    .trim()
    .replace(/\s+/g, "-")
    .replace(/[^\w\-]+/g, "")
    .replace(/\-\-+/g, "-");
};

const categoriesData = [
  {
    name: "Vegetables",
    description: "Farm-fresh organic green vegetables harvested daily.",
    image: "https://images.unsplash.com/photo-1540420773420-3366772f4999?w=600&q=80"
  },
  {
    name: "Fruits",
    description: "Sweet, juicy, naturally ripened seasonal fruits.",
    image: "https://images.unsplash.com/photo-1619566636858-adf3ef46400b?w=600&q=80"
  },
  {
    name: "Dry Fruits",
    description: "Premium dried fruits, dates, raisins & figs.",
    image: "https://images.unsplash.com/photo-1599599810694-b5b37304c041?w=600&q=80"
  },
  {
    name: "Nuts",
    description: "Crunchy almonds, cashews, walnuts & pistachios.",
    image: "https://images.unsplash.com/photo-1508061252966-dfd33f43a252?w=600&q=80"
  },
  {
    name: "Juices",
    description: "100% natural cold-pressed fruit juices with no added sugar.",
    image: "https://images.unsplash.com/photo-1600271886742-f049cd451bba?w=600&q=80"
  }
];

const productsData = [
  // --- VEGETABLES (5) ---
  {
    categoryName: "Vegetables",
    name: "Tomato",
    description: "Juicy red farm-fresh tomatoes packed with Lycopene and Vitamin C.",
    price: 40,
    discountPrice: 32,
    unit: "kg",
    stock: 50,
    isOrganic: true,
    isFeatured: true,
    images: ["https://images.unsplash.com/photo-1592924357228-91a4daadcfea?w=600&q=80"]
  },
  {
    categoryName: "Vegetables",
    name: "Potato",
    description: "Fresh organic brown potatoes perfect for cooking and roasting.",
    price: 30,
    discountPrice: 25,
    unit: "kg",
    stock: 60,
    isOrganic: false,
    isFeatured: false,
    images: ["https://images.unsplash.com/photo-1518977676601-b53f82aba655?w=600&q=80"]
  },
  {
    categoryName: "Vegetables",
    name: "Onion",
    description: "Essential farm-harvested red onions rich in flavor.",
    price: 35,
    discountPrice: 30,
    unit: "kg",
    stock: 45,
    isOrganic: false,
    isFeatured: true,
    images: ["https://images.unsplash.com/photo-1618512496248-a07fe83aa8cb?w=600&q=80"]
  },
  {
    categoryName: "Vegetables",
    name: "Carrot",
    description: "Crunchy, sweet orange carrots directly from organic soils.",
    price: 50,
    discountPrice: 42,
    unit: "kg",
    stock: 35,
    isOrganic: true,
    isFeatured: false,
    images: ["https://images.unsplash.com/photo-1598170845058-12ef4a457c3b?w=600&q=80"]
  },
  {
    categoryName: "Vegetables",
    name: "Spinach",
    description: "Freshly cut green leafy spinach bundles rich in iron & folate.",
    price: 25,
    discountPrice: 20,
    unit: "piece",
    stock: 40,
    isOrganic: true,
    isFeatured: true,
    images: ["https://images.unsplash.com/photo-1576045057995-568f588f82fb?w=600&q=80"]
  },

  // --- FRUITS (5) ---
  {
    categoryName: "Fruits",
    name: "Apple",
    description: "Sweet, crunchy Royal Gala red apples imported from Himachal orchards.",
    price: 160,
    discountPrice: 140,
    unit: "kg",
    stock: 30,
    isOrganic: false,
    isFeatured: true,
    images: ["https://images.unsplash.com/photo-1560806887-1e4cd0b6cbd6?w=600&q=80"]
  },
  {
    categoryName: "Fruits",
    name: "Banana",
    description: "Naturally ripened yellow bananas high in potassium and energy.",
    price: 60,
    discountPrice: 50,
    unit: "dozen",
    stock: 40,
    isOrganic: true,
    isFeatured: false,
    images: ["https://images.unsplash.com/photo-1571771894821-ce9b6c11b08e?w=600&q=80"]
  },
  {
    categoryName: "Fruits",
    name: "Mango",
    description: "King of fruits! Sweet, rich, naturally ripened Ratnagiri Alphonso mangoes.",
    price: 500,
    discountPrice: 450,
    unit: "dozen",
    stock: 20,
    isOrganic: true,
    isFeatured: true,
    images: ["https://images.unsplash.com/photo-1553279768-865429fa0078?w=600&q=80"]
  },
  {
    categoryName: "Fruits",
    name: "Orange",
    description: "Juicy, sweet Nagpur oranges rich in Vitamin C.",
    price: 90,
    discountPrice: 80,
    unit: "kg",
    stock: 35,
    isOrganic: false,
    isFeatured: false,
    images: ["https://images.unsplash.com/photo-1611080626919-7cf5a9dbab5b?w=600&q=80"]
  },
  {
    categoryName: "Fruits",
    name: "Grapes",
    description: "Sweet, seedless black grapes carefully handpicked.",
    price: 120,
    discountPrice: 100,
    unit: "kg",
    stock: 25,
    isOrganic: true,
    isFeatured: true,
    images: ["https://images.unsplash.com/photo-1537640538966-79f369143f8f?w=600&q=80"]
  },

  // --- DRY FRUITS (5) ---
  {
    categoryName: "Dry Fruits",
    name: "Dates",
    description: "Soft, sweet, premium imported Kimia dates rich in fiber.",
    price: 280,
    discountPrice: 250,
    unit: "kg",
    stock: 25,
    isOrganic: true,
    isFeatured: true,
    images: ["https://images.unsplash.com/photo-1599599810694-b5b37304c041?w=600&q=80"]
  },
  {
    categoryName: "Dry Fruits",
    name: "Raisins",
    description: "Golden organic raisins (Kishmish) packed with natural sweetness.",
    price: 180,
    discountPrice: 160,
    unit: "kg",
    stock: 30,
    isOrganic: true,
    isFeatured: false,
    images: ["https://images.unsplash.com/photo-1599599810694-b5b37304c041?w=600&q=80"]
  },
  {
    categoryName: "Dry Fruits",
    name: "Dried Figs",
    description: "Premium high-grade dried figs (Anjeer) rich in calcium and minerals.",
    price: 650,
    discountPrice: 590,
    unit: "kg",
    stock: 15,
    isOrganic: true,
    isFeatured: true,
    images: ["https://images.unsplash.com/photo-1606923829579-0cb981a82490?w=600&q=80"]
  },
  {
    categoryName: "Dry Fruits",
    name: "Dried Apricots",
    description: "Sweet and tangy Turkish sun-dried apricots.",
    price: 450,
    discountPrice: 400,
    unit: "kg",
    stock: 20,
    isOrganic: false,
    isFeatured: false,
    images: ["https://images.unsplash.com/photo-1599599810694-b5b37304c041?w=600&q=80"]
  },
  {
    categoryName: "Dry Fruits",
    name: "Dried Cranberries",
    description: "Sweetened sliced dried cranberries great for snacks and baking.",
    price: 390,
    discountPrice: 350,
    unit: "kg",
    stock: 22,
    isOrganic: false,
    isFeatured: false,
    images: ["https://images.unsplash.com/photo-1599599810694-b5b37304c041?w=600&q=80"]
  },

  // --- NUTS (5) ---
  {
    categoryName: "Nuts",
    name: "Almonds",
    description: "High-grade crunchy California almonds rich in Vitamin E & healthy fats.",
    price: 450,
    discountPrice: 400,
    unit: "kg",
    stock: 40,
    isOrganic: true,
    isFeatured: true,
    images: ["https://images.unsplash.com/photo-1508061252966-dfd33f43a252?w=600&q=80"]
  },
  {
    categoryName: "Nuts",
    name: "Cashews",
    description: "Whole jumbo W240 premium cashew nuts (Kaju).",
    price: 550,
    discountPrice: 490,
    unit: "kg",
    stock: 35,
    isOrganic: true,
    isFeatured: true,
    images: ["https://images.unsplash.com/photo-1508061252966-dfd33f43a252?w=600&q=80"]
  },
  {
    categoryName: "Nuts",
    name: "Walnuts",
    description: "Brain-healthy raw Chilean inshell walnuts (Akhrot) rich in Omega-3.",
    price: 680,
    discountPrice: 620,
    unit: "kg",
    stock: 25,
    isOrganic: true,
    isFeatured: true,
    images: ["https://images.unsplash.com/photo-1508061252966-dfd33f43a252?w=600&q=80"]
  },
  {
    categoryName: "Nuts",
    name: "Pistachios",
    description: "Lightly roasted salted pistachios (Pista) in shell.",
    price: 750,
    discountPrice: 690,
    unit: "kg",
    stock: 20,
    isOrganic: false,
    isFeatured: false,
    images: ["https://images.unsplash.com/photo-1508061252966-dfd33f43a252?w=600&q=80"]
  },
  {
    categoryName: "Nuts",
    name: "Peanuts",
    description: "Raw organic groundnut peanuts (Moongphali) rich in protein.",
    price: 110,
    discountPrice: 95,
    unit: "kg",
    stock: 50,
    isOrganic: true,
    isFeatured: false,
    images: ["https://images.unsplash.com/photo-1508061252966-dfd33f43a252?w=600&q=80"]
  },

  // --- JUICES (5) ---
  {
    categoryName: "Juices",
    name: "Orange Juice",
    description: "100% pure squeezed citrus orange juice with no preservatives.",
    price: 110,
    discountPrice: 95,
    unit: "liter",
    stock: 30,
    isOrganic: true,
    isFeatured: true,
    images: ["https://images.unsplash.com/photo-1613478223719-2ab802602423?w=600&q=80"]
  },
  {
    categoryName: "Juices",
    name: "Mango Juice",
    description: "Delicious cold pulp Alphonso mango fruit juice.",
    price: 95,
    discountPrice: 85,
    unit: "liter",
    stock: 25,
    isOrganic: true,
    isFeatured: true,
    images: ["https://images.unsplash.com/photo-1600271886742-f049cd451bba?w=600&q=80"]
  },
  {
    categoryName: "Juices",
    name: "Apple Juice",
    description: "Refreshing cold-pressed natural apple juice.",
    price: 120,
    discountPrice: 105,
    unit: "liter",
    stock: 20,
    isOrganic: false,
    isFeatured: false,
    images: ["https://images.unsplash.com/photo-1600271886742-f049cd451bba?w=600&q=80"]
  },
  {
    categoryName: "Juices",
    name: "Pineapple Juice",
    description: "Tangy & sweet tropical fresh pineapple juice.",
    price: 100,
    discountPrice: 90,
    unit: "liter",
    stock: 25,
    isOrganic: true,
    isFeatured: false,
    images: ["https://images.unsplash.com/photo-1600271886742-f049cd451bba?w=600&q=80"]
  },
  {
    categoryName: "Juices",
    name: "Pomegranate Juice",
    description: "Antioxidant rich pure fresh pomegranate (Anaar) juice.",
    price: 140,
    discountPrice: 125,
    unit: "liter",
    stock: 18,
    isOrganic: true,
    isFeatured: true,
    images: ["https://images.unsplash.com/photo-1600271886742-f049cd451bba?w=600&q=80"]
  }
];

const seedDB = async () => {
  try {
    await mongoose.connect(mongoURI);
    console.log("Connected to MongoDB for Seeding...");

    // 1. Seed Categories
    const categoryMap = {};
    for (const cat of categoriesData) {
      const slug = slugify(cat.name);
      let existingCat = await Category.findOne({ name: cat.name });
      if (!existingCat) {
        existingCat = await Category.create({
          name: cat.name,
          slug,
          description: cat.description,
          image: cat.image,
          isActive: true
        });
        console.log(`✓ Created Category: ${cat.name}`);
      } else {
        existingCat.description = cat.description;
        existingCat.image = cat.image;
        await existingCat.save();
        console.log(`✓ Updated Category: ${cat.name}`);
      }
      categoryMap[cat.name] = existingCat._id;
    }

    // 2. Seed Products (5 per category)
    for (const prod of productsData) {
      const categoryId = categoryMap[prod.categoryName];
      if (!categoryId) continue;

      const slug = slugify(prod.name);
      let existingProd = await Product.findOne({ name: prod.name });

      if (!existingProd) {
        await Product.create({
          name: prod.name,
          slug: `${slug}-${Date.now().toString().slice(-4)}`,
          description: prod.description,
          category: categoryId,
          price: prod.price,
          discountPrice: prod.discountPrice,
          unit: prod.unit,
          stock: prod.stock,
          isOrganic: prod.isOrganic,
          isFeatured: prod.isFeatured,
          images: prod.images,
          isActive: true
        });
        console.log(`  └─ Created Product: ${prod.name} (${prod.categoryName})`);
      } else {
        existingProd.category = categoryId;
        existingProd.price = prod.price;
        existingProd.discountPrice = prod.discountPrice;
        existingProd.unit = prod.unit;
        existingProd.stock = prod.stock;
        existingProd.description = prod.description;
        existingProd.images = prod.images;
        await existingProd.save();
        console.log(`  └─ Updated Product: ${prod.name} (${prod.categoryName})`);
      }
    }

    console.log("\n🎉 Database Seeded Successfully with 5 Categories and 25 Products!");
    process.exit(0);
  } catch (err) {
    console.error("Seeding Error:", err);
    process.exit(1);
  }
};

seedDB();
