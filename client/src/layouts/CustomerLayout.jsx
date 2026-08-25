import React from "react";
import { Outlet } from "react-router-dom";
import Navbar from "../components/Navbar";
import Footer from "../components/Footer";
import MobileBottomNav from "../components/MobileBottomNav";
import CartDrawer from "../components/CartDrawer";
import Toast from "../components/Toast";
import { useShop } from "../context/ShopContext";

export default function CustomerLayout() {
  const { toast } = useShop();

  return (
    <div className="min-h-screen flex flex-col bg-[#f8faf9] text-[#172018] relative">
      <Navbar />

      <main className="flex-1 max-w-7xl w-full mx-auto px-4 sm:px-6 lg:px-8 py-6">
        <Outlet />
      </main>

      <Footer />
      <MobileBottomNav />
      <CartDrawer />
      <Toast toast={toast} />
    </div>
  );
}
