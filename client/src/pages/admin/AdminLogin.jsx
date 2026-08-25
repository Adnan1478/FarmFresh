import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import axios from "axios";

import {
  User,
  Lock,
  Eye,
  EyeOff,
  LogIn,
  XCircle,
  CheckCircle,
  AlertCircle,
  X,
} from "lucide-react";

import "../../styles/Auth.css";

export default function AdminLogin() {
  const navigate = useNavigate();

  // =========================================
  // FORM STATE
  // =========================================

  const [formData, setFormData] = useState({
    username: "",
    password: "",
  });

  const [rememberMe, setRememberMe] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const [errors, setErrors] = useState({});
  const [serverError, setServerError] = useState("");
  const [successMessage, setSuccessMessage] = useState("");
  const [loading, setLoading] = useState(false);

  // =========================================
  // HANDLE INPUT CHANGE
  // =========================================

  const handleChange = (e) => {
    const { name, value } = e.target;

    setFormData((prev) => ({
      ...prev,
      [name]: value,
    }));

    setErrors((prev) => ({
      ...prev,
      [name]: "",
    }));

    setServerError("");
  };

  // =========================================
  // FORM VALIDATION
  // =========================================

  const validateForm = () => {
    const newErrors = {};

    if (!formData.username.trim()) {
      newErrors.username = "Username is required";
    }

    if (!formData.password.trim()) {
      newErrors.password = "Password is required";
    }

    setErrors(newErrors);

    return Object.keys(newErrors).length === 0;
  };

  // =========================================
  // ADMIN LOGIN
  // =========================================

  const handleSubmit = async (e) => {
    e.preventDefault();

    setSuccessMessage("");
    setServerError("");

    if (!validateForm()) {
      return;
    }

    try {
      setLoading(true);

      const response = await axios.post(
        `${import.meta.env.VITE_API_URL}/api/auth/admin-login`,
        {
          username: formData.username,
          password: formData.password,
        },
      );

      // Get token and admin user
      const { token, user } = response.data;

      // =====================================
      // REMEMBER ME
      // =====================================

      if (rememberMe) {
        localStorage.setItem("token", token);
        localStorage.setItem("user", JSON.stringify(user));
      } else {
        sessionStorage.setItem("token", token);
        sessionStorage.setItem("user", JSON.stringify(user));
      }

      // =====================================
      // SUCCESS
      // =====================================

      setSuccessMessage("Admin login successful!");

      // Redirect to admin dashboard
      setTimeout(() => {
        navigate("/admin/dashboard");
      }, 1000);
    } catch (error) {
      setServerError(
        error.response?.data?.message ||
          "Invalid administrator username or password",
      );
    } finally {
      setLoading(false);
    }
  };

  // =========================================
  // JSX
  // =========================================

  return (
    <div className="login-page">
      <div className="login-container">
        <div className="login-content">
          {/* ======================================
              LEFT SIDE
          ======================================= */}

          <div className="login-image-section">
            {/* Decorative circles */}

            <div className="circle circle-top"></div>

            <div className="circle circle-bottom"></div>

            {/* Image Content */}

            <div className="image-content">
              <img
                src="/images/Vege.avif"
                alt="Fresh Vegetables"
                className="image-icon"
              />

              <h2>Admin Panel</h2>

              <p>
                Sign in to manage inventory, track orders, view complaints, and
                analyze sales metrics for Farm Fresh.
              </p>
            </div>
          </div>

          {/* ======================================
              RIGHT SIDE
          ======================================= */}

          <div className="login-form-section">
            {/* ======================================
                HEADER
            ======================================= */}

            <div className="form-header">
              <h1>Admin Login</h1>

              <p>Please enter your administrator credentials to continue</p>
            </div>

            {/* ======================================
                SUCCESS MESSAGE
            ======================================= */}

            {successMessage && (
              <div className="alert alert-success">
                <CheckCircle size={18} className="alert-icon" />

                <span>{successMessage}</span>

                <button
                  type="button"
                  onClick={() => setSuccessMessage("")}
                  className="alert-close"
                  aria-label="Close success message"
                >
                  <X size={18} />
                </button>
              </div>
            )}

            {/* ======================================
                SERVER ERROR
            ======================================= */}

            {serverError && (
              <div className="alert alert-danger">
                <AlertCircle size={18} className="alert-icon" />

                <div>
                  <strong>Login Failed!</strong>

                  <p>{serverError}</p>
                </div>

                <button
                  type="button"
                  onClick={() => setServerError("")}
                  className="alert-close"
                  aria-label="Close error message"
                >
                  <X size={18} />
                </button>
              </div>
            )}

            {/* ======================================
                ADMIN LOGIN FORM
            ======================================= */}

            <form onSubmit={handleSubmit} noValidate>
              {/* ====================================
                  USERNAME
              ===================================== */}

              <div className="form-group-custom">
                <label htmlFor="username">
                  <User size={14} className="label-icon" />
                  Username
                </label>

                <div className="input-group-custom">
                  <input
                    id="username"
                    name="username"
                    type="text"
                    value={formData.username}
                    onChange={handleChange}
                    placeholder="Enter administrator username"
                    autoComplete="username"
                  />

                  <User size={17} className="input-icon" />
                </div>

                {/* Username Error */}

                {errors.username && (
                  <div className="error-message">
                    <XCircle size={14} />

                    <span>{errors.username}</span>
                  </div>
                )}
              </div>

              {/* ====================================
                  PASSWORD
              ===================================== */}

              <div className="form-group-custom">
                <label htmlFor="password">
                  <Lock size={14} className="label-icon" />
                  Password
                </label>

                <div className="input-group-custom">
                  <input
                    id="password"
                    name="password"
                    type={showPassword ? "text" : "password"}
                    value={formData.password}
                    onChange={handleChange}
                    placeholder="Enter administrator password"
                    autoComplete="current-password"
                  />

                  <Lock size={17} className="input-icon" />

                  {/* Show / Hide Password */}

                  <button
                    type="button"
                    className="password-toggle-btn"
                    onClick={() => setShowPassword((prev) => !prev)}
                    aria-label={
                      showPassword ? "Hide password" : "Show password"
                    }
                  >
                    {showPassword ? <EyeOff size={17} /> : <Eye size={17} />}
                  </button>
                </div>

                {/* Password Error */}

                {errors.password && (
                  <div className="error-message">
                    <XCircle size={14} />

                    <span>{errors.password}</span>
                  </div>
                )}
              </div>

              {/* ====================================
                  REMEMBER ME / FORGOT PASSWORD
              ===================================== */}

              <div className="form-links">
                <label className="remember-label">
                  <input
                    type="checkbox"
                    checked={rememberMe}
                    onChange={(e) => setRememberMe(e.target.checked)}
                  />

                  <span>Remember me</span>
                </label>

                <Link to="/forgot-password">Forgot Password?</Link>
              </div>

              {/* ====================================
                  LOGIN BUTTON
              ===================================== */}

              <button type="submit" className="login-btn" disabled={loading}>
                <LogIn size={17} className="login-icon" />

                <span>{loading ? "Logging in..." : "Admin Login"}</span>
              </button>
            </form>

            {/* ======================================
                CUSTOMER LOGIN
            ======================================= */}

            <div className="register-link">
              Are you a customer? <Link to="/Auth">Customer Login</Link>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
