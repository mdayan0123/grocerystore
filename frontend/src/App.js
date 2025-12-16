import React, { useState, useEffect } from 'react';
import { ShoppingCart, Store, User, Phone, Package, Clock, CheckCircle, XCircle, AlertCircle } from 'lucide-react';

const API_URL = `${process.env.REACT_APP_API_URL}/api`;

export default function GroceryApp() {
  const [currentUser, setCurrentUser] = useState(null);
  const [phone, setPhone] = useState('');
  const [otp, setOtp] = useState('');
  const [name, setName] = useState('');
  const [role, setRole] = useState('customer');
  const [otpSent, setOtpSent] = useState(false);

  // Customer state
  const [items, setItems] = useState([]);
  const [cart, setCart] = useState([]);
  const [orders, setOrders] = useState([]);
  
  // Owner state
  const [pendingOrders, setPendingOrders] = useState([]);
  const [shopOrders, setShopOrders] = useState([]);
  const [inventory, setInventory] = useState([]);

  // Fetch items with images
  useEffect(() => {
    fetchItems();
  }, []);

  const fetchItems = async () => {
    try {
      const response = await fetch(`${API_URL}/items`);
      const data = await response.json();
      setItems(data.items);
    } catch (error) {
      console.error('Error fetching items:', error);
    }
  };

  // Send OTP
  const sendOTP = async () => {
    try {
      const response = await fetch(`${API_URL}/send-otp`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ phone })
      });
      const data = await response.json();
      if (data.success) {
        setOtpSent(true);
        alert('OTP sent! Use 1234 to login');
      }
    } catch (error) {
      console.error('Error sending OTP:', error);
      alert('Error sending OTP. Make sure backend is running on port 5000');
    }
  };

  // Verify OTP and Login
  const verifyOTP = async () => {
    try {
      const response = await fetch(`${API_URL}/verify-otp`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ phone, otp, name, role })
      });
      const data = await response.json();
      if (data.success) {
        setCurrentUser(data.user);
        if (data.user.role === 'owner') {
          fetchInventory(data.user.shopId);
        }
      } else {
        alert(data.message);
      }
    } catch (error) {
      console.error('Error verifying OTP:', error);
      alert('Error verifying OTP');
    }
  };

  // Add to cart
  const addToCart = (item) => {
    const existing = cart.find(i => i.id === item.id);
    if (existing) {
      setCart(cart.map(i => 
        i.id === item.id ? { ...i, quantity: i.quantity + 1 } : i
      ));
    } else {
      setCart([...cart, { ...item, quantity: 1 }]);
    }
  };

  // Remove from cart
  const removeFromCart = (itemId) => {
    setCart(cart.filter(i => i.id !== itemId));
  };

  // Update quantity
  const updateQuantity = (itemId, delta) => {
    setCart(cart.map(i => {
      if (i.id === itemId) {
        const newQty = i.quantity + delta;
        return newQty > 0 ? { ...i, quantity: newQty } : i;
      }
      return i;
    }).filter(i => i.quantity > 0));
  };

  // Place order
  const placeOrder = async () => {
    if (cart.length === 0) {
      alert('Cart is empty!');
      return;
    }

    try {
      const response = await fetch(`${API_URL}/orders`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          userId: currentUser.id,
          userName: currentUser.name,
          items: cart,
          total: cart.reduce((sum, item) => sum + (item.price * item.quantity), 0)
        })
      });
      const data = await response.json();
      if (data.success) {
        alert('Order placed! Shop 1 has 5 minutes to accept, then it goes to Shop 2.');
        setCart([]);
        fetchUserOrders();
      }
    } catch (error) {
      console.error('Error placing order:', error);
      alert('Error placing order');
    }
  };

  // Fetch user orders
  const fetchUserOrders = async () => {
    try {
      const response = await fetch(`${API_URL}/orders/user/${currentUser.id}`);
      const data = await response.json();
      setOrders(data.orders);
    } catch (error) {
      console.error('Error fetching orders:', error);
    }
  };

  // Fetch pending orders (for owners)
  const fetchPendingOrders = async () => {
    try {
      const response = await fetch(`${API_URL}/orders/pending/${currentUser.shopId}`);
      const data = await response.json();
      setPendingOrders(data.orders);
    } catch (error) {
      console.error('Error fetching pending orders:', error);
    }
  };

  // Fetch shop orders
  const fetchShopOrders = async () => {
    try {
      const response = await fetch(`${API_URL}/orders/shop/${currentUser.shopId}`);
      const data = await response.json();
      setShopOrders(data.orders);
    } catch (error) {
      console.error('Error fetching shop orders:', error);
    }
  };

  // Accept order
  const acceptOrder = async (orderId) => {
    try {
      const shopResponse = await fetch(`${API_URL}/shops`);
      const shopsData = await shopResponse.json();
      const shop = shopsData.shops.find(s => s.id === currentUser.shopId);

      const response = await fetch(`${API_URL}/orders/${orderId}/accept`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          shopId: currentUser.shopId,
          shopName: shop.name
        })
      });
      const data = await response.json();
      if (data.success) {
        alert('Order accepted successfully!');
        fetchPendingOrders();
        fetchShopOrders();
        fetchInventory(currentUser.shopId);
      } else {
        alert(data.message);
      }
    } catch (error) {
      console.error('Error accepting order:', error);
      alert('Error accepting order');
    }
  };

  // Decline order
  const declineOrder = async (orderId) => {
    try {
      const response = await fetch(`${API_URL}/orders/${orderId}/decline`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          shopId: currentUser.shopId
        })
      });
      const data = await response.json();
      if (data.success) {
        alert(currentUser.shopId === 1 ? 'Order declined. It will go to Shop 2.' : 'Order declined.');
        fetchPendingOrders();
      }
    } catch (error) {
      console.error('Error declining order:', error);
      alert('Error declining order');
    }
  };

  // Fetch inventory
  const fetchInventory = async (shopId) => {
    try {
      const response = await fetch(`${API_URL}/shops/${shopId}/inventory`);
      const data = await response.json();
      setInventory(data.inventory);
    } catch (error) {
      console.error('Error fetching inventory:', error);
    }
  };

  // Auto-refresh for owners
  useEffect(() => {
    if (currentUser?.role === 'owner') {
      fetchPendingOrders();
      fetchShopOrders();
      
      const interval = setInterval(() => {
        fetchPendingOrders();
        fetchShopOrders();
      }, 3000); // Refresh every 3 seconds

      return () => clearInterval(interval);
    }
  }, [currentUser]);

  // Auto-refresh orders for customers
  useEffect(() => {
    if (currentUser?.role === 'customer') {
      fetchUserOrders();
      
      const interval = setInterval(() => {
        fetchUserOrders();
      }, 3000);

      return () => clearInterval(interval);
    }
  }, [currentUser]);

  // Login Screen
  if (!currentUser) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 p-4 flex items-center justify-center">
        <div className="bg-white rounded-2xl shadow-xl p-8 w-full max-w-md">
          <div className="text-center mb-6">
            <ShoppingCart className="w-16 h-16 text-indigo-600 mx-auto mb-4" />
            <h1 className="text-3xl font-bold text-gray-800">Grocery Delivery</h1>
            <p className="text-gray-600 mt-2">Multi-Shop Order System</p>
          </div>

          <div className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">Name</label>
              <input
                type="text"
                value={name}
                onChange={(e) => setName(e.target.value)}
                placeholder="Enter your name"
                className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-transparent"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">Phone Number</label>
              <input
                type="tel"
                value={phone}
                onChange={(e) => setPhone(e.target.value)}
                placeholder="Enter phone number"
                className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-transparent"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">Role</label>
              <select
                value={role}
                onChange={(e) => setRole(e.target.value)}
                className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-transparent"
              >
                <option value="customer">Customer</option>
                <option value="owner">Shop Owner</option>
              </select>
            </div>

            {!otpSent ? (
              <button
                onClick={sendOTP}
                disabled={!phone || !name}
                className="w-full bg-indigo-600 text-white py-3 rounded-lg font-semibold hover:bg-indigo-700 disabled:opacity-50 disabled:cursor-not-allowed transition"
              >
                Send OTP
              </button>
            ) : (
              <div className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">Enter OTP</label>
                  <input
                    type="text"
                    value={otp}
                    onChange={(e) => setOtp(e.target.value)}
                    placeholder="Enter OTP (use 1234)"
                    className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-transparent"
                  />
                </div>
                <button
                  onClick={verifyOTP}
                  disabled={!otp}
                  className="w-full bg-green-600 text-white py-3 rounded-lg font-semibold hover:bg-green-700 disabled:opacity-50 disabled:cursor-not-allowed transition"
                >
                  Verify & Login
                </button>
              </div>
            )}
          </div>
        </div>
      </div>
    );
  }

  // Customer View
  if (currentUser.role === 'customer') {
    return (
      <div className="min-h-screen bg-gray-50">
        <div className="bg-indigo-600 text-white p-4 shadow-lg">
          <div className="max-w-7xl mx-auto flex justify-between items-center">
            <div>
              <h1 className="text-2xl font-bold">Welcome, {currentUser.name}</h1>
              <p className="text-indigo-200">Customer Dashboard</p>
            </div>
            <button
              onClick={() => setCurrentUser(null)}
              className="bg-white text-indigo-600 px-4 py-2 rounded-lg font-semibold hover:bg-indigo-50"
            >
              Logout
            </button>
          </div>
        </div>

        <div className="max-w-7xl mx-auto p-4">
          {/* Info Banner */}
          <div className="bg-blue-50 border border-blue-200 rounded-lg p-4 mb-6 flex items-start gap-3">
            <AlertCircle className="w-5 h-5 text-blue-600 mt-0.5" />
            <div className="text-sm text-blue-800">
              <strong>How it works:</strong> When you place an order, Shop 1 gets 5 minutes to accept. 
              If they decline or don't respond, Shop 2 automatically gets the order for the next 5 minutes.
            </div>
          </div>

          <div className="grid lg:grid-cols-3 gap-6">
            {/* Shop Items with Images */}
            <div className="lg:col-span-2 bg-white rounded-xl shadow-lg p-6">
              <h2 className="text-xl font-bold mb-4 flex items-center gap-2">
                <Store className="w-6 h-6 text-indigo-600" />
                Available Items
              </h2>
              <div className="grid md:grid-cols-2 gap-4">
                {items.map(item => (
                  <div key={item.id} className="border rounded-lg overflow-hidden hover:shadow-md transition">
                    <img 
                      src={item.image} 
                      alt={item.name}
                      className="w-full h-40 object-cover"
                    />
                    <div className="p-4">
                      <div className="flex justify-between items-start mb-3">
                        <div>
                          <h3 className="font-semibold text-lg">{item.name}</h3>
                          <p className="text-indigo-600 font-bold text-xl">₹{item.price}</p>
                        </div>
                        <button
                          onClick={() => addToCart(item)}
                          className="bg-indigo-600 text-white px-4 py-2 rounded-lg hover:bg-indigo-700 transition"
                        >
                          <ShoppingCart className="w-4 h-4 inline mr-1" />
                          Add
                        </button>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>

            {/* Cart */}
            <div className="bg-white rounded-xl shadow-lg p-6 h-fit sticky top-4">
              <h2 className="text-xl font-bold mb-4 flex items-center gap-2">
                <ShoppingCart className="w-6 h-6 text-indigo-600" />
                Cart ({cart.length})
              </h2>
              {cart.length === 0 ? (
                <p className="text-gray-500 text-center py-8">Cart is empty</p>
              ) : (
                <div className="space-y-3">
                  {cart.map(item => (
                    <div key={item.id} className="border rounded-lg p-3">
                      <div className="flex gap-3">
                        <img src={item.image} alt={item.name} className="w-16 h-16 object-cover rounded" />
                        <div className="flex-1">
                          <h3 className="font-semibold text-sm">{item.name}</h3>
                          <p className="text-gray-600 text-sm">₹{item.price} × {item.quantity}</p>
                          <div className="flex items-center gap-2 mt-2">
                            <button
                              onClick={() => updateQuantity(item.id, -1)}
                              className="bg-gray-200 px-2 py-1 rounded text-sm"
                            >
                              -
                            </button>
                            <span className="font-semibold">{item.quantity}</span>
                            <button
                              onClick={() => updateQuantity(item.id, 1)}
                              className="bg-gray-200 px-2 py-1 rounded text-sm"
                            >
                              +
                            </button>
                            <button
                              onClick={() => removeFromCart(item.id)}
                              className="ml-auto text-red-600"
                            >
                              <XCircle className="w-5 h-5" />
                            </button>
                          </div>
                        </div>
                      </div>
                    </div>
                  ))}
                  <div className="border-t pt-4">
                    <div className="flex justify-between text-lg font-bold mb-4">
                      <span>Total:</span>
                      <span>₹{cart.reduce((sum, item) => sum + (item.price * item.quantity), 0)}</span>
                    </div>
                    <button
                      onClick={placeOrder}
                      className="w-full bg-green-600 text-white py-3 rounded-lg font-semibold hover:bg-green-700"
                    >
                      Place Order
                    </button>
                  </div>
                </div>
              )}
            </div>
          </div>

          {/* My Orders */}
          <div className="mt-6 bg-white rounded-xl shadow-lg p-6">
            <h2 className="text-xl font-bold mb-4 flex items-center gap-2">
              <Package className="w-6 h-6 text-indigo-600" />
              My Orders
            </h2>
            {orders.length === 0 ? (
              <p className="text-gray-500 text-center py-8">No orders yet</p>
            ) : (
              <div className="grid md:grid-cols-2 gap-4">
                {orders.map(order => {
                  const elapsed = Math.floor((Date.now() - order.createdAt) / 1000);
                  const phase = elapsed < 300 ? 'Shop 1' : elapsed < 600 ? 'Shop 2' : 'Expired';
                  
                  return (
                    <div key={order.id} className="border rounded-lg p-4">
                      <div className="flex justify-between items-start mb-3">
                        <div>
                          <h3 className="font-bold">Order #{order.id}</h3>
                          <p className="text-sm text-gray-600">{new Date(order.timestamp).toLocaleString()}</p>
                          {order.status === 'pending' && (
                            <p className="text-sm text-orange-600 font-semibold mt-1">
                              📍 Currently with: {phase}
                            </p>
                          )}
                        </div>
                        <span className={`px-3 py-1 rounded-full text-sm font-semibold ${
                          order.status === 'pending' ? 'bg-yellow-100 text-yellow-800' :
                          order.status === 'accepted' ? 'bg-green-100 text-green-800' :
                          'bg-gray-100 text-gray-800'
                        }`}>
                          {order.status}
                        </span>
                      </div>
                      <div className="space-y-2">
                        {order.items.map((item, idx) => (
                          <div key={idx} className="text-sm text-gray-700">
                            {item.name} × {item.quantity} = ₹{item.price * item.quantity}
                          </div>
                        ))}
                        <div className="border-t pt-2 font-bold">
                          Total: ₹{order.total}
                        </div>
                        {order.assignedShop && (
                          <div className="text-sm text-green-600 font-semibold bg-green-50 p-2 rounded">
                            ✅ Accepted by: {order.assignedShop}
                          </div>
                        )}
                      </div>
                    </div>
                  );
                })}
              </div>
            )}
          </div>
        </div>
      </div>
    );
  }

  // Owner View
  const shopName = currentUser.shopId === 1 ? 'Fresh Mart' : 'Quick Grocery';
  
  return (
    <div className="min-h-screen bg-gray-50">
      <div className={`${currentUser.shopId === 1 ? 'bg-purple-600' : 'bg-teal-600'} text-white p-4 shadow-lg`}>
        <div className="max-w-6xl mx-auto flex justify-between items-center">
          <div>
            <h1 className="text-2xl font-bold">{shopName}</h1>
            <p className={`${currentUser.shopId === 1 ? 'text-purple-200' : 'text-teal-200'}`}>
              Shop Owner: {currentUser.name} • Priority: {currentUser.shopId === 1 ? '1st (0-5 min)' : '2nd (5-10 min)'}
            </p>
          </div>
          <button
            onClick={() => setCurrentUser(null)}
            className="bg-white text-gray-800 px-4 py-2 rounded-lg font-semibold hover:bg-gray-100"
          >
            Logout
          </button>
        </div>
      </div>

      <div className="max-w-6xl mx-auto p-4 space-y-6">
        {/* Info Banner */}
        <div className={`${currentUser.shopId === 1 ? 'bg-purple-50 border-purple-200' : 'bg-teal-50 border-teal-200'} border rounded-lg p-4 flex items-start gap-3`}>
          <AlertCircle className={`w-5 h-5 ${currentUser.shopId === 1 ? 'text-purple-600' : 'text-teal-600'} mt-0.5`} />
          <div className={`text-sm ${currentUser.shopId === 1 ? 'text-purple-800' : 'text-teal-800'}`}>
            {currentUser.shopId === 1 ? (
              <span><strong>Priority 1:</strong> You get new orders first! You have 5 minutes to accept or decline. If you decline, it goes to Shop 2.</span>
            ) : (
              <span><strong>Priority 2:</strong> You receive orders after 5 minutes if Shop 1 doesn't respond, or immediately if they decline.</span>
            )}
          </div>
        </div>

        {/* Pending Orders */}
        <div className="bg-white rounded-xl shadow-lg p-6">
          <h2 className="text-xl font-bold mb-4 flex items-center gap-2">
            <Clock className="w-6 h-6 text-orange-600" />
            Pending Orders ({pendingOrders.length})
          </h2>
          {pendingOrders.length === 0 ? (
            <p className="text-gray-500 text-center py-8">No pending orders</p>
          ) : (
            <div className="space-y-4">
              {pendingOrders.map(order => {
                const elapsed = Math.floor((Date.now() - order.createdAt) / 1000);
                const timeInPhase = currentUser.shopId === 1 ? elapsed : elapsed - 300;
                const remaining = Math.max(0, 300 - timeInPhase);
                
                return (
                  <div key={order.id} className="border-2 border-orange-200 rounded-lg p-4 bg-orange-50">
                    <div className="flex justify-between items-start mb-3">
                      <div>
                        <h3 className="font-bold text-lg">Order #{order.id}</h3>
                        <p className="text-sm text-gray-600">Customer: {order.userName}</p>
                        <p className="text-sm text-gray-600">{new Date(order.timestamp).toLocaleString()}</p>
                      </div>
                      <div className="text-right">
                        <div className="text-2xl font-bold text-orange-600">
                          {Math.floor(remaining / 60)}:{(remaining % 60).toString().padStart(2, '0')}
                        </div>
                        <p className="text-xs text-gray-600">Time left</p>
                      </div>
                    </div>
                    <div className="space-y-2 mb-4">
                      {order.items.map((item, idx) => (
                        <div key={idx} className="text-sm bg-white p-2 rounded flex items-center gap-2">
                          <img src={item.image} alt={item.name} className="w-10 h-10 object-cover rounded" />
                          <span>{item.name} × {item.quantity} = ₹{item.price * item.quantity}</span>
                        </div>
                      ))}
                      <div className="font-bold text-lg bg-white p-2 rounded">
                        Total: ₹{order.total}
                      </div>
                    </div>
                    <div className="flex gap-2">
                      <button
                        onClick={() => acceptOrder(order.id)}
                        className="flex-1 bg-green-600 text-white py-3 rounded-lg font-semibold hover:bg-green-700 flex items-center justify-center gap-2"
                      >
                        <CheckCircle className="w-5 h-5" />
                        Accept Order
                      </button>
                      <button
                        onClick={() => declineOrder(order.id)}
                        className="flex-1 bg-red-600 text-white py-3 rounded-lg font-semibold hover:bg-red-700 flex items-center justify-center gap-2"
                      >
                        <XCircle className="w-5 h-5" />
                        Decline
                      </button>
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </div>

        {/* Accepted Orders */}
        <div className="bg-white rounded-xl shadow-lg p-6">
          <h2 className="text-xl font-bold mb-4 flex items-center gap-2">
            <CheckCircle className="w-6 h-6 text-green-600" />
            My Accepted Orders ({shopOrders.length})
          </h2>
          {shopOrders.length === 0 ? (
            <p className="text-gray-500 text-center py-8">No accepted orders yet</p>
          ) : (
            <div className="grid md:grid-cols-2 gap-4">
              {shopOrders.map(order => (
                <div key={order.id} className="border-2 border-green-200 rounded-lg p-4 bg-green-50">
                  <div className="flex justify-between items-start mb-3">
                    <div>
                      <h3 className="font-bold">Order #{order.id}</h3>
                      <p className="text-sm text-gray-600">Customer: {order.userName}</p>
                      <p className="text-sm text-gray-600">{new Date(order.timestamp).toLocaleString()}</p>
                    </div>
                    <span className="bg-green-600 text-white px-3 py-1 rounded-full text-sm font-semibold">
                      Accepted
                    </span>
                  </div>
                  <div className="space-y-2">
                    {order.items.map((item, idx) => (
                      <div key={idx} className="text-sm bg-white p-2 rounded">
                        {item.name} × {item.quantity}
                      </div>
                    ))}
                    <div className="font-bold bg-white p-2 rounded">
                      Total: ₹{order.total}
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Inventory */}
        <div className="bg-white rounded-xl shadow-lg p-6">
          <h2 className="text-xl font-bold mb-4 flex items-center gap-2">
            <Package className={`w-6 h-6 ${currentUser.shopId === 1 ? 'text-purple-600' : 'text-teal-600'}`} />
            Current Inventory
          </h2>
          <div className="grid md:grid-cols-4 gap-4">
            {inventory.map(item => (
              <div key={item.id} className="border rounded-lg overflow-hidden">
                <img src={item.image} alt={item.name} className="w-full h-32 object-cover" />
                <div className="p-3">
                  <h3 className="font-semibold">{item.name}</h3>
                  <p className="text-gray-600 text-sm">₹{item.price}</p>
                  <div className={`mt-2 text-lg font-bold ${item.stock < 20 ? 'text-red-600' : 'text-green-600'}`}>
                    Stock: {item.stock}
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}

