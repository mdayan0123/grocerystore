import React from "react";

function RoleSelect({ onSelect }) {
  return (
    <div className="center-card">
      <h2>Select your role</h2>

      <button className="blue-btn" onClick={() => onSelect("user")}>
        I am a User
      </button>

      <button className="orange-btn" onClick={() => onSelect("owner")}>
        I am a Shop Owner
      </button>
    </div>
  );
}

export default RoleSelect;
