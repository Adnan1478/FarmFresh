import React, { useState, useEffect } from "react";
import { useParams, Link } from "react-router-dom";
import { CheckCircle2, XCircle, Loader2, Leaf, ShieldCheck } from "lucide-react";
import { verifyEmailApi } from "../api/authApi";
import { useShop } from "../context/ShopContext";

export default function VerifyEmail() {
  const { token } = useParams();
  const { showToast } = useShop();

  const [loading, setLoading] = useState(true);
  const [success, setSuccess] = useState(false);
  const [message, setMessage] = useState("");

  useEffect(() => {
    const verify = async () => {
      if (!token) return;
      try {
        setLoading(true);
        const res = await verifyEmailApi(token);
        if (res.data?.success) {
          setSuccess(true);
          setMessage(res.data.message || "✓ Email address verified successfully!");
          showToast("✓ Email verified successfully!", "success");
        }
      } catch (err) {
        setSuccess(false);
        setMessage(err.response?.data?.message || "Verification link is invalid or has expired.");
      } finally {
        setLoading(false);
      }
    };
    verify();
  }, [token]);

  return (
    <div className="min-h-[80vh] flex items-center justify-center py-12 px-4 text-xs">
      <div className="bg-white rounded-3xl p-8 sm:p-10 border border-slate-100 shadow-xl max-w-md w-full text-center space-y-6">
        {loading ? (
          <div className="py-8 space-y-3">
            <Loader2 className="w-10 h-10 text-green-600 animate-spin mx-auto" />
            <h2 className="text-base font-black text-slate-800">Verifying Your Email Address...</h2>
            <p className="text-slate-400">Please wait while we validate your security token.</p>
          </div>
        ) : success ? (
          <div className="space-y-4">
            <div className="w-16 h-16 bg-emerald-100 text-emerald-600 rounded-full flex items-center justify-center mx-auto text-2xl shadow-inner">
              <CheckCircle2 className="w-8 h-8" />
            </div>
            <h1 className="text-2xl font-black text-slate-900">Email Verified!</h1>
            <p className="text-slate-600 font-medium leading-relaxed">{message}</p>
            <div className="pt-2">
              <Link
                to="/login"
                className="inline-block bg-green-600 hover:bg-green-700 text-white font-bold px-6 py-3 rounded-xl shadow-md transition-colors"
              >
                Continue to Login
              </Link>
            </div>
          </div>
        ) : (
          <div className="space-y-4">
            <div className="w-16 h-16 bg-red-100 text-red-600 rounded-full flex items-center justify-center mx-auto text-2xl shadow-inner">
              <XCircle className="w-8 h-8" />
            </div>
            <h1 className="text-2xl font-black text-slate-900">Verification Failed</h1>
            <p className="text-red-700 font-medium">{message}</p>
            <div className="pt-2">
              <Link
                to="/login"
                className="inline-block bg-slate-900 hover:bg-slate-800 text-white font-bold px-6 py-3 rounded-xl shadow-md transition-colors"
              >
                Return to Login
              </Link>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
