import React, { useState } from "react";
import { UploadCloud, Image as ImageIcon, X, Loader2, Link as LinkIcon, CheckCircle } from "lucide-react";
import apiClient from "../api/axios";

export default function ImageUploader({ label = "Select Image", value, onChange }) {
  const [uploadMode, setUploadMode] = useState("file"); // "file" | "url"
  const [uploading, setUploading] = useState(false);
  const [tempPreview, setTempPreview] = useState("");
  const [urlInput, setUrlInput] = useState("");
  const [errorMsg, setErrorMsg] = useState("");

  const handleFileChange = async (e) => {
    const file = e.target.files?.[0];
    if (!file) return;

    if (!file.type.startsWith("image/")) {
      setErrorMsg("Please select a valid image file (.jpg, .png, .webp, .svg)");
      return;
    }

    if (file.size > 10 * 1024 * 1024) {
      setErrorMsg("Image size exceeds 10MB limit");
      return;
    }

    setErrorMsg("");
    setUploading(true);

    // Instant local blob preview ONLY for UI loading state (never passed to onChange/database)
    const blobPreview = URL.createObjectURL(file);
    setTempPreview(blobPreview);

    // Upload file directly to Cloudinary via backend POST /api/upload
    try {
      const formData = new FormData();
      formData.append("image", file);

      const res = await apiClient.post("/upload", formData, {
        headers: {
          "Content-Type": "multipart/form-data"
        }
      });

      if (res.data?.success && res.data?.url) {
        // Set secure Cloudinary CDN URL (https://res.cloudinary.com/...)
        onChange(res.data.url);
      } else {
        setErrorMsg("Failed to receive Cloudinary URL from server");
        onChange("");
      }
    } catch (err) {
      const msg = err.response?.data?.message || "Error uploading image to Cloudinary";
      setErrorMsg(msg);
      onChange("");
    } finally {
      setUploading(false);
      setTempPreview("");
    }
  };

  const handleApplyUrl = (e) => {
    e.preventDefault();
    if (urlInput.trim()) {
      onChange(urlInput.trim());
      setUrlInput("");
    }
  };

  const handleRemove = () => {
    onChange("");
    setTempPreview("");
    setErrorMsg("");
  };

  const displayImage = value || tempPreview;

  return (
    <div className="space-y-2 text-xs">
      <label className="block text-slate-700 font-bold uppercase tracking-wider">
        {label}
      </label>

      {displayImage ? (
        /* Image Preview Box */
        <div className="relative group border border-slate-200 rounded-2xl overflow-hidden bg-slate-50 p-2 flex items-center justify-between gap-3">
          <div className="flex items-center gap-3 overflow-hidden">
            <img
              src={displayImage}
              alt="Preview"
              className="w-14 h-14 object-cover rounded-xl border border-slate-200 shrink-0 bg-white"
            />
            <div className="truncate space-y-1">
              <div className="font-bold text-slate-800 flex items-center gap-1">
                {uploading ? (
                  <>
                    <Loader2 className="w-3.5 h-3.5 text-green-600 animate-spin" />
                    <span className="text-amber-600">Uploading to Cloudinary...</span>
                  </>
                ) : (
                  <>
                    <CheckCircle className="w-3.5 h-3.5 text-green-600" />
                    <span>Cloudinary Image Ready</span>
                  </>
                )}
              </div>
              <div className="text-[10px] text-slate-400 font-mono truncate">{value || "Uploading..."}</div>
            </div>
          </div>

          {!uploading && (
            <button
              type="button"
              onClick={handleRemove}
              className="p-2 text-slate-400 hover:text-red-500 hover:bg-white rounded-xl transition-all shrink-0"
              title="Remove Image"
            >
              <X className="w-4 h-4" />
            </button>
          )}
        </div>
      ) : (
        /* Upload Mode Switcher & Input Box */
        <div className="border border-slate-200 rounded-2xl p-4 bg-slate-50 space-y-3">
          <div className="flex items-center justify-between border-b border-slate-200 pb-2">
            <div className="flex items-center gap-4 text-[11px] font-bold">
              <button
                type="button"
                onClick={() => setUploadMode("file")}
                className={`flex items-center gap-1.5 transition-colors ${
                  uploadMode === "file" ? "text-green-600 border-b-2 border-green-600 pb-1" : "text-slate-400 hover:text-slate-700"
                }`}
              >
                <UploadCloud className="w-4 h-4" />
                <span>Upload to Cloudinary</span>
              </button>

              <button
                type="button"
                onClick={() => setUploadMode("url")}
                className={`flex items-center gap-1.5 transition-colors ${
                  uploadMode === "url" ? "text-green-600 border-b-2 border-green-600 pb-1" : "text-slate-400 hover:text-slate-700"
                }`}
              >
                <LinkIcon className="w-3.5 h-3.5" />
                <span>Enter Cloudinary Image URL</span>
              </button>
            </div>
          </div>

          {errorMsg && (
            <div className="text-[11px] text-red-600 font-semibold bg-red-50 p-2 rounded-xl border border-red-100">
              ⚠️ {errorMsg}
            </div>
          )}

          {uploadMode === "file" ? (
            <label className="border-2 border-dashed border-slate-300 hover:border-green-600 bg-white rounded-xl p-6 flex flex-col items-center justify-center cursor-pointer transition-colors group text-center">
              {uploading ? (
                <div className="flex flex-col items-center gap-2">
                  <Loader2 className="w-6 h-6 text-green-600 animate-spin" />
                  <span className="text-slate-600 font-semibold">Uploading to Cloudinary CDN...</span>
                </div>
              ) : (
                <>
                  <div className="w-10 h-10 bg-green-50 text-green-600 rounded-full flex items-center justify-center group-hover:scale-110 transition-transform mb-2">
                    <ImageIcon className="w-5 h-5" />
                  </div>
                  <span className="font-bold text-slate-800">
                    Click to browse and upload image
                  </span>
                  <span className="text-[10px] text-slate-400 mt-0.5">
                    Will be stored on Cloudinary (https://res.cloudinary.com/...)
                  </span>
                  <input
                    type="file"
                    accept="image/*"
                    onChange={handleFileChange}
                    className="hidden"
                  />
                </>
              )}
            </label>
          ) : (
            <form onSubmit={handleApplyUrl} className="flex gap-2">
              <input
                type="text"
                placeholder="https://res.cloudinary.com/..."
                value={urlInput}
                onChange={(e) => setUrlInput(e.target.value)}
                className="w-full bg-white border border-slate-200 rounded-xl px-3 py-2 text-xs outline-none focus:border-green-600 font-medium"
              />
              <button
                type="submit"
                className="bg-green-600 text-white font-bold px-4 py-2 rounded-xl text-xs shrink-0"
              >
                Apply URL
              </button>
            </form>
          )}
        </div>
      )}
    </div>
  );
}
