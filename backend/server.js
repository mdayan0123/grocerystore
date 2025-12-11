const express = require('express');
const cors = require('cors');
const app = express();
const port = 5000;

app.use(cors());
app.use(express.json());

// In-memory storage (use database in production)
let orders = [];
let users = [];
let shops = [
  {
    id: 1,
    name: 'Fresh Mart',
    inventory: [
      { id: 1, name: 'Milk', price: 60, stock: 50 },
      { id: 2, name: 'Bread', price: 40, stock: 30 },
      { id: 3, name: 'Eggs (12)', price: 80, stock: 40 },
      { id: 4, name: 'Rice (1kg)', price: 70, stock: 100 },
      { id: 5, name: 'Sugar (1kg)', price: 50, stock: 80 },
    ]
  },
  {
    id: 2,
    name: 'Quick Grocery',
    inventory: [
      { id: 1, name: 'Milk', price: 60, stock: 40 },
      { id: 2, name: 'Bread', price: 40, stock: 25 },
      { id: 3, name: 'Eggs (12)', price: 80, stock: 35 },
      { id: 4, name: 'Rice (1kg)', price: 70, stock: 90 },
      { id: 5, name: 'Sugar (1kg)', price: 50, stock: 70 },
    ]
  },
  {
    id: 3,
    name: 'Daily Needs',
    inventory: [
      { id: 1, name: 'Milk', price: 60, stock: 45 },
      { id: 2, name: 'Bread', price: 40, stock: 28 },
      { id: 3, name: 'Eggs (12)', price: 80, stock: 38 },
      { id: 4, name: 'Rice (1kg)', price: 70, stock: 95 },
      { id: 5, name: 'Sugar (1kg)', price: 50, stock: 75 },
    ]
  }
];

// Send OTP endpoint
app.post('/api/send-otp', (req, res) => {
  const { phone } = req.body;
  console.log(`📱 Sending OTP to ${phone}`);
  // In production, integrate with SMS service like Twilio
  res.json({ success: true, message: 'OTP sent successfully' });
});

// Verify OTP and login
app.post('/api/verify-otp', (req, res) => {
  const { phone, otp, name, role } = req.body;
  
  if (otp === '1234') {
    let user = users.find(u => u.phone === phone);
    
    if (!user) {
      user = { 
        id: Date.now(), 
        phone, 
        name, 
        role,
        shopId: role === 'owner' ? (users.filter(u => u.role === 'owner').length % 3) + 1 : null
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
    timer: 300, // 5 minutes
    assignedShop: null,
    createdAt: Date.now()
  };
  
  orders.push(order);
  console.log(`📦 New order placed: #${order.id}`);
  res.json({ success: true, order });
});

// Get all orders (for users to see their orders)
app.get('/api/orders/user/:userId', (req, res) => {
  const { userId } = req.params;
  const userOrders = orders.filter(o => o.userId === parseInt(userId));
  res.json({ orders: userOrders });
});

// Get pending orders for shops
app.get('/api/orders/pending', (req, res) => {
  const now = Date.now();
  const pendingOrders = orders.filter(o => {
    const elapsed = Math.floor((now - o.createdAt) / 1000);
    return o.status === 'pending' && elapsed < 300;
  });
  res.json({ orders: pendingOrders });
});

// Get orders for specific shop
app.get('/api/orders/shop/:shopId', (req, res) => {
  const { shopId } = req.params;
  const shopOrders = orders.filter(o => 
    o.assignedShopId === parseInt(shopId)
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

// Get shop inventory
app.get('/api/shops/:shopId/inventory', (req, res) => {
  const { shopId } = req.params;
  const shop = shops.find(s => s.id === parseInt(shopId));
  
  if (!shop) {
    return res.status(404).json({ success: false, message: 'Shop not found' });
  }
  
  res.json({ inventory: shop.inventory });
});

// Update shop inventory
app.patch('/api/shops/:shopId/inventory/:itemId', (req, res) => {
  const { shopId, itemId } = req.params;
  const { stock } = req.body;
  
  const shop = shops.find(s => s.id === parseInt(shopId));
  
  if (!shop) {
    return res.status(404).json({ success: false, message: 'Shop not found' });
  }
  
  const item = shop.inventory.find(i => i.id === parseInt(itemId));
  
  if (!item) {
    return res.status(404).json({ success: false, message: 'Item not found' });
  }
  
  item.stock = stock;
  console.log(`📊 ${shop.name} updated ${item.name} stock to ${stock}`);
  res.json({ success: true, item });
});

// Get all shops
app.get('/api/shops', (req, res) => {
  res.json({ shops: shops.map(s => ({ id: s.id, name: s.name })) });
});

// Clean up expired orders every 30 seconds
setInterval(() => {
  const now = Date.now();
  const beforeCount = orders.length;
  
  orders = orders.filter(o => {
    if (o.status === 'pending') {
      const elapsed = Math.floor((now - o.createdAt) / 1000);
      return elapsed < 300; // Keep orders less than 5 minutes old
    }
    return true; // Keep non-pending orders
  });
  
  const removedCount = beforeCount - orders.length;
  if (removedCount > 0) {
    console.log(`🧹 Cleaned up ${removedCount} expired orders`);
  }
}, 30000);

app.listen(port, () => {
  console.log(`🚀 Backend server running on http://localhost:${port}`);
  console.log(`📊 ${shops.length} shops initialized`);
});
