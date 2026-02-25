import { useContext } from "react";
import { AuthContext } from "../Context/AuthContext";
import { useNavigate } from "react-router-dom";
import "./Header.css";

const Header = () => {
  const { user } = useContext(AuthContext);
  const navigate = useNavigate();

  if (user === undefined) return null;

  const goToProfile = () => {
    navigate("/profile");
  };

  return (
    <header className="header">
      <h2 className="logo">SCENT BITE</h2>
      <nav className="navigation">
        <a href="#"></a>
        <a href="#"></a>
        {user && (
          <span
            className="greeting"
            onClick={goToProfile}
            style={{ cursor: "pointer" }}
          >
            Hi, {user.fullName || user.email}!
          </span>
        )}
      </nav>
    </header>
  );
};

export default Header;
