import React from "react";
import { Link } from "react-router-dom";
import { ArrowRight, Sparkles, Loader2 } from "lucide-react";
import { useShop } from "../context/ShopContext";
import ProductCard from "../components/ProductCard";
import SkeletonCard from "../components/SkeletonCard";

export default function Home() {
  const { products, categories, loadingDb } = useShop();

  const featuredProducts = products.filter((p) => p.isFeatured);
  const organicProducts = products.filter((p) => p.isOrganic);
  const displayProducts = featuredProducts.length > 0 ? featuredProducts : products.slice(0, 8);

  return (
    <div className="flex flex-col gap-12 pb-16">
      {/* Hero Banner Section */}
      <section className="relative overflow-hidden bg-gradient-to-r from-emerald-900 via-green-800 to-emerald-950 text-white rounded-3xl p-6 sm:p-12 shadow-xl">
        <div className="relative z-10 max-w-xl flex flex-col items-start gap-4">
          <div className="inline-flex items-center gap-2 bg-green-500/20 text-green-300 border border-green-400/30 px-3.5 py-1.5 rounded-full text-xs font-bold">
            <Sparkles className="w-3.5 h-3.5" />
            <span>100% Farm Fresh & Organic</span>
          </div>

          <h1 className="text-3xl sm:text-5xl font-black tracking-tight leading-tight">
            Fresh Produce <br />
            <span className="text-green-400">Delivered Daily</span>
          </h1>

          <p className="text-sm sm:text-base text-emerald-100 font-medium leading-relaxed">
            Harvested directly from certified local organic farms. Fresh vegetables, fruits, dry fruits, nuts & juices delivered within 2 hours.
          </p>

          <div className="pt-2 flex flex-wrap gap-4 items-center">
            <Link
              to="/products"
              className="bg-green-500 hover:bg-green-600 text-slate-950 font-bold px-7 py-3 rounded-2xl shadow-lg transition-all flex items-center gap-2 text-sm hover:scale-105 active:scale-95"
            >
              <span>Shop Now</span>
              <ArrowRight className="w-4 h-4" />
            </Link>

            <Link
              to="/products?filter=organic"
              className="bg-white/10 hover:bg-white/20 text-white border border-white/20 font-semibold px-6 py-3 rounded-2xl transition-all text-sm backdrop-blur-xs"
            >
              Explore Organic
            </Link>
          </div>
        </div>

        {/* Decorative Graphic */}
        <div className="absolute right-4 bottom-4 top-4 hidden lg:flex items-center justify-center w-5/12 pointer-events-none">
          <img
            src="https://images.unsplash.com/photo-1540420773420-3366772f4999?w=800&q=80"
            alt="Fresh Vegetables Basket"
            className="w-full h-full object-cover rounded-3xl shadow-2xl rotate-2 border-4 border-white/10"
          />
        </div>
      </section>

      {/* Shop by Category Section (Fetched Live from MongoDB Database) */}
      <section className="flex flex-col gap-4">
        <div className="flex items-center justify-between">
          <div>
            <h2 className="text-xl sm:text-2xl font-bold text-slate-900">
              Shop by Category
            </h2>
            <p className="text-xs text-slate-500 mt-0.5">Explore our store categories fetched from live database</p>
          </div>
          <Link
            to="/products"
            className="text-xs font-bold text-green-600 hover:text-green-700 flex items-center gap-1"
          >
            <span>View All ({categories.length})</span>
            <ArrowRight className="w-3.5 h-3.5" />
          </Link>
        </div>

        {loadingDb ? (
          <div className="grid grid-cols-2 sm:grid-cols-5 gap-4">
            {[1, 2, 3, 4, 5].map((i) => (
              <div key={i} className="bg-slate-100 rounded-2xl h-44 animate-pulse" />
            ))}
          </div>
        ) : (
          <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-5 gap-4">
            {categories.map((cat) => (
              <Link
                key={cat._id}
                to={`/products?category=${cat.slug || cat._id}`}
                className="group bg-white rounded-2xl p-5 border border-slate-100 shadow-xs hover:shadow-md transition-all text-center flex flex-col items-center justify-between gap-3 min-h-[180px]"
              >
                <div className="w-20 h-20 rounded-2xl overflow-hidden bg-slate-50 group-hover:scale-105 transition-transform duration-300 flex items-center justify-center shrink-0 border border-slate-100">
                  <img
                    src={cat.image || "https://images.unsplash.com/photo-1540420773420-3366772f4999?w=400&q=80"}
                    alt={cat.name}
                    className="w-full h-full object-cover"
                  />
                </div>
                <div className="flex flex-col gap-0.5">
                  <h3 className="font-bold text-sm text-slate-800 group-hover:text-green-600 transition-colors">
                    {cat.name}
                  </h3>
                  <span className="text-[11px] text-slate-400 font-medium line-clamp-1">
                    {cat.description || "Fresh produce selection"}
                  </span>
                </div>
              </Link>
            ))}
          </div>
        )}
      </section>

      {/* Popular Products Section (Fetched Live from MongoDB Database) */}
      <section className="flex flex-col gap-4">
        <div className="flex items-center justify-between">
          <div>
            <h2 className="text-xl sm:text-2xl font-bold text-slate-900">
              Popular Fresh Produce
            </h2>
            <p className="text-xs text-slate-500 mt-0.5">Live store items from MongoDB database</p>
          </div>
          <Link
            to="/products"
            className="text-xs font-bold text-green-600 hover:text-green-700 flex items-center gap-1"
          >
            <span>Explore Store ({products.length} products)</span>
            <ArrowRight className="w-3.5 h-3.5" />
          </Link>
        </div>

        {loadingDb ? (
          <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-4">
            {[1, 2, 3, 4].map((i) => (
              <SkeletonCard key={i} />
            ))}
          </div>
        ) : (
          <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-4 items-stretch">
            {displayProducts.map((prod) => (
              <ProductCard key={prod._id} product={prod} />
            ))}
          </div>
        )}
      </section>

      {/* Today's Special Organic Section */}
      {organicProducts.length > 0 && (
        <section className="bg-emerald-50/80 rounded-3xl p-6 sm:p-8 border border-emerald-100 flex flex-col gap-6">
          <div className="flex items-center justify-between">
            <div>
              <span className="bg-emerald-600 text-white text-[10px] font-bold px-3 py-1 rounded-full uppercase tracking-wider">
                100% Organic Selection
              </span>
              <h2 className="text-xl sm:text-2xl font-bold text-slate-900 mt-2">
                Freshly Picked Organic Deals
              </h2>
              <p className="text-xs text-slate-600 mt-0.5">Zero pesticides, 100% natural goodness</p>
            </div>
          </div>

          <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-4 items-stretch">
            {organicProducts.slice(0, 4).map((prod) => (
              <ProductCard key={prod._id} product={prod} />
            ))}
          </div>
        </section>
      )}

      {/* Why Choose Us */}
      <section className="bg-white rounded-3xl p-8 border border-slate-100 shadow-xs text-center flex flex-col gap-6">
        <div>
          <h2 className="text-xl sm:text-2xl font-bold text-slate-900">
            Why FarmFresh?
          </h2>
          <p className="text-xs text-slate-500 mt-0.5">Your trusted neighbourhood online green grocer</p>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-3 gap-6">
          <div className="p-5 rounded-2xl bg-slate-50 flex flex-col items-center gap-2">
            <div className="w-12 h-12 bg-green-100 text-green-700 rounded-full flex items-center justify-center text-xl">
              🚚
            </div>
            <h3 className="font-bold text-sm text-slate-800">2-Hour Express Delivery</h3>
            <p className="text-xs text-slate-500 leading-relaxed">
              Get fresh produce delivered right to your doorstep within 120 minutes.
            </p>
          </div>

          <div className="p-5 rounded-2xl bg-slate-50 flex flex-col items-center gap-2">
            <div className="w-12 h-12 bg-emerald-100 text-emerald-700 rounded-full flex items-center justify-center text-xl">
              🌱
            </div>
            <h3 className="font-bold text-sm text-slate-800">Farm Direct Quality</h3>
            <p className="text-xs text-slate-500 leading-relaxed">
              Harvested daily from certified organic farmers without harmful cold storage.
            </p>
          </div>

          <div className="p-5 rounded-2xl bg-slate-50 flex flex-col items-center gap-2">
            <div className="w-12 h-12 bg-amber-100 text-amber-700 rounded-full flex items-center justify-center text-xl">
              🔒
            </div>
            <h3 className="font-bold text-sm text-slate-800">100% Safe Payments</h3>
            <p className="text-xs text-slate-500 leading-relaxed">
              Multiple secure payment options including Cash on Delivery and instant UPI.
            </p>
          </div>
        </div>
      </section>
    </div>
  );
}
