import React, { useState, useEffect } from "react";
import {
  MessageSquare,
  Search,
  Mail,
  Phone,
  Calendar,
  CheckCircle2,
  Clock,
  Trash2,
  Eye,
  Loader2,
  Send,
  Filter,
  User,
  Check
} from "lucide-react";
import {
  getAllContactMessagesApi,
  updateContactStatusApi,
  deleteContactMessageApi
} from "../../api/contactApi";
import { useShop } from "../../context/ShopContext";

export default function AdminContacts() {
  const { showToast } = useShop();

  const [messages, setMessages] = useState([]);
  const [loading, setLoading] = useState(true);
  const [statusFilter, setStatusFilter] = useState("all");
  const [searchQuery, setSearchQuery] = useState("");
  const [updatingId, setUpdatingId] = useState(null);

  // Selected Message Modal View
  const [selectedMsg, setSelectedMsg] = useState(null);
  const [replyText, setReplyText] = useState("");

  const fetchMessages = async () => {
    try {
      setLoading(true);
      const res = await getAllContactMessagesApi({
        status: statusFilter
      });

      if (res.data?.success) {
        let list = res.data.data;
        if (searchQuery.trim()) {
          const q = searchQuery.toLowerCase();
          list = list.filter(
            (m) =>
              m.name.toLowerCase().includes(q) ||
              m.email.toLowerCase().includes(q) ||
              m.subject.toLowerCase().includes(q) ||
              (m.phone && m.phone.toLowerCase().includes(q))
          );
        }
        setMessages(list);
      }
    } catch (err) {
      showToast("Error loading contact messages from database", "error");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchMessages();
  }, [statusFilter]);

  // Update Message Status in MongoDB
  const handleUpdateStatus = async (msgId, newStatus) => {
    setUpdatingId(msgId);
    try {
      const res = await updateContactStatusApi(msgId, newStatus);
      if (res.data?.success) {
        showToast(`✓ Message status updated to ${newStatus.toUpperCase()}`, "success");
        if (selectedMsg && selectedMsg._id === msgId) {
          setSelectedMsg({ ...selectedMsg, status: newStatus });
        }
        fetchMessages();
      }
    } catch (err) {
      showToast("Failed to update status", "error");
    } finally {
      setUpdatingId(null);
    }
  };

  // Delete Message from MongoDB
  const handleDeleteMessage = async (msgId) => {
    if (window.confirm("Are you sure you want to delete this contact message?")) {
      setUpdatingId(msgId);
      try {
        const res = await deleteContactMessageApi(msgId);
        if (res.data?.success) {
          showToast("Contact message deleted", "info");
          if (selectedMsg && selectedMsg._id === msgId) {
            setSelectedMsg(null);
          }
          fetchMessages();
        }
      } catch (err) {
        showToast("Failed to delete message", "error");
      } finally {
        setUpdatingId(null);
      }
    }
  };

  // Send Reply Email Helper Simulation
  const handleSendReply = (e) => {
    e.preventDefault();
    if (!replyText.trim()) return;

    handleUpdateStatus(selectedMsg._id, "replied");
    showToast(`✓ Reply sent to ${selectedMsg.email}`, "success");
    setReplyText("");
  };

  const getStatusBadge = (status) => {
    switch (status) {
      case "unread":
        return <span className="bg-amber-100 text-amber-800 text-[10px] font-bold px-2.5 py-0.5 rounded-full">● Unread</span>;
      case "read":
        return <span className="bg-blue-100 text-blue-800 text-[10px] font-bold px-2.5 py-0.5 rounded-full">✓ Read</span>;
      case "replied":
        return <span className="bg-emerald-100 text-emerald-800 text-[10px] font-bold px-2.5 py-0.5 rounded-full">✓ Replied</span>;
      default:
        return null;
    }
  };

  return (
    <div className="space-y-6 pb-12 text-xs">
      {/* Top Banner Header */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 bg-white p-6 rounded-3xl border border-slate-100 shadow-xs">
        <div>
          <h1 className="text-xl font-black text-slate-900 flex items-center gap-2">
            <MessageSquare className="w-6 h-6 text-green-600" />
            <span>Customer Contact Messages & Inquiries</span>
          </h1>
          <p className="text-slate-500 mt-1">
            Manage inquiries submitted by customers through the website Contact Us page.
          </p>
        </div>

        <div className="bg-slate-50 border border-slate-200 px-4 py-2 rounded-2xl font-bold text-slate-700">
          Total Messages: <span className="text-green-600 font-black text-sm">{messages.length}</span>
        </div>
      </div>

      {/* Filter & Search Bar */}
      <div className="bg-white p-4 rounded-2xl border border-slate-100 shadow-xs flex flex-col md:flex-row items-center justify-between gap-4">
        {/* Status Filter Pills */}
        <div className="flex items-center gap-2 overflow-x-auto w-full md:w-auto font-bold">
          {["all", "unread", "read", "replied"].map((st) => (
            <button
              key={st}
              onClick={() => setStatusFilter(st)}
              className={`px-3.5 py-1.5 rounded-xl capitalize transition-all ${
                statusFilter === st
                  ? "bg-slate-900 text-white shadow-xs"
                  : "bg-slate-50 text-slate-600 hover:bg-slate-100"
              }`}
            >
              {st}
            </button>
          ))}
        </div>

        {/* Search Input */}
        <div className="relative w-full md:w-72">
          <input
            type="text"
            placeholder="Search sender, email, subject..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            onKeyDown={(e) => e.key === "Enter" && fetchMessages()}
            className="w-full bg-slate-50 border border-slate-200 rounded-xl pl-9 pr-4 py-2 outline-none focus:border-green-600 font-medium"
          />
          <Search className="w-4 h-4 text-slate-400 absolute left-3 top-2.5" />
        </div>
      </div>

      {/* Main Table */}
      {loading ? (
        <div className="min-h-[40vh] flex flex-col items-center justify-center p-8 gap-3">
          <Loader2 className="w-8 h-8 text-green-600 animate-spin" />
          <p className="text-slate-500 font-semibold">Loading contact messages from database...</p>
        </div>
      ) : messages.length === 0 ? (
        <div className="bg-white rounded-3xl p-12 text-center border border-slate-100 space-y-3">
          <MessageSquare className="w-12 h-12 text-slate-300 mx-auto" />
          <h3 className="text-base font-bold text-slate-800">No Messages Found</h3>
          <p className="text-slate-500 max-w-sm mx-auto">
            No contact messages match your selected filter or search criteria.
          </p>
        </div>
      ) : (
        <div className="bg-white rounded-3xl border border-slate-100 shadow-xs overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs">
              <thead className="bg-slate-50 border-b border-slate-100 text-slate-500 font-bold uppercase tracking-wider">
                <tr>
                  <th className="p-4">Sender Details</th>
                  <th className="p-4">Subject</th>
                  <th className="p-4">Status</th>
                  <th className="p-4">Submitted Date</th>
                  <th className="p-4 text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100 font-medium text-slate-800">
                {messages.map((m) => (
                  <tr
                    key={m._id}
                    className={`hover:bg-slate-50/80 transition-colors ${
                      m.status === "unread" ? "bg-amber-50/30 font-bold" : ""
                    }`}
                  >
                    <td className="p-4">
                      <div className="font-bold text-slate-900 text-sm flex items-center gap-2">
                        <span>{m.name}</span>
                      </div>
                      <div className="text-slate-500 flex items-center gap-3 mt-0.5 text-[11px]">
                        <span className="flex items-center gap-1">
                          <Mail className="w-3 h-3 text-slate-400" />
                          {m.email}
                        </span>
                        {m.phone && (
                          <span className="flex items-center gap-1">
                            <Phone className="w-3 h-3 text-slate-400" />
                            {m.phone}
                          </span>
                        )}
                      </div>
                    </td>

                    <td className="p-4 max-w-xs">
                      <div className="font-bold text-slate-900 truncate">{m.subject}</div>
                      <div className="text-slate-500 text-[11px] truncate">{m.message}</div>
                    </td>

                    <td className="p-4">{getStatusBadge(m.status)}</td>

                    <td className="p-4 text-slate-400 text-[11px]">
                      {new Date(m.createdAt).toLocaleString()}
                    </td>

                    <td className="p-4 text-right">
                      <div className="flex items-center justify-end gap-2">
                        {/* View Detailed Modal Button */}
                        <button
                          onClick={() => {
                            setSelectedMsg(m);
                            if (m.status === "unread") {
                              handleUpdateStatus(m._id, "read");
                            }
                          }}
                          className="px-3 py-1.5 bg-slate-100 hover:bg-slate-200 text-slate-700 font-bold rounded-xl flex items-center gap-1 transition-colors"
                        >
                          <Eye className="w-3.5 h-3.5" />
                          <span>View Message</span>
                        </button>

                        {/* Delete Button */}
                        <button
                          onClick={() => handleDeleteMessage(m._id)}
                          disabled={updatingId === m._id}
                          className="p-1.5 text-slate-400 hover:text-red-600 hover:bg-red-50 rounded-lg transition-colors"
                          title="Delete message"
                        >
                          <Trash2 className="w-4 h-4" />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* Message View Modal */}
      {selectedMsg && (
        <div className="fixed inset-0 z-50 overflow-y-auto flex items-center justify-center p-4">
          <div onClick={() => setSelectedMsg(null)} className="fixed inset-0 bg-slate-900/50 backdrop-blur-xs" />

          <div className="relative bg-white rounded-3xl max-w-lg w-full p-6 shadow-2xl space-y-4 z-10 border border-slate-100 animate-slideUp text-xs">
            <div className="flex items-center justify-between border-b border-slate-100 pb-3">
              <div>
                <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">Contact Message Details</span>
                <h3 className="font-black text-slate-900 text-base mt-0.5">{selectedMsg.subject}</h3>
              </div>
              <div>{getStatusBadge(selectedMsg.status)}</div>
            </div>

            <div className="bg-slate-50 p-4 rounded-2xl border border-slate-200 space-y-2 text-slate-700">
              <div className="flex justify-between">
                <span className="font-bold text-slate-900">{selectedMsg.name}</span>
                <span className="text-slate-400 text-[11px]">{new Date(selectedMsg.createdAt).toLocaleString()}</span>
              </div>
              <div className="text-slate-600 font-semibold flex items-center gap-3">
                <span className="flex items-center gap-1">
                  <Mail className="w-3.5 h-3.5 text-slate-400" />
                  {selectedMsg.email}
                </span>
                {selectedMsg.phone && (
                  <span className="flex items-center gap-1">
                    <Phone className="w-3.5 h-3.5 text-slate-400" />
                    {selectedMsg.phone}
                  </span>
                )}
              </div>
            </div>

            <div className="space-y-1">
              <label className="font-bold text-slate-700">Message Content:</label>
              <div className="p-4 bg-slate-100/70 rounded-2xl text-slate-800 text-xs leading-relaxed font-medium">
                {selectedMsg.message}
              </div>
            </div>

            {/* Quick Status Selector */}
            <div className="pt-2 flex items-center justify-between border-t border-slate-100">
              <span className="font-bold text-slate-700">Update Status:</span>
              <div className="flex gap-2">
                <button
                  onClick={() => handleUpdateStatus(selectedMsg._id, "read")}
                  className={`px-3 py-1.5 rounded-xl font-bold ${
                    selectedMsg.status === "read" ? "bg-blue-600 text-white" : "bg-slate-100 text-slate-700 hover:bg-slate-200"
                  }`}
                >
                  Mark Read
                </button>
                <button
                  onClick={() => handleUpdateStatus(selectedMsg._id, "replied")}
                  className={`px-3 py-1.5 rounded-xl font-bold ${
                    selectedMsg.status === "replied" ? "bg-emerald-600 text-white" : "bg-slate-100 text-slate-700 hover:bg-slate-200"
                  }`}
                >
                  Mark Replied
                </button>
              </div>
            </div>

            {/* Reply Input Form */}
            <form onSubmit={handleSendReply} className="pt-3 border-t border-slate-100 space-y-2">
              <label className="font-bold text-slate-700 block">Send Response to Customer:</label>
              <textarea
                rows={3}
                placeholder={`Type reply email to ${selectedMsg.email}...`}
                value={replyText}
                onChange={(e) => setReplyText(e.target.value)}
                className="w-full bg-slate-50 border border-slate-200 rounded-xl p-3 outline-none focus:border-green-600 font-medium"
              />

              <div className="flex gap-2 justify-end">
                <button
                  type="button"
                  onClick={() => setSelectedMsg(null)}
                  className="px-4 py-2 bg-slate-100 text-slate-600 font-bold rounded-xl"
                >
                  Close
                </button>
                <button
                  type="submit"
                  disabled={!replyText.trim()}
                  className="px-5 py-2 bg-green-600 hover:bg-green-700 disabled:opacity-50 text-white font-bold rounded-xl shadow-md flex items-center gap-1.5"
                >
                  <Send className="w-3.5 h-3.5" />
                  <span>Send Reply</span>
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
