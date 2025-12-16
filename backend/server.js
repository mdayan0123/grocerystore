const express = require('express');
const cors = require('cors');
const app = express();
const port = 5000;

app.use(cors({
  origin: "*",
  methods: ["GET", "POST", "PUT", "PATCH", "DELETE"],
  allowedHeaders: ["Content-Type", "Authorization"]
}));
app.use(express.json());

// In-memory storage
let orders = [];
let users = [];
let shops = [
  {
    id: 1,
    name: 'Fresh Mart',
    priority: 1,
    inventory: [
      { id: 1, name: 'Milk', price: 60, stock: 50, image: 'https://images.unsplash.com/photo-1550583724-b2692b85b150?w=400' },
      { id: 2, name: 'Bread', price: 40, stock: 30, image: 'https://images.unsplash.com/photo-1509440159596-0249088772ff?w=400' },
      { id: 3, name: 'Eggs (12)', price: 80, stock: 40, image: 'https://images.unsplash.com/photo-1582722872445-44dc5f7e3c8f?w=400' },
      { id: 4, name: 'Rice (1kg)', price: 70, stock: 100, image: 'https://images.unsplash.com/photo-1586201375761-83865001e31c?w=400' },
      { id: 5, name: 'Sugar (1kg)', price: 50, stock: 80, image: 'https://images.unsplash.com/photo-1519892300165-cb5542fb47c7?w=400' },
      { id: 6, name: 'Tomatoes (1kg)', price: 30, stock: 60, image: 'https://images.unsplash.com/photo-1592924357228-91a4daadcfea?w=400' },
      { id: 7, name: 'Potatoes (1kg)', price: 25, stock: 70, image: 'https://images.unsplash.com/photo-1518977676601-b53f82aba655?w=400' },
      { id: 8, name: 'Onions (1kg)', price: 35, stock: 55, image: 'https://images.unsplash.com/photo-1580201092675-a0a6a6cafbb0?w=400' },
    ]
  },
  {
    id: 2,
    name: 'Quick Grocery',
    priority: 2,
    inventory: [
      { id: 1, name: 'Milk', price: 60, stock: 40, image: 'https://images.unsplash.com/photo-1550583724-b2692b85b150?w=400' },
      { id: 2, name: 'Bread', price: 40, stock: 25, image: 'https://images.unsplash.com/photo-1509440159596-0249088772ff?w=400' },
      { id: 3, name: 'Eggs (12)', price: 80, stock: 35, image: 'https://images.unsplash.com/photo-1582722872445-44dc5f7e3c8f?w=400' },
      { id: 4, name: 'Rice (1kg)', price: 70, stock: 90, image: 'https://images.unsplash.com/photo-1586201375761-83865001e31c?w=400' },
      { id: 5, name: 'Sugar (1kg)', price: 50, stock: 70, image: 'https://images.unsplash.com/photo-1519892300165-cb5542fb47c7?w=400' },
      { id: 6, name: 'Tomatoes (1kg)', price: 30, stock: 50, image: 'https://images.unsplash.com/photo-1592924357228-91a4daadcfea?w=400' },
      { id: 7, name: 'Potatoes (1kg)', price: 25, stock: 65, image: 'https://images.unsplash.com/photo-1518977676601-b53f82aba655?w=400' },
      { id: 8, name: 'Onions (1kg)', price: 35, stock: 45, image: 'https://images.unsplash.com/photo-1580201092675-a0a6a6cafbb0?w=400' },
    ]
  }
];

// Send OTP endpoint
app.post('/api/send-otp', (req, res) => {
  const { phone } = req.body;
  console.log(`📱 Sending OTP to ${phone}`);
  res.json({ success: true, message: 'OTP sent successfully' });
});

// Verify OTP and login
app.post('/api/verify-otp', (req, res) => {
  const { phone, otp, name, role } = req.body;
  
  if (otp === '1234') {
    let user = users.find(u => u.phone === phone);
    
    if (!user) {
      const ownerCount = users.filter(u => u.role === 'owner').length;
      user = { 
        id: Date.now(), 
        phone, 
        name, 
        role,
        shopId: role === 'owner' ? (ownerCount % 2) + 1 : null
      };
      users.push(user);
    }
    
    res.json({ success: true, user });
  } else {
    res.status(400).json({ success: false, message: 'Invalid OTP' });
  }
});

// Place order
app.post('/api/orders', (req, res) => {
  const order = {
    ...req.body,
    id: Date.now(),
    status: 'pending',
    timestamp: new Date().toISOString(),
    assignedShop: null,
    assignedShopId: null,
    currentShopPriority: 1, // Start with Shop 1
    createdAt: Date.now(),
    shopDeadlines: {
      1: Date.now() + 300000, // 5 minutes for shop 1
      2: Date.now() + 600000  // 10 minutes total (shop 2 gets it after 5 min)
    },
    declinedBy: []
  };
  
  orders.push(order);
  console.log(`📦 New order placed: #${order.id} - Assigned to Shop 1 first`);
  res.json({ success: true, order });
});

// Get all orders (for users to see their orders)
app.get('/api/orders/user/:userId', (req, res) => {
  const { userId } = req.params;
  const userOrders = orders.filter(o => o.userId === parseInt(userId));
  res.json({ orders: userOrders });
});

// Get pending orders for specific shop
app.get('/api/orders/pending/:shopId', (req, res) => {
  const { shopId } = req.params;
  const now = Date.now();
  const shopIdNum = parseInt(shopId);
  
  const pendingOrders = orders.filter(o => {
    if (o.status !== 'pending') return false;
    
    const elapsed = Math.floor((now - o.createdAt) / 1000);
    
    // Shop 1 gets orders in first 5 minutes
    if (shopIdNum === 1) {
      return elapsed < 300 && !o.declinedBy.includes(1);
    }
    
    // Shop 2 gets orders after 5 minutes or if shop 1 declined
    if (shopIdNum === 2) {
      return (elapsed >= 300 || o.declinedBy.includes(1)) && elapsed < 600 && !o.declinedBy.includes(2);
    }
    
    return false;
  });
  
  res.json({ orders: pendingOrders });
});

// Get orders for specific shop (accepted orders)
app.get('/api/orders/shop/:shopId', (req, res) => {
  const { shopId } = req.params;
  const shopOrders = orders.filter(o => 
    o.assignedShopId === parseInt(shopId) && o.status === 'accepted'
  );
  res.json({ orders: shopOrders });
});

// Accept order
app.patch('/api/orders/:id/accept', (req, res) => {
  const { id } = req.params;
  const { shopId, shopName } = req.body;
  
  const orderIndex = orders.findIndex(o => o.id === parseInt(id));
  
  if (orderIndex === -1) {
    return res.status(404).json({ success: false, message: 'Order not found' });
  }

  const order = orders[orderIndex];
  
  // Check if order is already accepted
  if (order.status === 'accepted') {
    return res.status(400).json({ success: false, message: 'Order already accepted by another shop' });
  }

  const shop = shops.find(s => s.id === shopId);
  
  if (!shop) {
    return res.status(404).json({ success: false, message: 'Shop not found' });
  }

  // Check inventory
  const canFulfill = order.items.every(item => {
    const inventoryItem = shop.inventory.find(inv => inv.name === item.name);
    return inventoryItem && inventoryItem.stock >= item.quantity;
  });

  if (!canFulfill) {
    return res.status(400).json({ success: false, message: 'Insufficient inventory' });
  }

  // Update inventory
  order.items.forEach(item => {
    const inventoryItem = shop.inventory.find(inv => inv.name === item.name);
    if (inventoryItem) {
      inventoryItem.stock -= item.quantity;
    }
  });

  // Update order
  orders[orderIndex] = {
    ...order,
    status: 'accepted',
    assignedShop: shopName,
    assignedShopId: shopId,
    acceptedAt: new Date().toISOString()
  };

  console.log(`✅ Order #${id} accepted by ${shopName}`);
  res.json({ success: true, order: orders[orderIndex] });
});

// Decline order
app.patch('/api/orders/:id/decline', (req, res) => {
  const { id } = req.params;
  const { shopId } = req.body;
  
  const orderIndex = orders.findIndex(o => o.id === parseInt(id));
  
  if (orderIndex === -1) {
    return res.status(404).json({ success: false, message: 'Order not found' });
  }

  const order = orders[orderIndex];
  
  if (order.status === 'accepted') {
    return res.status(400).json({ success: false, message: 'Order already accepted' });
  }

  // Add shop to declined list
  if (!order.declinedBy.includes(shopId)) {
    order.declinedBy.push(shopId);
  }

  orders[orderIndex] = order;
  
  console.log(`❌ Order #${id} declined by Shop ${shopId}`);
  res.json({ success: true, message: 'Order declined' });
});

// Get shop inventory
app.get('/api/shops/:shopId/inventory', (req, res) => {
  const { shopId } = req.params;
  const shop = shops.find(s => s.id === parseInt(shopId));
  
  if (!shop) {
    return res.status(404).json({ success: false, message: 'Shop not found' });
  }
  
  res.json({ inventory: shop.inventory });
});

// Get all shops
app.get('/api/shops', (req, res) => {
  res.json({ shops: shops.map(s => ({ id: s.id, name: s.name })) });
});

// Get all items with images (for customer view)
app.get('/api/items', (req, res) => {
  // Get unique items from first shop (all shops have same items)
  const items = shops[0].inventory;
  res.json({ items });
});

// Clean up expired orders every 30 seconds
setInterval(() => {
  const now = Date.now();
  const beforeCount = orders.length;
  
  orders = orders.filter(o => {
    if (o.status === 'pending') {
      const elapsed = Math.floor((now - o.createdAt) / 1000);
      return elapsed < 600; // Keep orders less than 10 minutes old
    }
    return true; // Keep non-pending orders
  });
  
  const removedCount = beforeCount - orders.length;
  if (removedCount > 0) {
    console.log(`🧹 Cleaned up ${removedCount} expired orders`);
  }
}, 30000);

app.listen(port, "0.0.0.0", () => {
  console.log(`🚀 Backend server running on http://0.0.0.0:${port}`);
  console.log(`🏪 ${shops.length} shops initialized:`);
  shops.forEach(shop => {
    console.log(`   - ${shop.name} (Shop ${shop.id}) - Priority: ${shop.priority}`);
  });
  console.log(`📋 Order routing: Shop 1 (0-5 min) → Shop 2 (5-10 min)`);
});

