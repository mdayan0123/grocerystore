import React, { useState } from "react";

function Login({ onSuccess }) {
  const [phone, setPhone] = useState("");
  const [otp, setOtp] = useState("");
  const [otpSent, setOtpSent] = useState(false);

  const API_BASE = "http://3.236.177.251:30484";

  async function sendOtp() {
    try {
      const res = await fetch(`${API_BASE}/api/send-otp`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ phone }),
      });

      const data = await res.json();

      if (data.success) {
        alert("OTP sent successfully! (Test OTP = 1234)");
        setOtpSent(true);
      } else {
        alert("Failed to send OTP");
      }
    } catch (err) {
      alert("Error sending OTP. Backend might be down.");
      console.log(err);
    }
  }

  async function verifyOtp(role) {
    try {
      const res = await fetch(`${API_BASE}/api/verify-otp`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ phone, otp, role, name: "User" }),
      });

      const data = await res.json();

      if (data.success) {
        alert("Login successful 🚀");
        onSuccess(data.user);
      } else {
        alert("Invalid OTP ❌");
      }
    } catch (err) {
      alert("Error verifying OTP");
      console.log(err);
    }
  }

  return (
    <div className="login-card">
      <h2 className="gradient-text">Grocery App</h2>

      {!otpSent && (
        <>
          <label>Phone Number</label>
          <input type="text" value={phone} onChange={(e) => setPhone(e.target.value)} />
          <button className="grad-btn" onClick={sendOtp}>Send OTP</button>
        </>
      )}

      {otpSent && (
        <>
          <label>Enter OTP</label>
          <input type="text" value={otp} onChange={(e) => setOtp(e.target.value)} />

          <div className="row">
            <button className="role-btn" onClick={() => verifyOtp("user")}>Login as User</button>
            <button className="role-btn owner" onClick={() => verifyOtp("owner")}>Login as Owner</button>
          </div>
        </>
      )}
    </div>
  );
}

export default Login;
