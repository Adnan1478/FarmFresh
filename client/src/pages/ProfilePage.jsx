import React, { useState, useEffect, useRef } from "react";
import { Link, useNavigate } from "react-router-dom";
import {
  User,
  Mail,
  Phone,
  MapPin,
  Lock,
  Plus,
  Trash2,
  Check,
  Loader2,
  PackageCheck,
  Heart,
  ShieldCheck,
  LogOut,
  Camera,
  Save,
  AlertCircle,
  Building,
  Home,
  X
} from "lucide-react";
import { useShop } from "../context/ShopContext";
import { useAuth } from "../context/AuthContext";
import { updateProfileApi, changePasswordApi } from "../api/authApi";
import { uploadImageApi } from "../api/uploadApi";

export default function ProfilePage() {
  const { orders, wishlist, showToast } = useShop();
  const { user, setUser, logout } = useAuth();
  const navigate = useNavigate();

  const fileInputRef = useRef(null);
  const [activeTab, setActiveTab] = useState("personal");

  // User Profile Form State
  const [userInfo, setUserInfo] = useState({
    name: user?.name || "",
    email: user?.email || "",
    phone: user?.phone || "",
    avatar: user?.avatar || ""
  });
  const [isSavingUser, setIsSavingUser] = useState(false);
  const [isUploadingAvatar, setIsUploadingAvatar] = useState(false);
  const [profileError, setProfileError] = useState("");

  // Address Form State
  const [addressData, setAddressData] = useState({
    fullName: user?.address?.fullName || user?.name || "",
    phone: user?.address?.phone || user?.phone || "",
    addressLine: user?.address?.addressLine || "",
    city: user?.address?.city || "",
    state: user?.address?.state || "",
    pincode: user?.address?.pincode || "",
    landmark: user?.address?.landmark || ""
  });
  const [isSavingAddress, setIsSavingAddress] = useState(false);

  // Password Form State
  const [passwordData, setPasswordData] = useState({
    currentPassword: "",
    newPassword: "",
    confirmPassword: ""
  });
  const [isSavingPassword, setIsSavingPassword] = useState(false);
  const [passwordError, setPasswordError] = useState("");

  useEffect(() => {
    if (user) {
      setUserInfo({
        name: user.name || "",
        email: user.email || "",
        phone: user.phone || "",
        avatar: user.avatar || ""
      });

      if (user.address) {
        setAddressData({
          fullName: user.address.fullName || user.name || "",
          phone: user.address.phone || user.phone || "",
          addressLine: user.address.addressLine || "",
          city: user.address.city || "",
          state: user.address.state || "",
          pincode: user.address.pincode || "",
          landmark: user.address.landmark || ""
        });
      }
    }
  }, [user]);

  // Handle Camera Button click to trigger image picker
  const handleTriggerFileInput = () => {
    if (fileInputRef.current) {
      fileInputRef.current.click();
    }
  };

  // Handle Image File Selection and Upload to Backend Server
  const handleFileChange = async (e) => {
    const file = e.target.files?.[0];
    if (!file) return;

    // Transient UI blob preview
    const tempUrl = URL.createObjectURL(file);
    setUserInfo((prev) => ({ ...prev, avatar: tempUrl }));
    setIsUploadingAvatar(true);

    try {
      const formData = new FormData();
      formData.append("image", file);

      // Upload file directly to Cloudinary
      const res = await uploadImageApi(formData);
      if (res.data?.success && res.data?.url) {
        const cloudinaryUrl = res.data.url;
        setUserInfo((prev) => ({ ...prev, avatar: cloudinaryUrl }));

        // Save Cloudinary URL to MongoDB user profile
        const updateRes = await updateProfileApi({ avatar: cloudinaryUrl });
        if (updateRes.data?.success && updateRes.data?.user) {
          setUser(updateRes.data.user);
          showToast("✓ Profile photo updated on Cloudinary!", "success");
        }
      } else {
        throw new Error(res.data?.message || "Failed to receive Cloudinary URL");
      }
    } catch (err) {
      showToast(err.response?.data?.message || err.message || "Failed to upload avatar to Cloudinary", "error");
      setUserInfo((prev) => ({ ...prev, avatar: user?.avatar || "" }));
    } finally {
      setIsUploadingAvatar(false);
    }
  };

  // Clear Profile Photo in MongoDB
  const handleClearAvatar = async (e) => {
    if (e) e.stopPropagation();

    setUserInfo((prev) => ({ ...prev, avatar: "" }));

    try {
      const updateRes = await updateProfileApi({ avatar: "" });
      if (updateRes.data?.success && updateRes.data?.user) {
        setUser(updateRes.data.user);
        showToast("✓ Profile photo cleared!", "info");
      }
    } catch (err) {
      showToast("Failed to clear profile photo", "error");
    }
  };

  // Save Profile Info in MongoDB
  const handleSaveProfile = async (e) => {
    e.preventDefault();
    setProfileError("");
    setIsSavingUser(true);

    try {
      const res = await updateProfileApi({
        name: userInfo.name,
        email: userInfo.email,
        phone: userInfo.phone,
        avatar: userInfo.avatar
      });

      if (res.data?.success && res.data?.user) {
        setUser(res.data.user);
        showToast("✓ Profile information updated in database!", "success");
      }
    } catch (err) {
      setProfileError(err.response?.data?.message || err.message || "Failed to update profile");
    } finally {
      setIsSavingUser(false);
    }
  };

  // Save Delivery Address in MongoDB
  const handleSaveAddress = async (e) => {
    e.preventDefault();
    setIsSavingAddress(true);

    try {
      const res = await updateProfileApi({
        address: addressData
      });

      if (res.data?.success && res.data?.user) {
        setUser(res.data.user);
        showToast("✓ Delivery address saved in database!", "success");
      }
    } catch (err) {
      showToast(err.response?.data?.message || err.message || "Failed to save address", "error");
    } finally {
      setIsSavingAddress(false);
    }
  };

  // Change Password in MongoDB
  const handleChangePassword = async (e) => {
    e.preventDefault();
    setPasswordError("");

    if (passwordData.newPassword !== passwordData.confirmPassword) {
      setPasswordError("New password and confirm password do not match");
      return;
    }

    if (passwordData.newPassword.length < 6) {
      setPasswordError("New password must be at least 6 characters long");
      return;
    }

    setIsSavingPassword(true);

    try {
      const res = await changePasswordApi({
        currentPassword: passwordData.currentPassword,
        newPassword: passwordData.newPassword
      });

      if (res.data?.success) {
        showToast("✓ Security password changed successfully!", "success");
        setPasswordData({ currentPassword: "", newPassword: "", confirmPassword: "" });
      }
    } catch (err) {
      setPasswordError(err.response?.data?.message || err.message || "Failed to change password");
    } finally {
      setIsSavingPassword(false);
    }
  };

  const handleLogout = () => {
    logout();
    showToast("Logged out successfully", "info");
    navigate("/login");
  };

  return (
    <div className="space-y-8 pb-16 max-w-4xl mx-auto text-xs">
      {/* Top Banner & Profile Header Card */}
      <div className="bg-white rounded-3xl p-6 sm:p-8 border border-slate-100 shadow-xs flex flex-col sm:flex-row items-center justify-between gap-6">
        <div className="flex flex-col sm:flex-row items-center gap-5 text-center sm:text-left">
          {/* Avatar Container with Camera Overlay & Clear Photo Button */}
          <div className="relative group cursor-pointer" onClick={handleTriggerFileInput}>
            <div className="w-20 h-20 rounded-2xl bg-green-600 text-white font-black text-3xl flex items-center justify-center shadow-md overflow-hidden border-2 border-emerald-500 relative">
              {userInfo.avatar ? (
                <img src={userInfo.avatar} alt="Avatar" className="w-full h-full object-cover" />
              ) : (
                <span>{user?.name?.[0]?.toUpperCase() || "U"}</span>
              )}
            </div>

            {/* Camera Overlay Icon Button */}
            <button
              type="button"
              onClick={handleTriggerFileInput}
              disabled={isUploadingAvatar}
              className="absolute -bottom-1 -right-1 p-2 bg-emerald-600 hover:bg-emerald-700 text-white rounded-full shadow-lg border-2 border-white transition-transform hover:scale-110 active:scale-95 flex items-center justify-center"
              title="Click camera icon to change photo from folder"
            >
              {isUploadingAvatar ? (
                <Loader2 className="w-3.5 h-3.5 animate-spin" />
              ) : (
                <Camera className="w-3.5 h-3.5" />
              )}
            </button>

            {/* Clear Photo Button (Visible when avatar exists) */}
            {userInfo.avatar && (
              <button
                type="button"
                onClick={handleClearAvatar}
                className="absolute -top-1 -right-1 p-1.5 bg-red-600 hover:bg-red-700 text-white rounded-full shadow-lg border-2 border-white transition-transform hover:scale-110 active:scale-95 flex items-center justify-center z-10"
                title="Clear / Remove profile photo"
              >
                <Trash2 className="w-3 h-3" />
              </button>
            )}

            {/* Hidden File Picker Input */}
            <input
              type="file"
              ref={fileInputRef}
              onChange={handleFileChange}
              accept="image/*"
              className="hidden"
            />
          </div>

          <div>
            <div className="flex items-center justify-center sm:justify-start gap-2">
              <h1 className="text-2xl font-black text-slate-900">{user?.name || "Customer User"}</h1>
              <span className="bg-green-100 text-green-800 text-[10px] font-bold px-2.5 py-0.5 rounded-full capitalize">
                🌱 {user?.role || "Customer"}
              </span>
            </div>
            <p className="text-xs text-slate-500 mt-0.5">{user?.email || "user@farmfresh.com"}</p>
            
            <div className="flex items-center justify-center sm:justify-start gap-3 mt-1">
              <button
                type="button"
                onClick={handleTriggerFileInput}
                className="text-[11px] text-green-600 hover:underline font-bold flex items-center gap-1"
              >
                <Camera className="w-3 h-3" /> Change Photo
              </button>

              {userInfo.avatar && (
                <button
                  type="button"
                  onClick={handleClearAvatar}
                  className="text-[11px] text-red-500 hover:underline font-bold flex items-center gap-1"
                >
                  <Trash2 className="w-3 h-3" /> Clear Photo
                </button>
              )}
            </div>
          </div>
        </div>

        {/* Account Quick Stats */}
        <div className="flex items-center gap-3 text-center border-t sm:border-t-0 sm:border-l border-slate-100 pt-4 sm:pt-0 sm:pl-6 w-full sm:w-auto justify-around">
          <Link to="/orders" className="p-3 bg-slate-50 hover:bg-slate-100 rounded-2xl transition-colors min-w-[70px]">
            <div className="text-lg font-black text-slate-900">{orders.length}</div>
            <div className="text-[11px] text-slate-500 font-semibold">Orders</div>
          </Link>

          <Link to="/wishlist" className="p-3 bg-slate-50 hover:bg-slate-100 rounded-2xl transition-colors min-w-[70px]">
            <div className="text-lg font-black text-slate-900">{wishlist.length}</div>
            <div className="text-[11px] text-slate-500 font-semibold">Wishlist</div>
          </Link>

          <button onClick={() => setActiveTab("addresses")} className="p-3 bg-slate-50 hover:bg-slate-100 rounded-2xl transition-colors min-w-[70px]">
            <div className="text-lg font-black text-emerald-600">{user?.address?.addressLine ? "1" : "0"}</div>
            <div className="text-[11px] text-slate-500 font-semibold">Address</div>
          </button>
        </div>
      </div>

      {/* Main Tabbed Profile Navigation */}
      <div className="bg-white rounded-3xl p-6 sm:p-8 border border-slate-100 shadow-xs space-y-6">
        <div className="flex border-b border-slate-100 gap-4 sm:gap-8 text-xs font-bold overflow-x-auto">
          <button
            onClick={() => setActiveTab("personal")}
            className={`pb-3.5 border-b-2 transition-colors flex items-center gap-2 whitespace-nowrap ${
              activeTab === "personal" ? "border-green-600 text-green-600" : "border-transparent text-slate-400 hover:text-slate-700"
            }`}
          >
            <User className="w-4 h-4" />
            <span>Personal Details</span>
          </button>

          <button
            onClick={() => setActiveTab("addresses")}
            className={`pb-3.5 border-b-2 transition-colors flex items-center gap-2 whitespace-nowrap ${
              activeTab === "addresses" ? "border-green-600 text-green-600" : "border-transparent text-slate-400 hover:text-slate-700"
            }`}
          >
            <MapPin className="w-4 h-4" />
            <span>Shipping Address</span>
          </button>

          <button
            onClick={() => setActiveTab("security")}
            className={`pb-3.5 border-b-2 transition-colors flex items-center gap-2 whitespace-nowrap ${
              activeTab === "security" ? "border-green-600 text-green-600" : "border-transparent text-slate-400 hover:text-slate-700"
            }`}
          >
            <Lock className="w-4 h-4" />
            <span>Password & Security</span>
          </button>

          <button
            onClick={() => setActiveTab("links")}
            className={`pb-3.5 border-b-2 transition-colors flex items-center gap-2 whitespace-nowrap ${
              activeTab === "links" ? "border-green-600 text-green-600" : "border-transparent text-slate-400 hover:text-slate-700"
            }`}
          >
            <ShieldCheck className="w-4 h-4" />
            <span>Account Actions</span>
          </button>
        </div>

        {/* Tab 1: Personal Details Form */}
        {activeTab === "personal" && (
          <form onSubmit={handleSaveProfile} className="space-y-4 max-w-lg text-xs">
            <h3 className="font-bold text-slate-900 text-sm">Update Personal Information</h3>

            {profileError && (
              <div className="bg-red-50 text-red-800 p-3 rounded-xl border border-red-100 flex items-center gap-2 font-semibold">
                <AlertCircle className="w-4 h-4 text-red-600 shrink-0" />
                <span>{profileError}</span>
              </div>
            )}

            <div className="space-y-1.5">
              <label className="block text-slate-700 font-bold uppercase tracking-wider">Full Name *</label>
              <div className="relative flex items-center">
                <input
                  type="text"
                  required
                  value={userInfo.name}
                  onChange={(e) => setUserInfo({ ...userInfo, name: e.target.value })}
                  className="w-full bg-slate-50 border border-slate-200 rounded-xl pl-10 pr-4 py-2.5 outline-none focus:border-green-600 font-medium text-slate-900"
                />
                <User className="w-4 h-4 text-slate-400 absolute left-3.5" />
              </div>
            </div>

            <div className="space-y-1.5">
              <label className="block text-slate-700 font-bold uppercase tracking-wider">Email Address *</label>
              <div className="relative flex items-center">
                <input
                  type="email"
                  required
                  value={userInfo.email}
                  onChange={(e) => setUserInfo({ ...userInfo, email: e.target.value })}
                  className="w-full bg-slate-50 border border-slate-200 rounded-xl pl-10 pr-4 py-2.5 outline-none focus:border-green-600 font-medium text-slate-900"
                />
                <Mail className="w-4 h-4 text-slate-400 absolute left-3.5" />
              </div>
            </div>

            <div className="space-y-1.5">
              <label className="block text-slate-700 font-bold uppercase tracking-wider">Phone Number</label>
              <div className="relative flex items-center">
                <input
                  type="text"
                  placeholder="e.g. +91 9876543210"
                  value={userInfo.phone}
                  onChange={(e) => setUserInfo({ ...userInfo, phone: e.target.value })}
                  className="w-full bg-slate-50 border border-slate-200 rounded-xl pl-10 pr-4 py-2.5 outline-none focus:border-green-600 font-medium text-slate-900"
                />
                <Phone className="w-4 h-4 text-slate-400 absolute left-3.5" />
              </div>
            </div>

            <button
              type="submit"
              disabled={isSavingUser}
              className="bg-green-600 hover:bg-green-700 disabled:opacity-50 text-white font-bold px-6 py-3 rounded-xl shadow-md flex items-center gap-2 transition-all text-xs"
            >
              {isSavingUser ? (
                <>
                  <Loader2 className="w-4 h-4 animate-spin" />
                  <span>Saving to Database...</span>
                </>
              ) : (
                <>
                  <Save className="w-4 h-4" />
                  <span>Save Personal Details</span>
                </>
              )}
            </button>
          </form>
        )}

        {/* Tab 2: Shipping Address Form */}
        {activeTab === "addresses" && (
          <form onSubmit={handleSaveAddress} className="space-y-4 max-w-lg text-xs">
            <h3 className="font-bold text-slate-900 text-sm">Default Delivery Address</h3>

            <div className="space-y-3">
              <div>
                <label className="block text-slate-700 font-bold mb-1">Recipient Name</label>
                <input
                  type="text"
                  value={addressData.fullName}
                  onChange={(e) => setAddressData({ ...addressData, fullName: e.target.value })}
                  className="w-full bg-slate-50 border border-slate-200 rounded-xl p-2.5 outline-none focus:border-green-600 font-medium"
                />
              </div>

              <div>
                <label className="block text-slate-700 font-bold mb-1">Contact Phone</label>
                <input
                  type="text"
                  value={addressData.phone}
                  onChange={(e) => setAddressData({ ...addressData, phone: e.target.value })}
                  className="w-full bg-slate-50 border border-slate-200 rounded-xl p-2.5 outline-none focus:border-green-600 font-medium"
                />
              </div>

              <div>
                <label className="block text-slate-700 font-bold mb-1">Street / Flat / Address Line *</label>
                <input
                  type="text"
                  required
                  placeholder="e.g. House No. 402, Green Meadows, MG Road"
                  value={addressData.addressLine}
                  onChange={(e) => setAddressData({ ...addressData, addressLine: e.target.value })}
                  className="w-full bg-slate-50 border border-slate-200 rounded-xl p-2.5 outline-none focus:border-green-600 font-medium"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-slate-700 font-bold mb-1">City *</label>
                  <input
                    type="text"
                    required
                    value={addressData.city}
                    onChange={(e) => setAddressData({ ...addressData, city: e.target.value })}
                    className="w-full bg-slate-50 border border-slate-200 rounded-xl p-2.5 outline-none focus:border-green-600 font-medium"
                  />
                </div>

                <div>
                  <label className="block text-slate-700 font-bold mb-1">Pincode *</label>
                  <input
                    type="text"
                    required
                    value={addressData.pincode}
                    onChange={(e) => setAddressData({ ...addressData, pincode: e.target.value })}
                    className="w-full bg-slate-50 border border-slate-200 rounded-xl p-2.5 outline-none focus:border-green-600 font-medium"
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-slate-700 font-bold mb-1">State</label>
                  <input
                    type="text"
                    value={addressData.state}
                    onChange={(e) => setAddressData({ ...addressData, state: e.target.value })}
                    className="w-full bg-slate-50 border border-slate-200 rounded-xl p-2.5 outline-none focus:border-green-600 font-medium"
                  />
                </div>

                <div>
                  <label className="block text-slate-700 font-bold mb-1">Landmark</label>
                  <input
                    type="text"
                    placeholder="Near Park / Bank"
                    value={addressData.landmark}
                    onChange={(e) => setAddressData({ ...addressData, landmark: e.target.value })}
                    className="w-full bg-slate-50 border border-slate-200 rounded-xl p-2.5 outline-none focus:border-green-600 font-medium"
                  />
                </div>
              </div>
            </div>

            <button
              type="submit"
              disabled={isSavingAddress}
              className="bg-green-600 hover:bg-green-700 disabled:opacity-50 text-white font-bold px-6 py-3 rounded-xl shadow-md flex items-center gap-2 transition-all text-xs"
            >
              {isSavingAddress ? (
                <>
                  <Loader2 className="w-4 h-4 animate-spin" />
                  <span>Saving Address...</span>
                </>
              ) : (
                <>
                  <Save className="w-4 h-4" />
                  <span>Save Delivery Address</span>
                </>
              )}
            </button>
          </form>
        )}

        {/* Tab 3: Security & Change Password */}
        {activeTab === "security" && (
          <form onSubmit={handleChangePassword} className="space-y-4 max-w-lg text-xs">
            <h3 className="font-bold text-slate-900 text-sm">Change Account Security Password</h3>

            {passwordError && (
              <div className="bg-red-50 text-red-800 p-3 rounded-xl border border-red-100 flex items-center gap-2 font-semibold">
                <AlertCircle className="w-4 h-4 text-red-600 shrink-0" />
                <span>{passwordError}</span>
              </div>
            )}

            <div className="space-y-1.5">
              <label className="block text-slate-700 font-bold uppercase tracking-wider">Current Password *</label>
              <input
                type="password"
                required
                value={passwordData.currentPassword}
                onChange={(e) => setPasswordData({ ...passwordData, currentPassword: e.target.value })}
                className="w-full bg-slate-50 border border-slate-200 rounded-xl p-2.5 outline-none focus:border-green-600 font-medium"
              />
            </div>

            <div className="space-y-1.5">
              <label className="block text-slate-700 font-bold uppercase tracking-wider">New Password *</label>
              <input
                type="password"
                required
                minLength={6}
                value={passwordData.newPassword}
                onChange={(e) => setPasswordData({ ...passwordData, newPassword: e.target.value })}
                className="w-full bg-slate-50 border border-slate-200 rounded-xl p-2.5 outline-none focus:border-green-600 font-medium"
              />
            </div>

            <div className="space-y-1.5">
              <label className="block text-slate-700 font-bold uppercase tracking-wider">Confirm New Password *</label>
              <input
                type="password"
                required
                value={passwordData.confirmPassword}
                onChange={(e) => setPasswordData({ ...passwordData, confirmPassword: e.target.value })}
                className="w-full bg-slate-50 border border-slate-200 rounded-xl p-2.5 outline-none focus:border-green-600 font-medium"
              />
            </div>

            <button
              type="submit"
              disabled={isSavingPassword}
              className="bg-slate-900 hover:bg-slate-800 disabled:opacity-50 text-white font-bold px-6 py-3 rounded-xl shadow-md flex items-center gap-2 transition-all text-xs"
            >
              {isSavingPassword ? (
                <>
                  <Loader2 className="w-4 h-4 animate-spin" />
                  <span>Updating Password...</span>
                </>
              ) : (
                <span>Update Password</span>
              )}
            </button>
          </form>
        )}

        {/* Tab 4: Account Quick Links & Logout */}
        {activeTab === "links" && (
          <div className="space-y-4 max-w-md text-xs">
            <h3 className="font-bold text-slate-900 text-sm">Account Operations</h3>

            <div className="space-y-2">
              <Link
                to="/orders"
                className="flex items-center justify-between p-3.5 bg-slate-50 hover:bg-slate-100 rounded-2xl font-bold text-slate-800 transition-colors"
              >
                <div className="flex items-center gap-3">
                  <PackageCheck className="w-4 h-4 text-green-600" />
                  <span>View My Orders ({orders.length})</span>
                </div>
                <span>→</span>
              </Link>

              <Link
                to="/wishlist"
                className="flex items-center justify-between p-3.5 bg-slate-50 hover:bg-slate-100 rounded-2xl font-bold text-slate-800 transition-colors"
              >
                <div className="flex items-center gap-3">
                  <Heart className="w-4 h-4 text-red-500" />
                  <span>View Wishlist ({wishlist.length})</span>
                </div>
                <span>→</span>
              </Link>

              {user?.role === "admin" && (
                <Link
                  to="/admin/dashboard"
                  className="flex items-center justify-between p-3.5 bg-emerald-50 hover:bg-emerald-100 rounded-2xl font-bold text-emerald-900 transition-colors"
                >
                  <div className="flex items-center gap-3">
                    <ShieldCheck className="w-4 h-4 text-emerald-600" />
                    <span>Switch to Admin Control Panel</span>
                  </div>
                  <span>→</span>
                </Link>
              )}
            </div>

            <div className="pt-4 border-t border-slate-100">
              <button
                onClick={handleLogout}
                className="w-full bg-red-50 hover:bg-red-100 text-red-600 font-bold py-3 px-4 rounded-xl flex items-center justify-center gap-2 transition-colors text-xs"
              >
                <LogOut className="w-4 h-4" />
                <span>Log Out of Account</span>
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
