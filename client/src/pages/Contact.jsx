import React, { useState } from "react";
import {
  Mail,
  Phone,
  MapPin,
  Clock,
  Send,
  Loader2,
  CheckCircle,
  AlertCircle,
  MessageSquare,
  HelpCircle,
  ChevronDown
} from "lucide-react";
import { sendContactMessageApi } from "../api/contactApi";
import { useShop } from "../context/ShopContext";

export default function Contact() {
  const { showToast } = useShop();

  const [formData, setFormData] = useState({
    name: "",
    email: "",
    phone: "",
    subject: "",
    message: ""
  });
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [successMsg, setSuccessMsg] = useState("");
  const [errorMsg, setErrorMsg] = useState("");
  const [openFaq, setOpenFaq] = useState(null);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setSuccessMsg("");
    setErrorMsg("");

    if (!formData.name || !formData.email || !formData.subject || !formData.message) {
      setErrorMsg("Please fill in all required fields.");
      return;
    }

    setIsSubmitting(true);

    try {
      const res = await sendContactMessageApi(formData);
      if (res.data?.success) {
        setSuccessMsg(res.data.message || "Message sent successfully!");
        showToast("✓ Your message was submitted to database!", "success");
        setFormData({ name: "", email: "", phone: "", subject: "", message: "" });
      }
    } catch (err) {
      setErrorMsg(err.response?.data?.message || err.message || "Failed to send message. Try again.");
    } finally {
      setIsSubmitting(false);
    }
  };

  const faqs = [
    {
      q: "How does the 2-Hour Express Delivery work?",
      a: "Our local delivery partners pick up your fresh order directly from nearby certified organic farms and deliver it to your doorstep within 120 minutes of order confirmation."
    },
    {
      q: "Are all vegetables and fruits 100% organic?",
      a: "Yes! All products tagged with 'Organic' are harvested from certified local farms that use zero synthetic pesticides, harmful chemicals, or artificial ripeners."
    },
    {
      q: "What is your refund and return policy?",
      a: "If you receive any item that does not meet your fresh quality expectations, let us know within 24 hours for an instant replacement or refund credit to your account."
    },
    {
      q: "Can I schedule my delivery for a specific time?",
      a: "Yes! During checkout, you can select between 2-Hour Express Delivery or choose a preferred delivery slot for tomorrow morning."
    }
  ];

  return (
    <div className="space-y-12 pb-16 text-xs max-w-5xl mx-auto">
      {/* Header Banner */}
      <div className="bg-gradient-to-r from-emerald-900 via-green-800 to-emerald-950 text-white rounded-3xl p-8 sm:p-12 shadow-xl flex flex-col items-center text-center gap-3">
        <span className="bg-green-500/20 text-green-300 border border-green-400/30 px-3.5 py-1 rounded-full font-bold uppercase tracking-wider text-[10px]">
          We'd Love to Hear From You
        </span>
        <h1 className="text-3xl sm:text-4xl font-black">Contact FarmFresh Customer Support</h1>
        <p className="text-emerald-100 max-w-xl text-xs sm:text-sm leading-relaxed">
          Have questions about your order, our organic farms, or wholesale inquiries? Send us a message and our support team will respond within 2 hours.
        </p>
      </div>

      {/* Main Grid: Contact Info & Form */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-8 items-start">
        {/* Left Side: Contact Information Cards */}
        <div className="space-y-4">
          <div className="bg-white rounded-3xl p-6 border border-slate-100 shadow-xs space-y-4">
            <h2 className="font-bold text-slate-900 text-sm border-b border-slate-100 pb-3 flex items-center gap-2">
              <MessageSquare className="w-4 h-4 text-green-600" />
              <span>Get in Touch Directly</span>
            </h2>

            <div className="space-y-4 text-slate-700">
              <div className="flex items-start gap-3">
                <div className="w-9 h-9 rounded-xl bg-green-50 text-green-700 flex items-center justify-center shrink-0">
                  <Phone className="w-4 h-4" />
                </div>
                <div>
                  <div className="font-bold text-slate-900 text-xs">Customer Support Phone</div>
                  <div className="text-slate-500 mt-0.5">+91 98765 43210</div>
                  <div className="text-[10px] text-emerald-600 font-semibold">Toll Free • 24/7 Helpline</div>
                </div>
              </div>

              <div className="flex items-start gap-3">
                <div className="w-9 h-9 rounded-xl bg-green-50 text-green-700 flex items-center justify-center shrink-0">
                  <Mail className="w-4 h-4" />
                </div>
                <div>
                  <div className="font-bold text-slate-900 text-xs">Email Address</div>
                  <div className="text-slate-500 mt-0.5">support@farmfresh.com</div>
                  <div className="text-[10px] text-slate-400">Response within 2 hours</div>
                </div>
              </div>

              <div className="flex items-start gap-3">
                <div className="w-9 h-9 rounded-xl bg-green-50 text-green-700 flex items-center justify-center shrink-0">
                  <MapPin className="w-4 h-4" />
                </div>
                <div>
                  <div className="font-bold text-slate-900 text-xs">Farm Fresh Headquarters</div>
                  <div className="text-slate-500 mt-0.5 leading-relaxed">
                    FarmFresh Organic Hub, Plot 42, Green Valley Estate, Mumbai, MH - 400001
                  </div>
                </div>
              </div>

              <div className="flex items-start gap-3">
                <div className="w-9 h-9 rounded-xl bg-green-50 text-green-700 flex items-center justify-center shrink-0">
                  <Clock className="w-4 h-4" />
                </div>
                <div>
                  <div className="font-bold text-slate-900 text-xs">Operating Hours</div>
                  <div className="text-slate-500 mt-0.5">Mon - Sun: 7:00 AM - 9:00 PM</div>
                </div>
              </div>
            </div>
          </div>

          {/* Quick Support Guarantee Card */}
          <div className="bg-emerald-50 rounded-3xl p-6 border border-emerald-100 space-y-2">
            <h3 className="font-bold text-emerald-900 text-xs">🌱 100% Quality & Response Guarantee</h3>
            <p className="text-slate-600 text-[11px] leading-relaxed">
              Every message submitted here is saved directly to our MongoDB database and routed to our customer satisfaction manager.
            </p>
          </div>
        </div>

        {/* Right Side: Interactive Contact Form */}
        <div className="md:col-span-2 bg-white rounded-3xl p-6 sm:p-8 border border-slate-100 shadow-xs space-y-6">
          <div>
            <h2 className="text-lg font-bold text-slate-900">Send Us a Message</h2>
            <p className="text-slate-500 text-xs mt-0.5">Fill in the details below to submit an inquiry</p>
          </div>

          {successMsg && (
            <div className="bg-emerald-50 text-emerald-900 p-4 rounded-2xl border border-emerald-200 flex items-center gap-3 font-semibold">
              <CheckCircle className="w-5 h-5 text-emerald-600 shrink-0" />
              <span>{successMsg}</span>
            </div>
          )}

          {errorMsg && (
            <div className="bg-red-50 text-red-800 p-4 rounded-2xl border border-red-200 flex items-center gap-3 font-semibold">
              <AlertCircle className="w-5 h-5 text-red-600 shrink-0" />
              <span>{errorMsg}</span>
            </div>
          )}

          <form onSubmit={handleSubmit} className="space-y-4">
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label className="block text-slate-700 font-bold uppercase tracking-wider mb-1">
                  Your Full Name *
                </label>
                <input
                  type="text"
                  required
                  placeholder="e.g. John Doe"
                  value={formData.name}
                  onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                  className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3.5 py-2.5 outline-none focus:border-green-600 font-medium text-slate-900"
                />
              </div>

              <div>
                <label className="block text-slate-700 font-bold uppercase tracking-wider mb-1">
                  Email Address *
                </label>
                <input
                  type="email"
                  required
                  placeholder="e.g. john@example.com"
                  value={formData.email}
                  onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                  className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3.5 py-2.5 outline-none focus:border-green-600 font-medium text-slate-900"
                />
              </div>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label className="block text-slate-700 font-bold uppercase tracking-wider mb-1">
                  Phone Number
                </label>
                <input
                  type="text"
                  placeholder="e.g. +91 9876543210"
                  value={formData.phone}
                  onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
                  className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3.5 py-2.5 outline-none focus:border-green-600 font-medium text-slate-900"
                />
              </div>

              <div>
                <label className="block text-slate-700 font-bold uppercase tracking-wider mb-1">
                  Subject *
                </label>
                <input
                  type="text"
                  required
                  placeholder="e.g. Order Inquiry / Farm Quality"
                  value={formData.subject}
                  onChange={(e) => setFormData({ ...formData, subject: e.target.value })}
                  className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3.5 py-2.5 outline-none focus:border-green-600 font-medium text-slate-900"
                />
              </div>
            </div>

            <div>
              <label className="block text-slate-700 font-bold uppercase tracking-wider mb-1">
                Your Message *
              </label>
              <textarea
                required
                rows={5}
                placeholder="Write your detailed query or message here..."
                value={formData.message}
                onChange={(e) => setFormData({ ...formData, message: e.target.value })}
                className="w-full bg-slate-50 border border-slate-200 rounded-xl p-3.5 outline-none focus:border-green-600 font-medium text-slate-900"
              />
            </div>

            <button
              type="submit"
              disabled={isSubmitting}
              className="w-full bg-green-600 hover:bg-green-700 disabled:opacity-50 text-white font-bold py-3.5 rounded-xl shadow-md flex items-center justify-center gap-2 text-xs transition-colors"
            >
              {isSubmitting ? (
                <>
                  <Loader2 className="w-4 h-4 animate-spin" />
                  <span>Submitting Message to Database...</span>
                </>
              ) : (
                <>
                  <Send className="w-4 h-4" />
                  <span>Send Message</span>
                </>
              )}
            </button>
          </form>
        </div>
      </div>

      {/* Frequently Asked Questions Section */}
      <div className="bg-white rounded-3xl p-6 sm:p-8 border border-slate-100 shadow-xs space-y-6">
        <div className="flex items-center gap-2">
          <HelpCircle className="w-5 h-5 text-green-600" />
          <h2 className="text-lg font-bold text-slate-900">Frequently Asked Questions</h2>
        </div>

        <div className="space-y-3">
          {faqs.map((faq, idx) => (
            <div
              key={idx}
              className="border border-slate-200 rounded-2xl overflow-hidden transition-colors"
            >
              <button
                type="button"
                onClick={() => setOpenFaq(openFaq === idx ? null : idx)}
                className="w-full p-4 bg-slate-50 hover:bg-slate-100 text-left font-bold text-slate-800 flex items-center justify-between gap-4"
              >
                <span>{faq.q}</span>
                <ChevronDown className={`w-4 h-4 transition-transform ${openFaq === idx ? "rotate-180 text-green-600" : "text-slate-400"}`} />
              </button>
              {openFaq === idx && (
                <div className="p-4 text-slate-600 border-t border-slate-200 leading-relaxed">
                  {faq.a}
                </div>
              )}
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
