import React, { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { User, Mail, Phone, Lock, Eye, EyeOff, UserCheck, AlertCircle, Loader2, Leaf } from "lucide-react";
import { useAuth } from "../context/AuthContext";
import { useShop } from "../context/ShopContext";

export default function Register() {
  const navigate = useNavigate();
  const { register } = useAuth();
  const { showToast } = useShop();

  const [formData, setFormData] = useState({
    username: "",
    email: "",
    phone: "",
    password: "",
    confirmPassword: ""
  });
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [errors, setErrors] = useState({});
  const [serverError, setServerError] = useState("");
  const [loading, setLoading] = useState(false);

  const handleChange = (e) => {
    const { name, value } = e.target;
    let finalValue = value;
    if (name === "phone") {
      finalValue = value.replace(/\D/g, "").slice(0, 10); // Restrict to 10 numeric digits only
    }
    setFormData((prev) => ({ ...prev, [name]: finalValue }));
    setErrors((prev) => ({ ...prev, [name]: "" }));
    setServerError("");
  };

  const validateForm = () => {
    const newErrors = {};
    if (!formData.username.trim()) newErrors.username = "Full name is required";
    if (!formData.email.trim()) newErrors.email = "Email address is required";
    else if (!/\S+@\S+\.\S+/.test(formData.email)) newErrors.email = "Enter a valid email address";

    if (formData.phone && !/^\d{10}$/.test(formData.phone)) {
      newErrors.phone = "Phone number must be exactly 10 digits";
    }

    if (!formData.password) newErrors.password = "Password is required";
    else if (formData.password.length < 8) newErrors.password = "Password must be at least 8 characters";

    if (!formData.confirmPassword) newErrors.confirmPassword = "Please confirm password";
    else if (formData.password !== formData.confirmPassword) newErrors.confirmPassword = "Passwords do not match";

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!validateForm()) return;

    setLoading(true);
    setServerError("");

    try {
      await register({
        name: formData.username,
        email: formData.email,
        phone: formData.phone,
        password: formData.password
      });
      showToast("✓ Account created successfully!", "success");
      navigate("/");
    } catch (err) {
      setServerError(err.message || "Registration failed. Please try again.");
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
              <h2 className="text-3xl font-black leading-snug">Join FarmFresh!</h2>
              <p className="text-xs sm:text-sm text-emerald-100 font-medium leading-relaxed">
                Create a free account to enjoy fresh organic vegetables & fruits delivered to your doorstep within 2 hours. Quick, simple, and secure.
              </p>
            </div>
          </div>

          <div className="pt-8 z-10">
            <div className="bg-white/10 backdrop-blur-xs p-4 rounded-2xl border border-white/10 text-xs text-emerald-100 flex items-center gap-3">
              <span className="text-2xl">🥦</span>
              <div>
                <div className="font-bold text-white">Instant Customer Rewards</div>
                <div>Get free delivery on your first order over ₹300</div>
              </div>
            </div>
          </div>
        </div>

        {/* Right Side Form */}
        <div className="p-8 sm:p-12 flex flex-col justify-center space-y-5">
          <div>
            <h1 className="text-2xl font-black text-slate-900">Create Your Account</h1>
            <p className="text-xs text-slate-500 mt-1">Fill in your details to start shopping</p>
          </div>

          {serverError && (
            <div className="bg-red-50 text-red-800 p-3.5 rounded-2xl text-xs font-semibold flex items-center gap-2 border border-red-100 animate-fadeIn">
              <AlertCircle className="w-4 h-4 text-red-600 shrink-0" />
              <span>{serverError}</span>
            </div>
          )}

          <form onSubmit={handleSubmit} className="space-y-3.5">
            <div className="space-y-1">
              <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider">
                Full Name *
              </label>
              <div className="relative flex items-center">
                <input
                  type="text"
                  name="username"
                  value={formData.username}
                  onChange={handleChange}
                  placeholder="John Doe"
                  className="w-full bg-slate-50 border border-slate-200 text-xs rounded-xl pl-10 pr-4 py-2.5 outline-none focus:border-green-600 focus:bg-white font-medium transition-all"
                />
                <User className="w-4 h-4 text-slate-400 absolute left-3.5" />
              </div>
              {errors.username && <span className="text-[11px] text-red-600 font-semibold">{errors.username}</span>}
            </div>

            <div className="space-y-1">
              <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider">
                Email Address *
              </label>
              <div className="relative flex items-center">
                <input
                  type="email"
                  name="email"
                  value={formData.email}
                  onChange={handleChange}
                  placeholder="john@example.com"
                  className="w-full bg-slate-50 border border-slate-200 text-xs rounded-xl pl-10 pr-4 py-2.5 outline-none focus:border-green-600 focus:bg-white font-medium transition-all"
                />
                <Mail className="w-4 h-4 text-slate-400 absolute left-3.5" />
              </div>
              {errors.email && <span className="text-[11px] text-red-600 font-semibold">{errors.email}</span>}
            </div>

            <div className="space-y-1">
              <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider">
                Mobile Number (10 Digits)
              </label>
              <div className="relative flex items-center">
                <input
                  type="tel"
                  name="phone"
                  maxLength={10}
                  value={formData.phone}
                  onChange={handleChange}
                  placeholder="9876543210"
                  className="w-full bg-slate-50 border border-slate-200 text-xs rounded-xl pl-10 pr-4 py-2.5 outline-none focus:border-green-600 focus:bg-white font-medium transition-all"
                />
                <Phone className="w-4 h-4 text-slate-400 absolute left-3.5" />
              </div>
              {errors.phone && <span className="text-[11px] text-red-600 font-semibold">{errors.phone}</span>}
            </div>

            <div className="space-y-1">
              <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider">
                Password *
              </label>
              <div className="relative flex items-center">
                <input
                  type={showPassword ? "text" : "password"}
                  name="password"
                  value={formData.password}
                  onChange={handleChange}
                  placeholder="••••••••"
                  className="w-full bg-slate-50 border border-slate-200 text-xs rounded-xl pl-10 pr-10 py-2.5 outline-none focus:border-green-600 focus:bg-white font-medium transition-all"
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

            <div className="space-y-1">
              <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider">
                Confirm Password *
              </label>
              <div className="relative flex items-center">
                <input
                  type={showConfirmPassword ? "text" : "password"}
                  name="confirmPassword"
                  value={formData.confirmPassword}
                  onChange={handleChange}
                  placeholder="••••••••"
                  className="w-full bg-slate-50 border border-slate-200 text-xs rounded-xl pl-10 pr-10 py-2.5 outline-none focus:border-green-600 focus:bg-white font-medium transition-all"
                />
                <Lock className="w-4 h-4 text-slate-400 absolute left-3.5" />
                <button
                  type="button"
                  onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                  className="absolute right-3.5 text-slate-400 hover:text-slate-600"
                >
                  {showConfirmPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                </button>
              </div>
              {errors.confirmPassword && <span className="text-[11px] text-red-600 font-semibold">{errors.confirmPassword}</span>}
            </div>

            <button
              type="submit"
              disabled={loading}
              className="w-full bg-green-600 hover:bg-green-700 disabled:opacity-50 text-white font-bold py-3.5 rounded-xl shadow-md flex items-center justify-center gap-2 text-xs transition-all active:scale-98 mt-2"
            >
              {loading ? (
                <>
                  <Loader2 className="w-4 h-4 animate-spin" />
                  <span>Registering...</span>
                </>
              ) : (
                <>
                  <UserCheck className="w-4 h-4" />
                  <span>Register Account</span>
                </>
              )}
            </button>
          </form>

          <div className="text-center text-xs text-slate-500 pt-2 border-t border-slate-100">
            Already have an account?{" "}
            <Link to="/login" className="font-bold text-green-600 hover:underline">
              Sign in here
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
}
