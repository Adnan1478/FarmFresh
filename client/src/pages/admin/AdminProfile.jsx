import React, { useState, useEffect } from "react";
import {
  User,
  Mail,
  Phone,
  ShieldCheck,
  KeyRound,
  CheckCircle,
  AlertCircle,
  Loader2,
  Save,
  Calendar,
  LogOut
} from "lucide-react";
import { useAuth } from "../../context/AuthContext";
import { updateProfileApi, changePasswordApi } from "../../api/authApi";
import { useShop } from "../../context/ShopContext";
import ImageUploader from "../../components/ImageUploader";

export default function AdminProfile() {
  const { user, setUser, logout } = useAuth();
  const { showToast } = useShop();

  // Profile Form State
  const [profileData, setProfileData] = useState({
    name: user?.name || "",
    email: user?.email || "",
    phone: user?.phone || "",
    avatar: user?.avatar || ""
  });
  const [isUpdatingProfile, setIsUpdatingProfile] = useState(false);
  const [profileError, setProfileError] = useState("");

  // Password Form State
  const [passData, setPassData] = useState({
    currentPassword: "",
    newPassword: "",
    confirmPassword: ""
  });
  const [isChangingPass, setIsChangingPass] = useState(false);
  const [passError, setPassError] = useState("");

  useEffect(() => {
    if (user) {
      setProfileData({
        name: user.name || "",
        email: user.email || "",
        phone: user.phone || "",
        avatar: user.avatar || ""
      });
    }
  }, [user]);

  // Handle Profile Update with Backend
  const handleUpdateProfile = async (e) => {
    e.preventDefault();
    setProfileError("");
    setIsUpdatingProfile(true);

    try {
      const res = await updateProfileApi(profileData);
      if (res.data?.success && res.data?.user) {
        setUser(res.data.user);
        showToast("✓ Admin profile updated successfully in backend!", "success");
      }
    } catch (err) {
      setProfileError(err.response?.data?.message || err.message || "Failed to update profile");
    } finally {
      setIsUpdatingProfile(false);
    }
  };

  // Handle Change Password with Backend
  const handleChangePassword = async (e) => {
    e.preventDefault();
    setPassError("");

    if (passData.newPassword !== passData.confirmPassword) {
      setPassError("New password and confirm password do not match");
      return;
    }

    if (passData.newPassword.length < 6) {
      setPassError("New password must be at least 6 characters long");
      return;
    }

    setIsChangingPass(true);

    try {
      const res = await changePasswordApi({
        currentPassword: passData.currentPassword,
        newPassword: passData.newPassword
      });

      if (res.data?.success) {
        showToast("✓ Password changed successfully!", "success");
        setPassData({ currentPassword: "", newPassword: "", confirmPassword: "" });
      }
    } catch (err) {
      setPassError(err.response?.data?.message || err.message || "Failed to change password");
    } finally {
      setIsChangingPass(false);
    }
  };

  return (
    <div className="space-y-6 pb-16 max-w-4xl mx-auto text-xs">
      {/* Top Banner Header */}
      <div className="bg-white p-6 rounded-3xl border border-slate-100 shadow-xs flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
        <div className="flex items-center gap-4">
          <div className="w-16 h-16 rounded-2xl bg-emerald-600 text-white font-black text-2xl flex items-center justify-center border-2 border-emerald-500 shadow-md shrink-0 overflow-hidden">
            {profileData.avatar ? (
              <img src={profileData.avatar} alt="Avatar" className="w-full h-full object-cover" />
            ) : (
              <span>{user?.name?.[0]?.toUpperCase() || "A"}</span>
            )}
          </div>

          <div>
            <div className="flex items-center gap-2">
              <h1 className="text-xl font-black text-slate-900">{user?.name || "Admin Manager"}</h1>
              <span className="bg-emerald-100 text-emerald-800 text-[10px] font-bold px-2.5 py-0.5 rounded-full flex items-center gap-1">
                <ShieldCheck className="w-3 h-3" /> System Administrator
              </span>
            </div>
            <p className="text-slate-400 text-xs mt-0.5">{user?.email || "admin@farmfresh.com"}</p>
          </div>
        </div>

        <button
          onClick={logout}
          className="bg-red-50 hover:bg-red-100 text-red-600 font-bold px-4 py-2 rounded-xl text-xs flex items-center gap-1.5 transition-colors shrink-0"
        >
          <LogOut className="w-4 h-4" />
          <span>Logout Admin</span>
        </button>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6 items-start">
        {/* Profile Information Form */}
        <div className="md:col-span-2 space-y-6">
          <div className="bg-white rounded-3xl p-6 border border-slate-100 shadow-xs space-y-4">
            <h2 className="text-sm font-bold text-slate-900 border-b border-slate-100 pb-3 flex items-center gap-2">
              <User className="w-4 h-4 text-green-600" />
              <span>Admin Profile Information</span>
            </h2>

            {profileError && (
              <div className="bg-red-50 text-red-800 p-3 rounded-xl border border-red-100 flex items-center gap-2 text-xs font-semibold">
                <AlertCircle className="w-4 h-4 text-red-600 shrink-0" />
                <span>{profileError}</span>
              </div>
            )}

            <form onSubmit={handleUpdateProfile} className="space-y-4">
              <div>
                <label className="block text-slate-700 font-bold uppercase tracking-wider mb-1">
                  Full Name *
                </label>
                <div className="relative">
                  <input
                    type="text"
                    required
                    value={profileData.name}
                    onChange={(e) => setProfileData({ ...profileData, name: e.target.value })}
                    className="w-full bg-slate-50 border border-slate-200 rounded-xl pl-9 pr-4 py-2.5 outline-none focus:border-green-600 font-medium text-slate-900"
                  />
                  <User className="w-4 h-4 text-slate-400 absolute left-3 top-3" />
                </div>
              </div>

              <div>
                <label className="block text-slate-700 font-bold uppercase tracking-wider mb-1">
                  Email Address *
                </label>
                <div className="relative">
                  <input
                    type="email"
                    required
                    value={profileData.email}
                    onChange={(e) => setProfileData({ ...profileData, email: e.target.value })}
                    className="w-full bg-slate-50 border border-slate-200 rounded-xl pl-9 pr-4 py-2.5 outline-none focus:border-green-600 font-medium text-slate-900"
                  />
                  <Mail className="w-4 h-4 text-slate-400 absolute left-3 top-3" />
                </div>
              </div>

              <div>
                <label className="block text-slate-700 font-bold uppercase tracking-wider mb-1">
                  Phone Number (10 Digits)
                </label>
                <div className="relative">
                  <input
                    type="tel"
                    maxLength={10}
                    placeholder="e.g. 9876543210"
                    value={profileData.phone}
                    onChange={(e) => setProfileData({ ...profileData, phone: e.target.value.replace(/\D/g, "").slice(0, 10) })}
                    className="w-full bg-slate-50 border border-slate-200 rounded-xl pl-9 pr-4 py-2.5 outline-none focus:border-green-600 font-medium text-slate-900"
                  />
                  <Phone className="w-4 h-4 text-slate-400 absolute left-3 top-3" />
                </div>
              </div>

              {/* Profile Avatar Image Selector */}
              <ImageUploader
                label="Admin Avatar Image"
                value={profileData.avatar}
                onChange={(imgUrl) => setProfileData({ ...profileData, avatar: imgUrl })}
              />

              <button
                type="submit"
                disabled={isUpdatingProfile}
                className="w-full bg-green-600 hover:bg-green-700 disabled:opacity-50 text-white font-bold py-3 rounded-xl shadow-md flex items-center justify-center gap-2 text-xs transition-colors"
              >
                {isUpdatingProfile ? (
                  <>
                    <Loader2 className="w-4 h-4 animate-spin" />
                    <span>Saving Profile to Backend...</span>
                  </>
                ) : (
                  <>
                    <Save className="w-4 h-4" />
                    <span>Save Admin Profile Changes</span>
                  </>
                )}
              </button>
            </form>
          </div>
        </div>

        {/* Security & Password Change Section */}
        <div className="space-y-6">
          <div className="bg-white rounded-3xl p-6 border border-slate-100 shadow-xs space-y-4">
            <h2 className="text-sm font-bold text-slate-900 border-b border-slate-100 pb-3 flex items-center gap-2">
              <KeyRound className="w-4 h-4 text-green-600" />
              <span>Change Security Password</span>
            </h2>

            {passError && (
              <div className="bg-red-50 text-red-800 p-3 rounded-xl border border-red-100 flex items-center gap-2 text-xs font-semibold">
                <AlertCircle className="w-4 h-4 text-red-600 shrink-0" />
                <span>{passError}</span>
              </div>
            )}

            <form onSubmit={handleChangePassword} className="space-y-3">
              <div>
                <label className="block text-slate-700 font-bold mb-1">Current Password *</label>
                <input
                  type="password"
                  required
                  value={passData.currentPassword}
                  onChange={(e) => setPassData({ ...passData, currentPassword: e.target.value })}
                  className="w-full bg-slate-50 border border-slate-200 rounded-xl p-2.5 outline-none focus:border-green-600 font-medium"
                />
              </div>

              <div>
                <label className="block text-slate-700 font-bold mb-1">New Password *</label>
                <input
                  type="password"
                  required
                  minLength={6}
                  value={passData.newPassword}
                  onChange={(e) => setPassData({ ...passData, newPassword: e.target.value })}
                  className="w-full bg-slate-50 border border-slate-200 rounded-xl p-2.5 outline-none focus:border-green-600 font-medium"
                />
              </div>

              <div>
                <label className="block text-slate-700 font-bold mb-1">Confirm New Password *</label>
                <input
                  type="password"
                  required
                  value={passData.confirmPassword}
                  onChange={(e) => setPassData({ ...passData, confirmPassword: e.target.value })}
                  className="w-full bg-slate-50 border border-slate-200 rounded-xl p-2.5 outline-none focus:border-green-600 font-medium"
                />
              </div>

              <button
                type="submit"
                disabled={isChangingPass}
                className="w-full bg-slate-900 hover:bg-slate-800 disabled:opacity-50 text-white font-bold py-2.5 rounded-xl shadow-xs flex items-center justify-center gap-2 text-xs transition-colors"
              >
                {isChangingPass ? (
                  <>
                    <Loader2 className="w-4 h-4 animate-spin" />
                    <span>Updating Password...</span>
                  </>
                ) : (
                  <span>Update Password</span>
                )}
              </button>
            </form>
          </div>

          {/* System Account Metadata Box */}
          <div className="bg-slate-50 rounded-3xl p-5 border border-slate-200 space-y-3">
            <h3 className="font-bold text-slate-900 text-xs uppercase tracking-wider">Account Metadata</h3>
            <div className="space-y-2 text-slate-600 text-xs">
              <div className="flex justify-between">
                <span>Account Role:</span>
                <span className="font-bold text-slate-900 uppercase">{user?.role || "admin"}</span>
              </div>
              <div className="flex justify-between">
                <span>Session Status:</span>
                <span className="font-bold text-emerald-600 flex items-center gap-1">
                  <CheckCircle className="w-3 h-3" /> Active HTTP Cookie
                </span>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
