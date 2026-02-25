import React, { useState, useEffect, useContext } from "react";
import { AuthContext } from "../Context/AuthContext";
import { useNavigate } from "react-router-dom";
import { Eye, EyeOff, Mail, Lock } from "lucide-react";
import MessagePopup from "./MessagePopup";
import "./LoginRegisterPopup.css";

const LoginRegisterPopup = ({ isVisible, onClose, initialIsLogin = true }) => {
  const { login } = useContext(AuthContext); // ✅ use context
  const navigate = useNavigate();

  const [isLogin, setIsLogin] = useState(initialIsLogin);
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [fullName, setFullName] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [errors, setErrors] = useState({});
  const [popupMessage, setPopupMessage] = useState("");

  // Reset form when popup visibility changes
  useEffect(() => {
    if (isVisible) resetForm();
    setIsLogin(initialIsLogin);
  }, [isVisible, initialIsLogin]);

  const resetForm = () => {
    setEmail("");
    setPassword("");
    setFullName("");
    setConfirmPassword("");
    setErrors({});
    setShowPassword(false);
    setShowConfirmPassword(false);
  };

  const toggleForm = () => {
    setIsLogin(!isLogin);
    resetForm();
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    // ✅ Simple validation (you can keep your current one)
    if (!email || !password || (!isLogin && !fullName)) return;

    const endpoint = isLogin ? "login" : "register";
    const payload = isLogin
      ? { email, password }
      : { fullName, email, password };

    try {
      const response = await fetch(`http://localhost:5000/api/${endpoint}`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      });

      const data = await response.json();

      if (!response.ok) {
        setPopupMessage(data.message || "Something went wrong.");
        return;
      }

      // ✅ Save logged-in user in context
      if (isLogin) {
        localStorage.setItem("user", JSON.stringify(data.user)); // 🔹 add this
        login(data.user);
        navigate("/dashboard", { replace: true });
      } else {
        setPopupMessage("Registration successful!");
        setTimeout(() => {
          resetForm();
          onClose();
        }, 1500);
      }
    } catch (err) {
      console.error(err);
      setPopupMessage("Server error. Please try again later.");
    }
  };

  return (
    <div className="login-register-container">
      <form className="popup-form" onSubmit={handleSubmit}>
        <h2>{isLogin ? "Login" : "Register"}</h2>

        {!isLogin && (
          <div className="input-box">
            <Mail size={18} />
            <input
              type="text"
              placeholder="Full Name"
              value={fullName}
              onChange={(e) => setFullName(e.target.value)}
            />
          </div>
        )}

        <div className="input-box">
          <Mail size={18} />
          <input
            type="email"
            placeholder="Email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
          />
        </div>

        <div className="input-box">
          <Lock size={18} />
          <input
            type={showPassword ? "text" : "password"}
            placeholder="Password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
          />
          <span
            className="toggle-icon"
            onClick={() => setShowPassword(!showPassword)}
          >
            {showPassword ? <Eye size={18} /> : <EyeOff size={18} />}
          </span>
        </div>

        {!isLogin && (
          <div className="input-box">
            <Lock size={18} />
            <input
              type={showConfirmPassword ? "text" : "password"}
              placeholder="Confirm Password"
              value={confirmPassword}
              onChange={(e) => setConfirmPassword(e.target.value)}
            />
            <span
              className="toggle-icon"
              onClick={() => setShowConfirmPassword(!showConfirmPassword)}
            >
              {showConfirmPassword ? <Eye size={18} /> : <EyeOff size={18} />}
            </span>
          </div>
        )}

        <button className="submit-btn">{isLogin ? "Login" : "Register"}</button>

        <p className="toggle-text" onClick={toggleForm}>
          {isLogin ? "Don't have an account? " : "Already have an account? "}
          <span>{isLogin ? "Register" : "Login"}</span>
        </p>
      </form>
      <MessagePopup
        message={popupMessage}
        onClose={() => setPopupMessage("")}
      />
    </div>
  );
};

export default LoginRegisterPopup;
