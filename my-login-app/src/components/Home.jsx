import React, { useContext } from "react";
import { AuthContext } from "../Context/AuthContext";
import { Navigate } from "react-router-dom";
import LoginRegisterPopup from "../components/LoginRegisterPopup";

export default function Home() {
  const { user } = useContext(AuthContext);

  if (user) {
    // Redirect immediately if logged in
    return <Navigate to="/dashboard" replace />;
  }

  return (
    <>
      <section className="hero">
        <img
          src="https://static.vecteezy.com/system/resources/previews/037/041/580/non_2x/ai-generated-perfume-bottle-and-flowers-on-blue-background-free-photo.jpg"
          alt="perfume display"
          className="background-image"
        />
      </section>

      <div className="home-form-container">
        <div className="popup-wrapper">
          <LoginRegisterPopup initialIsLogin={true} />
        </div>
      </div>
    </>
  );
}
