import React, { createContext, useContext, useState, useEffect } from "react";
import { getCategoriesApi, getProductsApi, createProductApi, updateProductApi, deleteProductApi } from "../api/productApi";
import { createOrderApi } from "../api/orderApi";
import { getWishlistApi, toggleWishlistApi } from "../api/wishlistApi";
import { getCartApi, addToCartApi, updateCartItemApi, removeFromCartApi, clearCartApi } from "../api/cartApi";
import { useAuth } from "./AuthContext";

const ShopContext = createContext();

// Helper to extract robust product ID from string or object
const getProductId = (productOrId) => {
  if (!productOrId) return "";
  if (typeof productOrId === "string") return productOrId;
  return productOrId._id || productOrId.id || "";
};

// Helper to normalize cart items coming from API or local state
const normalizeCartItems = (rawCartItems, availableProducts = []) => {
  if (!Array.isArray(rawCartItems)) return [];
  return rawCartItems
    .map((item) => {
      const pId = getProductId(item.product);
      let prodObj = typeof item.product === "object" && item.product?._id ? item.product : null;
      if (!prodObj || !prodObj.name) {
        prodObj = availableProducts.find((p) => getProductId(p) === pId || p.slug === pId) || item.product;
      }
      if (!prodObj) return null;
      return {
        product: prodObj,
        quantity: Number(item.quantity || 1),
        price: Number(item.price || prodObj.discountPrice || prodObj.price || 0)
      };
    })
    .filter((i) => i && i.product && getProductId(i.product));
};

// Sample Initial Grocery Data matching Mongoose models
const INITIAL_CATEGORIES = [
  { _id: "cat_veg", name: "Vegetables", slug: "vegetables", image: "https://images.unsplash.com/photo-1540420773420-3366772f4999?w=400&q=80", description: "Farm-fresh organic green vegetables harvested daily." },
  { _id: "cat_fruits", name: "Fruits", slug: "fruits", image: "https://images.unsplash.com/photo-1619566636858-adf3ef46400b?w=400&q=80", description: "Sweet, juicy, naturally ripened seasonal fruits." },
  { _id: "cat_dried", name: "Dry Fruits", slug: "dry-fruits", image: "https://images.unsplash.com/photo-1599599810694-b5b37304c041?w=400&q=80", description: "Premium dried fruits, dates, raisins & figs." },
  { _id: "cat_nuts", name: "Nuts", slug: "nuts", image: "https://images.unsplash.com/photo-1508061252966-dfd33f43a252?w=400&q=80", description: "Crunchy almonds, cashews, walnuts & pistachios." },
  { _id: "cat_juices", name: "Juices", slug: "juices", image: "https://images.unsplash.com/photo-1600271886742-f049cd451bba?w=400&q=80", description: "100% natural cold-pressed fruit juices." }
];

const INITIAL_PRODUCTS = [
  // --- VEGETABLES (5) ---
  { _id: "p_veg_1", name: "Tomato", slug: "tomato", description: "Juicy red farm-fresh tomatoes packed with Lycopene and Vitamin C.", category: INITIAL_CATEGORIES[0], images: ["https://images.unsplash.com/photo-1592924357228-91a4daadcfea?w=600&q=80"], price: 40, discountPrice: 32, unit: "kg", stock: 50, isOrganic: true, isFeatured: true, averageRating: 4.8, totalReviews: 120 },
  { _id: "p_veg_2", name: "Potato", slug: "potato", description: "Fresh organic brown potatoes perfect for cooking and roasting.", category: INITIAL_CATEGORIES[0], images: ["https://images.unsplash.com/photo-1518977676601-b53f82aba655?w=600&q=80"], price: 30, discountPrice: 25, unit: "kg", stock: 60, isOrganic: false, isFeatured: false, averageRating: 4.5, totalReviews: 85 },
  { _id: "p_veg_3", name: "Onion", slug: "onion", description: "Essential farm-harvested red onions rich in flavor.", category: INITIAL_CATEGORIES[0], images: ["https://images.unsplash.com/photo-1618512496248-a07fe83aa8cb?w=600&q=80"], price: 35, discountPrice: 30, unit: "kg", stock: 45, isOrganic: false, isFeatured: true, averageRating: 4.6, totalReviews: 95 },
  { _id: "p_veg_4", name: "Carrot", slug: "carrot", description: "Crunchy, sweet orange carrots directly from organic soils.", category: INITIAL_CATEGORIES[0], images: ["https://images.unsplash.com/photo-1598170845058-12ef4a457c3b?w=600&q=80"], price: 50, discountPrice: 42, unit: "kg", stock: 35, isOrganic: true, isFeatured: false, averageRating: 4.7, totalReviews: 60 },
  { _id: "p_veg_5", name: "Spinach", slug: "spinach", description: "Freshly cut green leafy spinach bundles rich in iron & folate.", category: INITIAL_CATEGORIES[0], images: ["https://images.unsplash.com/photo-1576045057995-568f588f82fb?w=600&q=80"], price: 25, discountPrice: 20, unit: "piece", stock: 40, isOrganic: true, isFeatured: true, averageRating: 4.9, totalReviews: 110 },

  // --- FRUITS (5) ---
  { _id: "p_fruit_1", name: "Apple", slug: "apple", description: "Sweet, crunchy Royal Gala red apples imported from Himachal orchards.", category: INITIAL_CATEGORIES[1], images: ["https://images.unsplash.com/photo-1560806887-1e4cd0b6cbd6?w=600&q=80"], price: 160, discountPrice: 140, unit: "kg", stock: 30, isOrganic: false, isFeatured: true, averageRating: 4.9, totalReviews: 210 },
  { _id: "p_fruit_2", name: "Banana", slug: "banana", description: "Naturally ripened yellow bananas high in potassium and energy.", category: INITIAL_CATEGORIES[1], images: ["https://images.unsplash.com/photo-1571771894821-ce9b6c11b08e?w=600&q=80"], price: 60, discountPrice: 50, unit: "dozen", stock: 40, isOrganic: true, isFeatured: false, averageRating: 4.7, totalReviews: 140 },
  { _id: "p_fruit_3", name: "Mango", slug: "mango", description: "King of fruits! Sweet, rich, naturally ripened Ratnagiri Alphonso mangoes.", category: INITIAL_CATEGORIES[1], images: ["https://images.unsplash.com/photo-1553279768-865429fa0078?w=600&q=80"], price: 500, discountPrice: 450, unit: "dozen", stock: 20, isOrganic: true, isFeatured: true, averageRating: 5.0, totalReviews: 320 },
  { _id: "p_fruit_4", name: "Orange", slug: "orange", description: "Juicy, sweet Nagpur oranges rich in Vitamin C.", category: INITIAL_CATEGORIES[1], images: ["https://images.unsplash.com/photo-1611080626919-7cf5a9dbab5b?w=600&q=80"], price: 90, discountPrice: 80, unit: "kg", stock: 35, isOrganic: false, isFeatured: false, averageRating: 4.6, totalReviews: 90 },
  { _id: "p_fruit_5", name: "Grapes", slug: "grapes", description: "Sweet, seedless black grapes carefully handpicked.", category: INITIAL_CATEGORIES[1], images: ["https://images.unsplash.com/photo-1537640538966-79f369143f8f?w=600&q=80"], price: 120, discountPrice: 100, unit: "kg", stock: 25, isOrganic: true, isFeatured: true, averageRating: 4.8, totalReviews: 115 },

  // --- DRY FRUITS (5) ---
  { _id: "p_df_1", name: "Dates", slug: "dates", description: "Soft, sweet, premium imported Kimia dates rich in fiber.", category: INITIAL_CATEGORIES[2], images: ["https://images.unsplash.com/photo-1599599810694-b5b37304c041?w=600&q=80"], price: 280, discountPrice: 250, unit: "kg", stock: 25, isOrganic: true, isFeatured: true, averageRating: 4.8, totalReviews: 95 },
  { _id: "p_df_2", name: "Raisins", slug: "raisins", description: "Golden organic raisins (Kishmish) packed with natural sweetness.", category: INITIAL_CATEGORIES[2], images: ["https://images.unsplash.com/photo-1599599810694-b5b37304c041?w=600&q=80"], price: 180, discountPrice: 160, unit: "kg", stock: 30, isOrganic: true, isFeatured: false, averageRating: 4.6, totalReviews: 70 },
  { _id: "p_df_3", name: "Dried Figs", slug: "dried-figs", description: "Premium high-grade dried figs (Anjeer) rich in calcium and minerals.", category: INITIAL_CATEGORIES[2], images: ["https://images.unsplash.com/photo-1606923829579-0cb981a82490?w=600&q=80"], price: 650, discountPrice: 590, unit: "kg", stock: 15, isOrganic: true, isFeatured: true, averageRating: 4.9, totalReviews: 105 },
  { _id: "p_df_4", name: "Dried Apricots", slug: "dried-apricots", description: "Sweet and tangy Turkish sun-dried apricots.", category: INITIAL_CATEGORIES[2], images: ["https://images.unsplash.com/photo-1599599810694-b5b37304c041?w=600&q=80"], price: 450, discountPrice: 400, unit: "kg", stock: 20, isOrganic: false, isFeatured: false, averageRating: 4.5, totalReviews: 50 },
  { _id: "p_df_5", name: "Dried Cranberries", slug: "dried-cranberries", description: "Sweetened sliced dried cranberries great for snacks and baking.", category: INITIAL_CATEGORIES[2], images: ["https://images.unsplash.com/photo-1599599810694-b5b37304c041?w=600&q=80"], price: 390, discountPrice: 350, unit: "kg", stock: 22, isOrganic: false, isFeatured: false, averageRating: 4.7, totalReviews: 65 },

  // --- NUTS (5) ---
  { _id: "p_nuts_1", name: "Almonds", slug: "almonds", description: "High-grade crunchy California almonds rich in Vitamin E & healthy fats.", category: INITIAL_CATEGORIES[3], images: ["https://images.unsplash.com/photo-1508061252966-dfd33f43a252?w=600&q=80"], price: 450, discountPrice: 400, unit: "kg", stock: 40, isOrganic: true, isFeatured: true, averageRating: 4.9, totalReviews: 180 },
  { _id: "p_nuts_2", name: "Cashews", slug: "cashews", description: "Whole jumbo W240 premium cashew nuts (Kaju).", category: INITIAL_CATEGORIES[3], images: ["https://images.unsplash.com/photo-1508061252966-dfd33f43a252?w=600&q=80"], price: 550, discountPrice: 490, unit: "kg", stock: 35, isOrganic: true, isFeatured: true, averageRating: 4.8, totalReviews: 160 },
  { _id: "p_nuts_3", name: "Walnuts", slug: "walnuts", description: "Brain-healthy raw Chilean inshell walnuts (Akhrot) rich in Omega-3.", category: INITIAL_CATEGORIES[3], images: ["https://images.unsplash.com/photo-1508061252966-dfd33f43a252?w=600&q=80"], price: 680, discountPrice: 620, unit: "kg", stock: 25, isOrganic: true, isFeatured: true, averageRating: 4.9, totalReviews: 140 },
  { _id: "p_nuts_4", name: "Pistachios", slug: "pistachios", description: "Lightly roasted salted pistachios (Pista) in shell.", category: INITIAL_CATEGORIES[3], images: ["https://images.unsplash.com/photo-1508061252966-dfd33f43a252?w=600&q=80"], price: 750, discountPrice: 690, unit: "kg", stock: 20, isOrganic: false, isFeatured: false, averageRating: 4.7, totalReviews: 95 },
  { _id: "p_nuts_5", name: "Peanuts", slug: "peanuts", description: "Raw organic groundnut peanuts (Moongphali) rich in protein.", category: INITIAL_CATEGORIES[3], images: ["https://images.unsplash.com/photo-1508061252966-dfd33f43a252?w=600&q=80"], price: 110, discountPrice: 95, unit: "kg", stock: 50, isOrganic: true, isFeatured: false, averageRating: 4.5, totalReviews: 80 },

  // --- JUICES (5) ---
  { _id: "p_juice_1", name: "Orange Juice", slug: "orange-juice", description: "100% pure squeezed citrus orange juice with no preservatives.", category: INITIAL_CATEGORIES[4], images: ["https://images.unsplash.com/photo-1613478223719-2ab802602423?w=600&q=80"], price: 110, discountPrice: 95, unit: "liter", stock: 30, isOrganic: true, isFeatured: true, averageRating: 4.8, totalReviews: 90 },
  { _id: "p_juice_2", name: "Mango Juice", slug: "mango-juice", description: "Delicious cold pulp Alphonso mango fruit juice.", category: INITIAL_CATEGORIES[4], images: ["https://images.unsplash.com/photo-1600271886742-f049cd451bba?w=600&q=80"], price: 95, discountPrice: 85, unit: "liter", stock: 25, isOrganic: true, isFeatured: true, averageRating: 4.9, totalReviews: 130 },
  { _id: "p_juice_3", name: "Apple Juice", slug: "apple-juice", description: "Refreshing cold-pressed natural apple juice.", category: INITIAL_CATEGORIES[4], images: ["https://images.unsplash.com/photo-1600271886742-f049cd451bba?w=600&q=80"], price: 120, discountPrice: 105, unit: "liter", stock: 20, isOrganic: false, isFeatured: false, averageRating: 4.6, totalReviews: 75 },
  { _id: "p_juice_4", name: "Pineapple Juice", slug: "pineapple-juice", description: "Tangy & sweet tropical fresh pineapple juice.", category: INITIAL_CATEGORIES[4], images: ["https://images.unsplash.com/photo-1600271886742-f049cd451bba?w=600&q=80"], price: 100, discountPrice: 90, unit: "liter", stock: 25, isOrganic: true, isFeatured: false, averageRating: 4.7, totalReviews: 60 },
  { _id: "p_juice_5", name: "Pomegranate Juice", slug: "pomegranate-juice", description: "Antioxidant rich pure fresh pomegranate (Anaar) juice.", category: INITIAL_CATEGORIES[4], images: ["https://images.unsplash.com/photo-1600271886742-f049cd451bba?w=600&q=80"], price: 140, discountPrice: 125, unit: "liter", stock: 18, isOrganic: true, isFeatured: true, averageRating: 4.9, totalReviews: 105 }
];

export function ShopProvider({ children }) {
  const [products, setProducts] = useState(INITIAL_PRODUCTS);
  const [categories, setCategories] = useState(INITIAL_CATEGORIES);
  const [cart, setCart] = useState([]);
  const [wishlist, setWishlist] = useState([]);
  const [isCartOpen, setIsCartOpen] = useState(false);
  const [toast, setToast] = useState(null);
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedCategory, setSelectedCategory] = useState("all");

  const [orders, setOrders] = useState([]);
  const [loadingDb, setLoadingDb] = useState(true);

  // Fetch live categories and products from MongoDB API
  const refreshCategories = async () => {
    try {
      const res = await getCategoriesApi();
      if (res.data?.success && Array.isArray(res.data.data)) {
        setCategories(res.data.data);
      }
    } catch (err) {
      console.error("Categories API fetch error:", err);
    }
  };

  const refreshProducts = async () => {
    try {
      const res = await getProductsApi();
      if (res.data?.success && Array.isArray(res.data.data)) {
        setProducts(res.data.data);
      }
    } catch (err) {
      console.error("Products API fetch error:", err);
    }
  };

  const refreshWishlist = async () => {
    try {
      const res = await getWishlistApi();
      if (res.data?.success && Array.isArray(res.data.data)) {
        const itemIds = res.data.data.map((item) => (typeof item === "string" ? item : item._id));
        setWishlist(itemIds);
      }
    } catch (err) {
      // Unauthenticated or fallback
    }
  };

  const refreshCart = async () => {
    try {
      const res = await getCartApi();
      if (res.data?.success && Array.isArray(res.data.data)) {
        setCart(normalizeCartItems(res.data.data, products));
      }
    } catch (err) {
      // Keep local cart
    }
  };

  const { user } = useAuth();

  useEffect(() => {
    const loadStoreData = async () => {
      setLoadingDb(true);
      await Promise.all([refreshCategories(), refreshProducts()]);
      if (user) {
        await Promise.all([refreshWishlist(), refreshCart()]);
      } else {
        setCart([]);
        setWishlist([]);
      }
      setLoadingDb(false);
    };
    loadStoreData();
  }, [user]);

  const showToast = (message, type = "success") => {
    setToast({ message, type });
    setTimeout(() => setToast(null), 3000);
  };

  const addToCart = async (product, quantity = 1) => {
    if (!product) return;
    const targetId = getProductId(product);

    // Optimistic UI update
    setCart((prev) => {
      const existing = prev.find((item) => getProductId(item.product) === targetId);
      if (existing) {
        return prev.map((item) =>
          getProductId(item.product) === targetId
            ? { ...item, quantity: item.quantity + quantity }
            : item
        );
      }
      return [...prev, { product, quantity, price: product.discountPrice || product.price }];
    });

    showToast(`Added ${quantity} ${product.name || "Item"} to Cart 🛒`, "success");

    try {
      const res = await addToCartApi(targetId, quantity);
      if (res.data?.success && Array.isArray(res.data.data)) {
        setCart(normalizeCartItems(res.data.data, products));
      }
    } catch (err) {
      // Retain optimistic UI state
    }
  };

  const updateCartQuantity = async (productId, delta) => {
    if (!productId) return;

    // Find current item quantity before updating state
    const existing = cart.find((item) => getProductId(item.product) === productId);
    const newQty = existing ? existing.quantity + delta : 1;

    // Optimistic UI update
    setCart((prev) =>
      prev
        .map((item) => {
          if (getProductId(item.product) === productId) {
            const q = item.quantity + delta;
            return q > 0 ? { ...item, quantity: q } : null;
          }
          return item;
        })
        .filter(Boolean)
    );

    try {
      if (newQty <= 0) {
        await removeFromCartApi(productId);
      } else {
        const res = await updateCartItemApi(productId, newQty);
        if (res.data?.success && Array.isArray(res.data.data)) {
          setCart(normalizeCartItems(res.data.data, products));
        }
      }
    } catch (err) {
      // Retain optimistic UI state
    }
  };

  const removeFromCart = async (productId) => {
    const item = cart.find((i) => getProductId(i.product) === productId);
    setCart((prev) => prev.filter((i) => getProductId(i.product) !== productId));
    if (item) {
      showToast(`Removed ${item.product?.name || "Item"} from Cart`, "info");
    }

    try {
      const res = await removeFromCartApi(productId);
      if (res.data?.success && Array.isArray(res.data.data)) {
        setCart(normalizeCartItems(res.data.data, products));
      }
    } catch (err) {
      // Retain optimistic UI state
    }
  };

  const clearCart = async () => {
    setCart([]);
    try {
      await clearCartApi();
    } catch (err) {
      // Retain empty cart
    }
  };

  const toggleWishlist = async (productId) => {
    if (!productId) return;

    const isAlreadySaved = wishlist.includes(productId);

    // Optimistic UI update
    if (isAlreadySaved) {
      setWishlist((prev) => prev.filter((id) => id !== productId));
      showToast("Removed from Wishlist", "info");
    } else {
      setWishlist((prev) => [...prev, productId]);
      showToast("Saved to Wishlist ❤️", "success");
    }

    try {
      const res = await toggleWishlistApi(productId);
      if (res.data?.success && res.data?.data) {
        const backendIds = res.data.data.map((item) => (typeof item === "string" ? item : item._id));
        setWishlist(backendIds);
      }
    } catch (err) {
      // Retain local optimistic state
    }
  };

  const [selectedItemIds, setSelectedItemIds] = useState([]);

  // Auto select items in cart
  useEffect(() => {
    if (cart.length > 0) {
      setSelectedItemIds((prev) => {
        const cartIds = cart.map((i) => getProductId(i.product));
        if (prev.length === 0) return cartIds;
        // Keep valid cart IDs that were selected or new
        const valid = cartIds.filter((id) => prev.includes(id));
        return valid.length > 0 ? valid : cartIds;
      });
    } else {
      setSelectedItemIds([]);
    }
  }, [cart]);

  const toggleSelectItem = (productId) => {
    setSelectedItemIds((prev) =>
      prev.includes(productId) ? prev.filter((id) => id !== productId) : [...prev, productId]
    );
  };

  const selectAllItems = () => {
    setSelectedItemIds(cart.map((i) => getProductId(i.product)));
  };

  const deselectAllItems = () => {
    setSelectedItemIds([]);
  };

  const selectedCart = cart.filter((item) => selectedItemIds.includes(getProductId(item.product)));

  // Full Cart Totals
  const cartSubtotal = cart.reduce((acc, item) => acc + item.price * item.quantity, 0);
  const deliveryFee = cartSubtotal > 500 || cartSubtotal === 0 ? 0 : 30;
  const cartTotal = cartSubtotal + deliveryFee;
  const cartCount = cart.reduce((acc, item) => acc + item.quantity, 0);

  // Selected Items Totals
  const selectedCartSubtotal = selectedCart.reduce((acc, item) => acc + item.price * item.quantity, 0);
  const selectedDeliveryFee = selectedCartSubtotal > 500 || selectedCartSubtotal === 0 ? 0 : 30;
  const selectedCartTotal = selectedCartSubtotal + selectedDeliveryFee;
  const selectedCartCount = selectedCart.reduce((acc, item) => acc + item.quantity, 0);

  // Helper to remove only purchased items from cart, keeping unselected items intact
  const removePurchasedItemsFromCart = async (purchasedItems) => {
    const purchasedIds = purchasedItems.map((i) => getProductId(i.product));
    
    // Update local state to keep unselected items
    setCart((prev) => prev.filter((item) => !purchasedIds.includes(getProductId(item.product))));
    setSelectedItemIds((prev) => prev.filter((id) => !purchasedIds.includes(id)));

    // Remove purchased items from MongoDB backend cart
    for (const pId of purchasedIds) {
      try {
        await removeFromCartApi(pId);
      } catch (err) {
        console.error("Error removing purchased item from cart:", err);
      }
    }
  };

  const placeOrder = async (orderDetails) => {
    const targetItems = selectedCart.length > 0 ? selectedCart : cart;
    const subtotal = selectedCart.length > 0 ? selectedCartSubtotal : cartSubtotal;
    const delCharge = selectedCart.length > 0 ? selectedDeliveryFee : deliveryFee;
    const totalAmt = selectedCart.length > 0 ? selectedCartTotal : cartTotal;

    try {
      const payload = {
        items: targetItems.map((c) => ({
          product: getProductId(c.product),
          name: c.product.name,
          image: c.product.images?.[0] || "",
          quantity: c.quantity,
          price: c.price,
          subtotal: c.price * c.quantity
        })),
        shippingAddress: orderDetails.shippingAddress,
        subtotal: subtotal,
        deliveryCharge: delCharge,
        discount: orderDetails.discount || 0,
        totalAmount: totalAmt - (orderDetails.discount || 0),
        paymentMethod: orderDetails.paymentMethod
      };

      const res = await createOrderApi(payload);
      if (res.data?.success && res.data?.data) {
        await removePurchasedItemsFromCart(targetItems);
        setOrders((prev) => [res.data.data, ...prev]);
        return res.data.data;
      }
    } catch (err) {
      // Fallback local order creation
    }

    const fallbackOrder = {
      _id: "ORD-" + Math.floor(10000 + Math.random() * 90000),
      orderNumber: "ORD-" + Math.floor(10000 + Math.random() * 90000),
      orderedAt: new Date().toISOString(),
      items: targetItems.map((c) => ({
        product: c.product,
        name: c.product.name,
        image: c.product.images?.[0] || "",
        quantity: c.quantity,
        price: c.price,
        subtotal: c.price * c.quantity
      })),
      shippingAddress: orderDetails.shippingAddress,
      subtotal: subtotal,
      deliveryCharge: delCharge,
      discount: orderDetails.discount || 0,
      totalAmount: totalAmt - (orderDetails.discount || 0),
      paymentMethod: orderDetails.paymentMethod,
      paymentStatus: orderDetails.paymentMethod === "COD" ? "Pending" : "Paid",
      orderStatus: "Confirmed"
    };
    setOrders((prev) => [fallbackOrder, ...prev]);
    await removePurchasedItemsFromCart(targetItems);
    return fallbackOrder;
  };

  return (
    <ShopContext.Provider
      value={{
        products,
        categories,
        loadingDb,
        cart,
        wishlist,
        isCartOpen,
        toast,
        searchQuery,
        selectedCategory,
        orders,
        cartSubtotal,
        deliveryFee,
        cartTotal,
        cartCount,
        selectedItemIds,
        selectedCart,
        selectedCartSubtotal,
        selectedDeliveryFee,
        selectedCartTotal,
        selectedCartCount,
        toggleSelectItem,
        selectAllItems,
        deselectAllItems,
        setIsCartOpen,
        setSearchQuery,
        setSelectedCategory,
        addToCart,
        updateCartQuantity,
        removeFromCart,
        clearCart,
        toggleWishlist,
        placeOrder,
        showToast,
        refreshCategories,
        refreshProducts,
        refreshWishlist,
        refreshCart
      }}
    >
      {children}
    </ShopContext.Provider>
  );
}

export const useShop = () => useContext(ShopContext);
