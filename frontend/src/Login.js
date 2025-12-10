import React, { useState } from "react";

function Login({ onSuccess }) {
  const [phone, setPhone] = useState("");
  const [otp, setOtp] = useState("");
  const [otpSent, setOtpSent] = useState(false);

  const API_BASE = "http://13.219.250.20:30484"; // 🔥 LIVE BACKEND URL

  async function sendOtp() {
    try {
      const res = await fetch(`${API_BASE}/api/send-otp`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ phone }),
      });

      const data = await res.json();

      if (data.success) {
        alert("OTP sent successfully! (use OTP: 1234)");
        setOtpSent(true);
      } else {
        alert("Failed to send OTP");
      }
    } catch (err) {
      alert("Error sending OTP. Backend might be down.");
    }
  }

  async function verifyOtp(role) {
    try {
      const res = await fetch(`${API_BASE}/api/verify-otp`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ phone, otp, name: "User", role }),
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
    }
  }

  return (
    <div className="login-card">
      <h2>Grocery App Login</h2>

      {!otpSent && (
        <>
          <input placeholder="Phone" value={phone} onChange={(e) => setPhone(e.target.value)} />
          <button onClick={sendOtp}>Send OTP</button>
        </>
      )}

      {otpSent && (
        <>
          <input placeholder="Enter OTP" value={otp} onChange={(e) => setOtp(e.target.value)} />
          <button onClick={() => verifyOtp("user")}>Login as User</button>
          <button onClick={() => verifyOtp("owner")}>Login as Owner</button>
        </>
      )}
    </div>
  );
}

export default Login;
