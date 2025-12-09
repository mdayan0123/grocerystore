const express = require("express");
const cors = require("cors");
const app = express();

// Dynamic port support for EC2, Docker, Kubernetes
const PORT = process.env.PORT || 5000;

app.use(cors());
app.use(express.json());
// Allow Frontend Access
app.use((req, res, next) => {
    res.header("Access-Control-Allow-Origin", "*");
    res.header("Access-Control-Allow-Methods", "GET, POST, PATCH, PUT, DELETE");
    res.header("Access-Control-Allow-Headers", "Content-Type");
    next();
});


//=====================================================
// Database (In-Memory Data Storage)
//=====================================================
let orders = [];
let users = [];
let shops = [
  {
    id: 1,
    name: "Fresh Mart",
    priority: 1,
    inventory: [
      { id: 1, name: "Milk", price: 60, stock: 50, image: "https://images.unsplash.com/photo-1550583724-b2692b85b150?w=400" },
      { id: 2, name: "Bread", price: 40, stock: 30, image: "https://images.unsplash.com/photo-1509440159596-0249088772ff?w=400" },
      { id: 3, name: "Eggs (12)", price: 80, stock: 40, image: "https://images.unsplash.com/photo-1582722872445-44dc5f7e3c8f?w=400" },
      { id: 4, name: "Rice (1kg)", price: 70, stock: 100, image: "https://images.unsplash.com/photo-1586201375761-83865001e31c?w=400" },
      { id: 5, name: "Sugar (1kg)", price: 50, stock: 80, image: "https://images.unsplash.com/photo-1519892300165-cb5542fb47c7?w=400" },
      { id: 6, name: "Tomatoes (1kg)", price: 30, stock: 60, image: "https://images.unsplash.com/photo-1592924357228-91a4daadcfea?w=400" },
      { id: 7, name: "Potatoes (1kg)", price: 25, stock: 70, image: "https://images.unsplash.com/photo-1518977676601-b53f82aba655?w=400" },
      { id: 8, name: "Onions (1kg)", price: 35, stock: 55, image: "https://images.unsplash.com/photo-1580201092675-a0a6a6cafbb0?w=400" }
    ]
  },
  {
    id: 2,
    name: "Quick Grocery",
    priority: 2,
    inventory: [
      { id: 1, name: "Milk", price: 60, stock: 40, image: "https://images.unsplash.com/photo-1550583724-b2692b85b150?w=400" },
      { id: 2, name: "Bread", price: 40, stock: 25, image: "https://images.unsplash.com/photo-1509440159596-0249088772ff?w=400" },
      { id: 3, name: "Eggs (12)", price: 80, stock: 35, image: "https://images.unsplash.com/photo-1582722872445-44dc5f7e3c8f?w=400" },
      { id: 4, name: "Rice (1kg)", price: 70, stock: 90, image: "https://images.unsplash.com/photo-1586201375761-83865001e31c?w=400" },
      { id: 5, name: "Sugar (1kg)", price: 50, stock: 70, image: "https://images.unsplash.com/photo-1519892300165-cb5542fb47c7?w=400" },
      { id: 6, name: "Tomatoes (1kg)", price: 30, stock: 50, image: "https://images.unsplash.com/photo-1592924357228-91a4daadcfea?w=400" },
      { id: 7, name: "Potatoes (1kg)", price: 25, stock: 65, image: "https://images.unsplash.com/photo-1518977676601-b53f82aba655?w=400" },
      { id: 8, name: "Onions (1kg)", price: 35, stock: 45, image: "https://images.unsplash.com/photo-1580201092675-a0a6a6cafbb0?w=400" }
    ]
  }
];

//=====================================================
// API Endpoints
//=====================================================

// Send OTP
app.post("/api/send-otp", (req, res) => {
  console.log("📩 OTP sent to:", req.body.phone);
  res.json({ success: true, message: "OTP sent" });
});

// Verify Login
app.post("/api/verify-otp", (req, res) => {
  const { phone, otp, name, role } = req.body;

  if (otp !== "1234") return res.status(400).json({ success: false, message: "Invalid OTP" });

  let user = users.find(u => u.phone === phone);
  if (!user) {
    const count = users.filter(u => u.role === "owner").length;
    user = { id: Date.now(), phone, name, role, shopId: role === "owner" ? (count % 2) + 1 : null };
    users.push(user);
  }

  res.json({ success: true, user });
});

// Create Order
app.post("/api/orders", (req, res) => {
  const order = {
    ...req.body,
    id: Date.now(),
    status: "pending",
    createdAt: Date.now(),
    declinedBy: []
  };
  orders.push(order);
  res.json({ success: true, order });
});

// Get User Orders
app.get("/api/orders/user/:id", (req, res) => {
  res.json({ orders: orders.filter(o => o.userId == req.params.id) });
});

// Shops
app.get("/api/shops", (req, res) => {
  res.json({ shops: shops.map(s => ({ id: s.id, name: s.name })) });
});

// Items for customers
app.get("/api/items", (req, res) => {
  res.json({ items: shops[0].inventory });
});

//=====================================================
// Start Server (important line for EC2 + Kubernetes)
//=====================================================
app.listen(PORT, "0.0.0.0", () => {
  console.log(`🚀 Server Started → http://0.0.0.0:${PORT}`);
  console.log(`🏪 Shops Loaded: ${shops.length}`);
});

