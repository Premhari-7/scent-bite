// src/components/MessagePopup.jsx
import React from "react";
import "./MessagePopup.css";
import { X } from "lucide-react"; // Lucide close icon

const MessagePopup = ({ message, onClose }) => {
  if (!message) return null;

  return (
    <div className="message-popup-overlay">
      <div className="message-popup">
        <X className="close-icon" onClick={onClose} />
        <p>{message}</p>
      </div>
    </div>
  );
};

export default MessagePopup;
