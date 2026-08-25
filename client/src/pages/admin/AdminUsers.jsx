import React, { useState, useEffect } from "react";
import {
  Users,
  Search,
  CheckCircle,
  XCircle,
  ShieldCheck,
  UserCheck,
  UserX,
  Trash2,
  Loader2,
  Mail,
  Phone,
  Calendar,
  Lock
} from "lucide-react";
import { getUsersApi, updateUserStatusApi, updateUserRoleApi, deleteUserApi } from "../../api/userApi";
import { useShop } from "../../context/ShopContext";
import { useAuth } from "../../context/AuthContext";

export default function AdminUsers() {
  const { showToast } = useShop();
  const { user: currentAdmin } = useAuth();

  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState("");
  const [statusFilter, setStatusFilter] = useState("all");
  const [roleFilter, setRoleFilter] = useState("all");
  const [updatingId, setUpdatingId] = useState(null);

  const fetchUsers = async () => {
    try {
      setLoading(true);
      const res = await getUsersApi({
        status: statusFilter,
        role: roleFilter,
        search: searchQuery
      });

      if (res.data?.success) {
        setUsers(res.data.data);
      }
    } catch (err) {
      showToast("Error fetching users list from server", "error");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchUsers();
  }, [statusFilter, roleFilter]);

  // Toggle Active / Inactive Status
  const handleToggleStatus = async (user) => {
    const newStatus = !user.isActive;

    if (user._id === currentAdmin?._id && newStatus === false) {
      showToast("Safety Guard: You cannot deactivate your own logged-in admin account!", "error");
      return;
    }

    setUpdatingId(user._id);
    try {
      const res = await updateUserStatusApi(user._id, newStatus);
      if (res.data?.success) {
        showToast(
          `✓ User "${user.name}" status set to ${newStatus ? "ACTIVE" : "INACTIVE (Deactivated)"}`,
          newStatus ? "success" : "info"
        );
        fetchUsers();
      }
    } catch (err) {
      showToast(err.response?.data?.message || err.message || "Failed to update user status", "error");
    } finally {
      setUpdatingId(null);
    }
  };

  // Change User Role
  const handleRoleChange = async (userId, newRole) => {
    setUpdatingId(userId);
    try {
      const res = await updateUserRoleApi(userId, newRole);
      if (res.data?.success) {
        showToast(`✓ User role updated to "${newRole}"`, "success");
        fetchUsers();
      }
    } catch (err) {
      showToast(err.response?.data?.message || err.message || "Failed to update user role", "error");
    } finally {
      setUpdatingId(null);
    }
  };

  // Delete User
  const handleDeleteUser = async (user) => {
    if (user._id === currentAdmin?._id) {
      showToast("You cannot delete your own logged-in account!", "error");
      return;
    }

    if (window.confirm(`Are you sure you want to delete user "${user.name}" (${user.email})?`)) {
      setUpdatingId(user._id);
      try {
        const res = await deleteUserApi(user._id);
        if (res.data?.success) {
          showToast(`User "${user.name}" deleted successfully`, "info");
          fetchUsers();
        }
      } catch (err) {
        showToast(err.response?.data?.message || err.message || "Failed to delete user", "error");
      } finally {
        setUpdatingId(null);
      }
    }
  };

  return (
    <div className="space-y-6 pb-12 text-xs">
      {/* Header */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 bg-white p-6 rounded-3xl border border-slate-100 shadow-xs">
        <div>
          <h1 className="text-xl font-black text-slate-900 flex items-center gap-2">
            <Users className="w-6 h-6 text-green-600" />
            <span>User Account Management & Status Control</span>
          </h1>
          <p className="text-slate-500 mt-1">
            Modify user active/inactive access rights. Inactive users are blocked from logging in or placing orders.
          </p>
        </div>

        <div className="bg-slate-50 border border-slate-200 px-4 py-2 rounded-2xl font-bold text-slate-700">
          Total Users: <span className="text-green-600 font-black text-sm">{users.length}</span>
        </div>
      </div>

      {/* Filter Bar */}
      <div className="bg-white p-4 rounded-2xl border border-slate-100 shadow-xs flex flex-col md:flex-row items-center justify-between gap-4">
        {/* Status & Role Filters */}
        <div className="flex items-center gap-3 overflow-x-auto w-full md:w-auto font-bold">
          <div className="flex items-center gap-1.5 bg-slate-50 border border-slate-200 px-3 py-1.5 rounded-xl">
            <span className="text-slate-400">Status:</span>
            <select
              value={statusFilter}
              onChange={(e) => setStatusFilter(e.target.value)}
              className="bg-transparent text-slate-800 outline-none font-bold cursor-pointer"
            >
              <option value="all">All Statuses</option>
              <option value="active">Active Only</option>
              <option value="inactive">Inactive Only</option>
            </select>
          </div>

          <div className="flex items-center gap-1.5 bg-slate-50 border border-slate-200 px-3 py-1.5 rounded-xl">
            <span className="text-slate-400">Role:</span>
            <select
              value={roleFilter}
              onChange={(e) => setRoleFilter(e.target.value)}
              className="bg-transparent text-slate-800 outline-none font-bold cursor-pointer"
            >
              <option value="all">All Roles</option>
              <option value="customer">Customers</option>
              <option value="admin">Admins</option>
              <option value="vendor">Vendors</option>
              <option value="deliveryboy">Delivery Boys</option>
            </select>
          </div>
        </div>

        {/* Search Input */}
        <div className="relative w-full md:w-72">
          <input
            type="text"
            placeholder="Search name, email, phone..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            onKeyDown={(e) => e.key === "Enter" && fetchUsers()}
            className="w-full bg-slate-50 border border-slate-200 text-xs rounded-xl pl-9 pr-4 py-2 outline-none focus:border-green-600 font-medium"
          />
          <Search className="w-4 h-4 text-slate-400 absolute left-3 top-2.5" />
        </div>
      </div>

      {/* Users Table */}
      {loading ? (
        <div className="min-h-[40vh] flex flex-col items-center justify-center p-8 gap-3">
          <Loader2 className="w-8 h-8 text-green-600 animate-spin" />
          <p className="text-slate-500 font-semibold">Loading user accounts from database...</p>
        </div>
      ) : users.length === 0 ? (
        <div className="bg-white rounded-3xl p-12 text-center border border-slate-100 space-y-3">
          <Users className="w-12 h-12 text-slate-300 mx-auto" />
          <h3 className="text-base font-bold text-slate-800">No Users Found</h3>
          <p className="text-slate-500 max-w-sm mx-auto">
            No registered user accounts match the selected status or filter criteria.
          </p>
        </div>
      ) : (
        <div className="bg-white rounded-3xl border border-slate-100 shadow-xs overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs">
              <thead className="bg-slate-50 border-b border-slate-100 text-slate-500 font-bold uppercase tracking-wider">
                <tr>
                  <th className="p-4">User Details</th>
                  <th className="p-4">Contact</th>
                  <th className="p-4">Role</th>
                  <th className="p-4">Status Access</th>
                  <th className="p-4">Joined Date</th>
                  <th className="p-4 text-right">Status Action / Controls</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100 font-medium text-slate-800">
                {users.map((u) => (
                  <tr key={u._id} className={`hover:bg-slate-50/80 transition-colors ${!u.isActive ? "bg-red-50/30" : ""}`}>
                    <td className="p-4 flex items-center gap-3">
                      <div className={`w-10 h-10 rounded-2xl overflow-hidden shrink-0 flex items-center justify-center font-bold text-sm text-white ${
                        u.role === "admin" ? "bg-emerald-600" : u.isActive ? "bg-slate-800" : "bg-red-400"
                      }`}>
                        {u.avatar ? (
                          <img src={u.avatar} alt={u.name} className="w-full h-full object-cover" />
                        ) : (
                          <span>{u.name?.[0]?.toUpperCase() || "U"}</span>
                        )}
                      </div>

                      <div>
                        <div className="font-bold text-slate-900 text-sm flex items-center gap-1.5">
                          <span>{u.name}</span>
                          {u._id === currentAdmin?._id && (
                            <span className="bg-slate-200 text-slate-700 text-[9px] font-bold px-1.5 py-0.5 rounded">You</span>
                          )}
                        </div>
                        <div className="text-[11px] text-slate-400">{u.email}</div>
                      </div>
                    </td>

                    <td className="p-4 text-slate-600">
                      <div className="flex items-center gap-1">
                        <Phone className="w-3 h-3 text-slate-400" />
                        <span>{u.phone || "N/A"}</span>
                      </div>
                    </td>

                    <td className="p-4">
                      {/* Role Selector */}
                      <select
                        value={u.role}
                        disabled={updatingId === u._id || u._id === currentAdmin?._id}
                        onChange={(e) => handleRoleChange(u._id, e.target.value)}
                        className="bg-slate-50 border border-slate-200 text-[11px] font-bold rounded-xl p-1.5 outline-none focus:border-green-600 capitalize cursor-pointer"
                      >
                        <option value="customer">Customer</option>
                        <option value="admin">Admin</option>
                        <option value="vendor">Vendor</option>
                        <option value="deliveryboy">Delivery Boy</option>
                      </select>
                    </td>

                    <td className="p-4">
                      {u.isActive ? (
                        <span className="bg-emerald-100 text-emerald-800 text-[10px] font-bold px-2.5 py-1 rounded-full flex items-center gap-1 w-fit">
                          <CheckCircle className="w-3 h-3" /> Active
                        </span>
                      ) : (
                        <span className="bg-red-100 text-red-800 text-[10px] font-bold px-2.5 py-1 rounded-full flex items-center gap-1 w-fit">
                          <Lock className="w-3 h-3" /> Inactive (Blocked)
                        </span>
                      )}
                    </td>

                    <td className="p-4 text-slate-400 text-[11px]">
                      {new Date(u.createdAt).toLocaleDateString()}
                    </td>

                    <td className="p-4 text-right">
                      <div className="flex items-center justify-end gap-2">
                        {/* Toggle Active / Inactive Button */}
                        <button
                          onClick={() => handleToggleStatus(u)}
                          disabled={updatingId === u._id || u._id === currentAdmin?._id}
                          className={`px-3 py-1.5 rounded-xl font-bold text-xs flex items-center gap-1.5 transition-all shadow-2xs ${
                            u.isActive
                              ? "bg-amber-50 hover:bg-amber-100 text-amber-700 border border-amber-200"
                              : "bg-emerald-600 hover:bg-emerald-700 text-white shadow-xs"
                          }`}
                          title={u.isActive ? "Deactivate User Access" : "Activate User Access"}
                        >
                          {updatingId === u._id ? (
                            <Loader2 className="w-3.5 h-3.5 animate-spin" />
                          ) : u.isActive ? (
                            <>
                              <UserX className="w-3.5 h-3.5 text-amber-600" />
                              <span>Deactivate</span>
                            </>
                          ) : (
                            <>
                              <UserCheck className="w-3.5 h-3.5" />
                              <span>Activate User</span>
                            </>
                          )}
                        </button>

                        {/* Delete User */}
                        {u._id !== currentAdmin?._id && (
                          <button
                            onClick={() => handleDeleteUser(u)}
                            disabled={updatingId === u._id}
                            className="p-1.5 text-slate-400 hover:text-red-600 hover:bg-red-50 rounded-lg transition-colors"
                            title="Delete User Account"
                          >
                            <Trash2 className="w-4 h-4" />
                          </button>
                        )}
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}
    </div>
  );
}
