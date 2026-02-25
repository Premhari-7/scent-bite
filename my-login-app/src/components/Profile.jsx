import { useContext } from "react";
import { AuthContext } from "../Context/AuthContext";
import { useNavigate } from "react-router-dom";
import "./Profile.css";

const Profile = () => {
  const { user, logout } = useContext(AuthContext);
  const navigate = useNavigate();

  if (!user) {
    navigate("/"); // Redirect if no user
    return null;
  }

  const handleLogout = () => {
    logout();
    navigate("/"); // Redirect to home after logout
  };

  return (
    <div className="profile-wrapper-main">
      <div className="profile-wrapper">
        <div className="profile-card">
          <h2 className="profile-name">{user.fullName}</h2>
          <p className="profile-role">{user.role || "N/A"}</p>

          <div className="profile-details">
            <div className="detail-item">
              <span className="label">Email:</span>
              <span className="value">{user.email}</span>
            </div>
          </div>

          <button className="logout-btn" onClick={handleLogout}>
            Log Out
          </button>
        </div>
      </div>
    </div>
  );
};

export default Profile;
