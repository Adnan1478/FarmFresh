import React, { useState } from "react";
import { Link } from "react-router-dom";
import { Mail, ArrowLeft, CheckCircle, AlertCircle, Loader2, KeyRound } from "lucide-react";
import { forgotPasswordApi } from "../api/authApi";
import { useShop } from "../context/ShopContext";

export default function ForgotPassword() {
  const { showToast } = useShop();
  const [email, setEmail] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [successMessage, setSuccessMessage] = useState("");
  const [errorMessage, setErrorMessage] = useState("");

  const handleSubmit = async (e) => {
    e.preventDefault();
    setSuccessMessage("");
    setErrorMessage("");

    if (!email || !/\S+@\S+\.\S+/.test(email)) {
      setErrorMessage("Please enter a valid email address");
      return;
    }

    setIsSubmitting(true);
    try {
      const res = await forgotPasswordApi(email);
      if (res.data?.success) {
        setSuccessMessage(res.data.message || `Password reset link sent to ${email}. Check your inbox!`);
        showToast("✓ Reset link sent to your email", "success");
      }
    } catch (err) {
      setErrorMessage(err.response?.data?.message || "Error requesting password reset link");
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="min-h-[80vh] flex items-center justify-center py-12 px-4">
      <div className="bg-white rounded-3xl p-8 sm:p-10 border border-slate-100 shadow-xl max-w-md w-full space-y-6">
        {/* Header Icon */}
        <div className="text-center space-y-2">
          <div className="w-16 h-16 bg-green-100 text-green-700 rounded-full flex items-center justify-center mx-auto shadow-inner text-2xl">
            <KeyRound className="w-8 h-8" />
          </div>
          <h1 className="text-2xl font-black text-slate-900">Forgot Password?</h1>
          <p className="text-xs text-slate-500 max-w-xs mx-auto">
            Enter your registered email address and we'll send you a 15-minute secure password reset link.
          </p>
        </div>

        {/* Success Alert */}
        {successMessage && (
          <div className="bg-emerald-50 text-emerald-800 p-4 rounded-2xl border border-emerald-100 text-xs font-semibold flex items-center gap-2 animate-fadeIn">
            <CheckCircle className="w-5 h-5 text-emerald-600 shrink-0" />
            <span>{successMessage}</span>
          </div>
        )}

        {/* Error Alert */}
        {errorMessage && (
          <div className="bg-red-50 text-red-800 p-4 rounded-2xl border border-red-100 text-xs font-semibold flex items-center gap-2 animate-fadeIn">
            <AlertCircle className="w-5 h-5 text-red-600 shrink-0" />
            <span>{errorMessage}</span>
          </div>
        )}

        {!successMessage ? (
          <form onSubmit={handleSubmit} className="space-y-4">
            <div className="space-y-1.5">
              <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider">
                Email Address
              </label>
              <div className="relative flex items-center">
                <input
                  type="email"
                  required
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="name@example.com"
                  className="w-full bg-slate-50 border border-slate-200 text-xs rounded-xl pl-10 pr-4 py-3 outline-none focus:border-green-600 focus:bg-white transition-all font-medium"
                />
                <Mail className="w-4 h-4 text-slate-400 absolute left-3.5" />
              </div>
            </div>

            <button
              type="submit"
              disabled={isSubmitting}
              className="w-full bg-green-600 hover:bg-green-700 disabled:opacity-50 text-white font-bold py-3.5 rounded-xl shadow-md flex items-center justify-center gap-2 text-xs transition-all active:scale-98"
            >
              {isSubmitting ? (
                <>
                  <Loader2 className="w-4 h-4 animate-spin" />
                  <span>Sending Reset Link...</span>
                </>
              ) : (
                <span>Send Reset Link</span>
              )}
            </button>
          </form>
        ) : (
          <div className="text-center pt-2">
            <Link
              to="/login"
              className="inline-block bg-slate-900 hover:bg-slate-800 text-white font-bold px-6 py-3 rounded-xl text-xs shadow-md transition-colors"
            >
              Return to Login
            </Link>
          </div>
        )}

        {/* Back Link */}
        <div className="text-center border-t border-slate-100 pt-4">
          <Link
            to="/login"
            className="inline-flex items-center gap-1.5 text-xs font-bold text-slate-600 hover:text-green-600 transition-colors"
          >
            <ArrowLeft className="w-4 h-4" />
            <span>Back to Login</span>
          </Link>
        </div>
      </div>
    </div>
  );
}
