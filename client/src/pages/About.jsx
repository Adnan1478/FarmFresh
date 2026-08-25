import React from "react";
import { Link } from "react-router-dom";
import {
  Leaf,
  Truck,
  ShieldCheck,
  Award,
  Users,
  ArrowRight,
  Sparkles,
  Heart,
  CheckCircle
} from "lucide-react";
import { useShop } from "../context/ShopContext";

export default function About() {
  const { products, categories } = useShop();

  const stats = [
    { label: "Fresh Products", value: `${products.length}+`, icon: Leaf },
    { label: "Produce Categories", value: `${categories.length}`, icon: Sparkles },
    { label: "Happy Customers", value: "15,000+", icon: Users },
    { label: "Express Delivery", value: "120 Mins", icon: Truck }
  ];

  const pillars = [
    {
      title: "100% Farm Sourced",
      description: "Directly harvested from certified local organic farms without long cold-storage delays.",
      icon: Leaf,
      color: "bg-emerald-100 text-emerald-800"
    },
    {
      title: "Zero Pesticides & Chemicals",
      description: "Nurtured naturally with organic compost. Zero synthetic sprays, wax, or artificial color.",
      icon: ShieldCheck,
      color: "bg-green-100 text-green-800"
    },
    {
      title: "2-Hour Express Delivery",
      description: "Packed in temperature-controlled eco bags and delivered to your doorstep within 2 hours.",
      icon: Truck,
      color: "bg-blue-100 text-blue-800"
    },
    {
      title: "Fair Share for Farmers",
      description: "We eliminate middlemen, giving 85% of store earnings directly back to local farming families.",
      icon: Award,
      color: "bg-amber-100 text-amber-800"
    }
  ];

  const team = [
    {
      name: "Rajesh Patil",
      role: "Master Organic Farmer",
      image: "https://images.unsplash.com/photo-1595475207225-428b62bda831?w=400&q=80",
      bio: "20+ years of organic farming experience in green vegetables."
    },
    {
      name: "Sunita Sharma",
      role: "Quality & Soil Scientist",
      image: "https://images.unsplash.com/photo-1573496359142-b8d87734a5a2?w=400&q=80",
      bio: "Ensures all produce passes 14-point purity and nutrient checks."
    },
    {
      name: "Amit Varma",
      role: "Logistics Lead",
      image: "https://images.unsplash.com/photo-1560250097-0b93528c311a?w=400&q=80",
      bio: "Manages express 2-hour farm-to-doorstep delivery network."
    }
  ];

  return (
    <div className="space-y-12 pb-16 text-xs max-w-5xl mx-auto">
      {/* Hero Banner Section */}
      <section className="relative overflow-hidden bg-gradient-to-r from-emerald-900 via-green-800 to-emerald-950 text-white rounded-3xl p-8 sm:p-12 shadow-xl flex flex-col md:flex-row items-center justify-between gap-8">
        <div className="max-w-xl space-y-4 text-center md:text-left">
          <span className="bg-green-500/20 text-green-300 border border-green-400/30 px-3.5 py-1 rounded-full font-bold uppercase tracking-wider text-[10px] inline-flex items-center gap-1.5">
            <Sparkles className="w-3.5 h-3.5" />
            <span>Our Organic Story</span>
          </span>

          <h1 className="text-3xl sm:text-4xl font-black leading-tight">
            Connecting Local Organic Farmers Directly to Your Kitchen
          </h1>

          <p className="text-emerald-100 text-xs sm:text-sm leading-relaxed font-medium">
            FarmFresh was founded with a single mission: to deliver pure, pesticide-free vegetables, fruits, dry fruits, nuts, and juices straight from certified local farms within 2 hours.
          </p>

          <div className="pt-2 flex flex-wrap justify-center md:justify-start gap-3">
            <Link
              to="/products"
              className="bg-green-500 hover:bg-green-600 text-slate-950 font-bold px-6 py-3 rounded-2xl shadow-lg transition-all flex items-center gap-2 text-xs"
            >
              <span>Explore Farm Produce</span>
              <ArrowRight className="w-4 h-4" />
            </Link>

            <Link
              to="/contact"
              className="bg-white/10 hover:bg-white/20 text-white border border-white/20 font-semibold px-5 py-3 rounded-2xl transition-all text-xs"
            >
              Get in Touch
            </Link>
          </div>
        </div>

        {/* Hero Image Graphic */}
        <div className="w-full md:w-5/12 h-64 sm:h-72 rounded-2xl overflow-hidden shadow-2xl border-4 border-white/10 shrink-0">
          <img
            src="https://images.unsplash.com/photo-1500937386664-56d1dfef3854?w=800&q=80"
            alt="Organic Farm Field"
            className="w-full h-full object-cover"
          />
        </div>
      </section>

      {/* Live Store Stats Grid (Connected with MongoDB Database Data) */}
      <section className="grid grid-cols-2 md:grid-cols-4 gap-4">
        {stats.map((stat, idx) => {
          const IconComp = stat.icon;
          return (
            <div
              key={idx}
              className="bg-white rounded-2xl p-5 border border-slate-100 shadow-xs text-center flex flex-col items-center justify-center gap-2"
            >
              <div className="w-10 h-10 rounded-xl bg-green-50 text-green-700 flex items-center justify-center">
                <IconComp className="w-5 h-5" />
              </div>
              <div className="text-2xl font-black text-slate-900">{stat.value}</div>
              <div className="text-[11px] font-bold text-slate-500">{stat.label}</div>
            </div>
          );
        })}
      </section>

      {/* Our 4 Core Pillars */}
      <section className="bg-white rounded-3xl p-6 sm:p-8 border border-slate-100 shadow-xs space-y-6">
        <div className="text-center max-w-md mx-auto space-y-1">
          <h2 className="text-xl font-bold text-slate-900">The 4 Pillars of FarmFresh</h2>
          <p className="text-slate-500 text-xs">Why thousands of families trust us for their daily groceries</p>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          {pillars.map((p, idx) => {
            const IconComponent = p.icon;
            return (
              <div
                key={idx}
                className="p-5 rounded-2xl bg-slate-50 border border-slate-100 space-y-3 flex flex-col justify-between"
              >
                <div className="flex items-center gap-3">
                  <div className={`w-10 h-10 rounded-xl ${p.color} flex items-center justify-center shrink-0`}>
                    <IconComponent className="w-5 h-5" />
                  </div>
                  <h3 className="font-bold text-sm text-slate-900">{p.title}</h3>
                </div>
                <p className="text-slate-600 leading-relaxed text-xs">{p.description}</p>
              </div>
            );
          })}
        </div>
      </section>

      {/* Meet Our Organic Farmers & Team */}
      <section className="space-y-6">
        <div className="flex items-center justify-between">
          <div>
            <h2 className="text-xl font-bold text-slate-900">Meet Our Partner Farmers</h2>
            <p className="text-slate-500 text-xs mt-0.5">The passionate people behind your fresh produce</p>
          </div>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-3 gap-6">
          {team.map((m, idx) => (
            <div
              key={idx}
              className="bg-white rounded-2xl border border-slate-100 shadow-xs overflow-hidden text-center p-5 space-y-3 flex flex-col items-center"
            >
              <div className="w-24 h-24 rounded-full overflow-hidden border-4 border-green-100 shadow-md">
                <img src={m.image} alt={m.name} className="w-full h-full object-cover" />
              </div>
              <div>
                <h3 className="font-bold text-sm text-slate-900">{m.name}</h3>
                <div className="text-emerald-700 font-semibold text-[11px] mt-0.5">{m.role}</div>
              </div>
              <p className="text-slate-500 text-xs leading-relaxed">{m.bio}</p>
            </div>
          ))}
        </div>
      </section>

      {/* Call to Action */}
      <section className="bg-emerald-600 text-white rounded-3xl p-8 text-center space-y-4 shadow-lg">
        <h2 className="text-2xl font-black">Experience Real Farm Freshness Today</h2>
        <p className="text-emerald-100 max-w-lg mx-auto text-xs leading-relaxed font-medium">
          Order organic vegetables, sweet fruits, dry fruits, nuts, and fresh juices delivered to your kitchen within 120 minutes.
        </p>
        <Link
          to="/products"
          className="inline-flex items-center gap-2 bg-white text-emerald-900 font-bold px-7 py-3 rounded-2xl shadow-md hover:bg-emerald-50 transition-all text-xs"
        >
          <span>Shop Fresh Produce Now</span>
          <ArrowRight className="w-4 h-4" />
        </Link>
      </section>
    </div>
  );
}
