import React, { useState } from "react";
import { Link, useNavigate, useLocation } from "react-router-dom";
import { User, Lock, Eye, EyeOff, LogIn, AlertCircle, Loader2, Leaf } from "lucide-react";
import { useAuth } from "../context/AuthContext";
import { useShop } from "../context/ShopContext";

export default function Auth() {
  const navigate = useNavigate();
  const location = useLocation();
  const { login } = useAuth();
  const { showToast } = useShop();

  const redirectPath = location.state?.from?.pathname || "/";

  const [formData, setFormData] = useState({
    username: "",
    password: ""
  });
  const [rememberMe, setRememberMe] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const [errors, setErrors] = useState({});
  const [serverError, setServerError] = useState("");
  const [loading, setLoading] = useState(false);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
    setErrors((prev) => ({ ...prev, [name]: "" }));
    setServerError("");
  };

  const validateForm = () => {
    const newErrors = {};
    if (!formData.username.trim()) newErrors.username = "Email or Username is required";
    if (!formData.password.trim()) newErrors.password = "Password is required";
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!validateForm()) return;

    setLoading(true);
    setServerError("");

    try {
      const data = await login({
        email: formData.username,
        username: formData.username,
        password: formData.password
      });
      showToast("✓ Welcome back! Login successful", "success");

      const role = data.user?.role || "customer";
      if (role === "admin") {
        navigate("/admin/dashboard", { replace: true });
      } else if (role === "vendor") {
        navigate("/vendor/dashboard", { replace: true });
      } else if (role === "deliveryboy") {
        navigate("/delivery/dashboard", { replace: true });
      } else {
        navigate(redirectPath, { replace: true });
      }
    } catch (err) {
      setServerError(err.message || "Invalid credentials. Please check your email and password.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-[85vh] flex items-center justify-center py-12 px-4">
      <div className="bg-white rounded-3xl border border-slate-100 shadow-xl overflow-hidden max-w-4xl w-full grid grid-cols-1 md:grid-cols-2">
        {/* Left Side Banner */}
        <div className="bg-gradient-to-br from-emerald-900 via-green-800 to-emerald-950 p-8 sm:p-12 text-white flex flex-col justify-between relative overflow-hidden">
          <div className="space-y-4 z-10">
            <Link to="/" className="flex items-center gap-2">
              <div className="w-10 h-10 bg-green-500 rounded-xl flex items-center justify-center text-slate-950 font-bold shadow-md">
                <Leaf className="w-6 h-6 fill-slate-950 text-slate-950" />
              </div>
              <span className="text-2xl font-black tracking-tight">
                Farm<span className="text-green-400">Fresh</span>
              </span>
            </Link>

            <div className="pt-8 space-y-2">
              <h2 className="text-3xl font-black leading-snug">Welcome Back!</h2>
              <p className="text-xs sm:text-sm text-emerald-100 font-medium leading-relaxed">
                Sign in to access your fresh produce orders, track deliveries in real time, and enjoy healthy organic vegetables & fruits.
              </p>
            </div>
          </div>

          <div className="pt-8 z-10">
            <div className="bg-white/10 backdrop-blur-xs p-4 rounded-2xl border border-white/10 text-xs text-emerald-100 flex items-center gap-3">
              <span className="text-2xl">🌱</span>
              <div>
                <div className="font-bold text-white">100% Farm Fresh Guarantee</div>
                <div>Directly harvested from local farmers every morning</div>
              </div>
            </div>
          </div>
        </div>

        {/* Right Side Form */}
        <div className="p-8 sm:p-12 flex flex-col justify-center space-y-6">
          <div>
            <h1 className="text-2xl font-black text-slate-900">Sign In to Your Account</h1>
            <p className="text-xs text-slate-500 mt-1">Enter your credentials to continue shopping</p>
          </div>

          {serverError && (
            <div className="bg-red-50 text-red-800 p-3.5 rounded-2xl text-xs font-semibold flex items-center gap-2 border border-red-100 animate-fadeIn">
              <AlertCircle className="w-4 h-4 text-red-600 shrink-0" />
              <span>{serverError}</span>
            </div>
          )}

          <form onSubmit={handleSubmit} className="space-y-4">
            <div className="space-y-1.5">
              <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider">
                Email or Username
              </label>
              <div className="relative flex items-center">
                <input
                  type="text"
                  name="username"
                  value={formData.username}
                  onChange={handleChange}
                  placeholder="customer@farmfresh.com"
                  className="w-full bg-slate-50 border border-slate-200 text-xs rounded-xl pl-10 pr-4 py-3 outline-none focus:border-green-600 focus:bg-white font-medium transition-all"
                />
                <User className="w-4 h-4 text-slate-400 absolute left-3.5" />
              </div>
              {errors.username && <span className="text-[11px] text-red-600 font-semibold">{errors.username}</span>}
            </div>

            <div className="space-y-1.5">
              <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider">
                Password
              </label>
              <div className="relative flex items-center">
                <input
                  type={showPassword ? "text" : "password"}
                  name="password"
                  value={formData.password}
                  onChange={handleChange}
                  placeholder="••••••••"
                  className="w-full bg-slate-50 border border-slate-200 text-xs rounded-xl pl-10 pr-10 py-3 outline-none focus:border-green-600 focus:bg-white font-medium transition-all"
                />
                <Lock className="w-4 h-4 text-slate-400 absolute left-3.5" />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute right-3.5 text-slate-400 hover:text-slate-600"
                >
                  {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                </button>
              </div>
              {errors.password && <span className="text-[11px] text-red-600 font-semibold">{errors.password}</span>}
            </div>

            <div className="flex items-center justify-between text-xs pt-1">
              <label className="flex items-center gap-2 cursor-pointer text-slate-700 font-semibold">
                <input
                  type="checkbox"
                  checked={rememberMe}
                  onChange={(e) => setRememberMe(e.target.checked)}
                  className="w-4 h-4 text-green-600 rounded"
                />
                <span>Remember me</span>
              </label>

              <Link to="/forgot-password" className="font-bold text-green-600 hover:underline">
                Forgot Password?
              </Link>
            </div>

            <button
              type="submit"
              disabled={loading}
              className="w-full bg-green-600 hover:bg-green-700 disabled:opacity-50 text-white font-bold py-3.5 rounded-xl shadow-md flex items-center justify-center gap-2 text-xs transition-all active:scale-98"
            >
              {loading ? (
                <>
                  <Loader2 className="w-4 h-4 animate-spin" />
                  <span>Signing in...</span>
                </>
              ) : (
                <>
                  <LogIn className="w-4 h-4" />
                  <span>Sign In</span>
                </>
              )}
            </button>
          </form>

          <div className="text-center text-xs text-slate-500 pt-2 border-t border-slate-100 space-y-2">
            <div>
              Don't have an account?{" "}
              <Link to="/register" className="font-bold text-green-600 hover:underline">
                Sign up now
              </Link>
            </div>
            <div className="flex flex-wrap items-center justify-center gap-3 text-[11px] pt-1">
              <Link to="/vendor/dashboard" className="font-bold text-emerald-700 hover:underline">
                🚜 Vendor Portal
              </Link>
              <span>•</span>
              <Link to="/delivery/dashboard" className="font-bold text-blue-700 hover:underline">
                🚚 Delivery Agent Portal
              </Link>
              <span>•</span>
              <Link to="/admin/dashboard" className="font-bold text-slate-800 hover:underline">
                🛡️ Admin Portal
              </Link>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
