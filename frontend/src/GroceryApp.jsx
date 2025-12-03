import React, { useState, useEffect } from 'react';
import { ShoppingCart, Store, Phone, Clock, CheckCircle, XCircle, Package, LogOut } from 'lucide-react';

const GroceryApp = () => {
  const [currentScreen, setCurrentScreen] = useState('role-select');
  const [userRole, setUserRole] = useState(null);
  const [userData, setUserData] = useState({ name: '', phone: '', otp: '' });
  const [otpSent, setOtpSent] = useState(false);
  const [isLoggedIn, setIsLoggedIn] = useState(false);
  
  const [cart, setCart] = useState([]);
  const [userOrders, setUserOrders] = useState([]);
  
  const [ownerShop, setOwnerShop] = useState({ id: 1, name: 'Fresh Mart' });
  const [inventory, setInventory] = useState([
    { id: 1, name: 'Milk', price: 60, stock: 50 },
    { id: 2, name: 'Bread', price: 40, stock: 30 },
    { id: 3, name: 'Eggs (12)', price: 80, stock: 40 },
    { id: 4, name: 'Rice (1kg)', price: 70, stock: 100 },
    { id: 5, name: 'Sugar (1kg)', price: 50, stock: 80 },
  ]);
  const [pendingOrders, setPendingOrders] = useState([]);
  const [acceptedOrders, setAcceptedOrders] = useState([]);

  const products = [
    { id: 1, name: 'Milk', price: 60, image: '🥛' },
    { id: 2, name: 'Bread', price: 40, image: '🍞' },
    { id: 3, name: 'Eggs (12)', price: 80, image: '🥚' },
    { id: 4, name: 'Rice (1kg)', price: 70, image: '🍚' },
    { id: 5, name: 'Sugar (1kg)', price: 50, image: '🧂' },
    { id: 6, name: 'Tomatoes (1kg)', price: 45, image: '🍅' },
    { id: 7, name: 'Onions (1kg)', price: 35, image: '🧅' },
    { id: 8, name: 'Potatoes (1kg)', price: 30, image: '🥔' },
  ];

  const handleRoleSelect = (role) => {
    setUserRole(role);
    setCurrentScreen('login');
  };

  const handleSendOTP = () => {
    if (userData.phone.length === 10) {
      setOtpSent(true);
      alert('OTP sent to your phone: 1234');
    }
  };

  const handleLogin = () => {
    if (userData.otp === '1234') {
      setIsLoggedIn(true);
      setCurrentScreen(userRole === 'user' ? 'user-dashboard' : 'owner-dashboard');
    } else {
      alert('Invalid OTP');
    }
  };

  const handleLogout = () => {
    setIsLoggedIn(false);
    setUserRole(null);
    setCurrentScreen('role-select');
    setUserData({ name: '', phone: '', otp: '' });
    setOtpSent(false);
  };

  const addToCart = (product) => {
    const existing = cart.find(item => item.id === product.id);
    if (existing) {
      setCart(cart.map(item => 
        item.id === product.id ? { ...item, quantity: item.quantity + 1 } : item
      ));
    } else {
      setCart([...cart, { ...product, quantity: 1 }]);
    }
  };

  const removeFromCart = (productId) => {
    setCart(cart.filter(item => item.id !== productId));
  };

  const placeOrder = () => {
    if (cart.length === 0) return;
    
    const newOrder = {
      id: Date.now(),
      items: [...cart],
      total: cart.reduce((sum, item) => sum + (item.price * item.quantity), 0),
      status: 'pending',
      timestamp: new Date().toISOString(),
      timer: 300,
      assignedShop: null
    };
    
    setUserOrders([newOrder, ...userOrders]);
    setPendingOrders([newOrder, ...pendingOrders]);
    setCart([]);
    alert('Order placed successfully!');
  };

  const acceptOrder = (orderId) => {
    const order = pendingOrders.find(o => o.id === orderId);
    if (!order) return;

    const canFulfill = order.items.every(item => {
      const inventoryItem = inventory.find(inv => inv.name === item.name);
      return inventoryItem && inventoryItem.stock >= item.quantity;
    });

    if (!canFulfill) {
      alert('Cannot accept: Insufficient inventory');
      return;
    }

    const updatedInventory = inventory.map(inv => {
      const orderItem = order.items.find(item => item.name === inv.name);
      if (orderItem) {
        return { ...inv, stock: inv.stock - orderItem.quantity };
      }
      return inv;
    });

    setInventory(updatedInventory);
    
    const updatedOrder = { ...order, status: 'accepted', assignedShop: ownerShop.name };
    setPendingOrders(pendingOrders.filter(o => o.id !== orderId));
    setAcceptedOrders([updatedOrder, ...acceptedOrders]);
    setUserOrders(userOrders.map(o => o.id === orderId ? updatedOrder : o));
  };

  const updateInventoryStock = (productId, newStock) => {
    setInventory(inventory.map(item => 
      item.id === productId ? { ...item, stock: parseInt(newStock) || 0 } : item
    ));
  };

  useEffect(() => {
    const interval = setInterval(() => {
      setPendingOrders(orders => 
        orders.map(order => ({
          ...order,
          timer: order.timer > 0 ? order.timer - 1 : 0
        })).filter(order => order.timer > 0)
      );
    }, 1000);

    return () => clearInterval(interval);
  }, []);

  const formatTime = (seconds) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins}:${secs.toString().padStart(2, '0')}`;
  };

  if (currentScreen === 'role-select') {
    return (
      <div className="min-h-screen bg-gray-900 flex items-center justify-center p-4">
        <div className="max-w-4xl w-full">
          <h1 className="text-4xl font-bold text-center mb-12 text-blue-400">
            🛒 Grocery Delivery App
          </h1>
          <div className="grid md:grid-cols-2 gap-8">
            <button
              onClick={() => handleRoleSelect('user')}
              className="bg-gradient-to-br from-blue-600 to-blue-800 p-12 rounded-2xl hover:from-blue-500 hover:to-blue-700 transition-all transform hover:scale-105 shadow-2xl"
            >
              <ShoppingCart className="w-24 h-24 mx-auto mb-6 text-white" />
              <h2 className="text-3xl font-bold text-white mb-4">I'm a Customer</h2>
              <p className="text-blue-200">Order groceries from nearby stores</p>
            </button>
            
            <button
              onClick={() => handleRoleSelect('owner')}
              className="bg-gradient-to-br from-green-600 to-green-800 p-12 rounded-2xl hover:from-green-500 hover:to-green-700 transition-all transform hover:scale-105 shadow-2xl"
            >
              <Store className="w-24 h-24 mx-auto mb-6 text-white" />
              <h2 className="text-3xl font-bold text-white mb-4">I'm a Shop Owner</h2>
              <p className="text-green-200">Manage orders and inventory</p>
            </button>
          </div>
        </div>
      </div>
    );
  }

  if (currentScreen === 'login') {
    return (
      <div className="min-h-screen bg-gray-900 flex items-center justify-center p-4">
        <div className="bg-gray-800 p-8 rounded-2xl shadow-2xl max-w-md w-full border border-gray-700">
          <div className="text-center mb-8">
            {userRole === 'user' ? (
              <ShoppingCart className="w-16 h-16 mx-auto mb-4 text-blue-400" />
            ) : (
              <Store className="w-16 h-16 mx-auto mb-4 text-green-400" />
            )}
            <h2 className="text-3xl font-bold text-white">
              {userRole === 'user' ? 'Customer Login' : 'Owner Login'}
            </h2>
          </div>

          <div className="space-y-6">
            <div>
              <label className="block text-gray-300 mb-2">Name</label>
              <input
                type="text"
                value={userData.name}
                onChange={(e) => setUserData({ ...userData, name: e.target.value })}
                className="w-full bg-gray-700 text-white px-4 py-3 rounded-lg border border-gray-600 focus:border-blue-500 focus:outline-none"
                placeholder="Enter your name"
              />
            </div>

            <div>
              <label className="block text-gray-300 mb-2">Phone Number</label>
              <div className="flex gap-2">
                <input
                  type="tel"
                  value={userData.phone}
                  onChange={(e) => setUserData({ ...userData, phone: e.target.value })}
                  className="flex-1 bg-gray-700 text-white px-4 py-3 rounded-lg border border-gray-600 focus:border-blue-500 focus:outline-none"
                  placeholder="10-digit number"
                  maxLength="10"
                />
                <button
                  onClick={handleSendOTP}
                  disabled={userData.phone.length !== 10}
                  className="bg-blue-600 text-white px-6 py-3 rounded-lg hover:bg-blue-500 disabled:bg-gray-600 disabled:cursor-not-allowed transition-colors"
                >
                  <Phone className="w-5 h-5" />
                </button>
              </div>
            </div>

            {otpSent && (
              <div>
                <label className="block text-gray-300 mb-2">Enter OTP</label>
                <input
                  type="text"
                  value={userData.otp}
                  onChange={(e) => setUserData({ ...userData, otp: e.target.value })}
                  className="w-full bg-gray-700 text-white px-4 py-3 rounded-lg border border-gray-600 focus:border-green-500 focus:outline-none"
                  placeholder="Enter 4-digit OTP"
                  maxLength="4"
                />
              </div>
            )}

            <button
              onClick={handleLogin}
              disabled={!otpSent || userData.otp.length !== 4}
              className="w-full bg-gradient-to-r from-green-600 to-green-700 text-white py-4 rounded-lg font-semibold hover:from-green-500 hover:to-green-600 disabled:from-gray-600 disabled:to-gray-700 disabled:cursor-not-allowed transition-all shadow-lg"
            >
              Login
            </button>

            <button
              onClick={() => setCurrentScreen('role-select')}
              className="w-full text-gray-400 hover:text-white transition-colors"
            >
              ← Back to role selection
            </button>
          </div>
        </div>
      </div>
    );
  }

  if (currentScreen === 'user-dashboard') {
    return (
      <div className="min-h-screen bg-gray-900 text-white">
        <header className="bg-gray-800 border-b border-gray-700 p-4 sticky top-0 z-10">
          <div className="max-w-7xl mx-auto flex items-center justify-between">
            <div>
              <h1 className="text-2xl font-bold text-blue-400">🛒 Grocery App</h1>
              <p className="text-gray-400">Welcome, {userData.name}</p>
            </div>
            <div className="flex items-center gap-4">
              <button
                onClick={() => setCurrentScreen('user-orders')}
                className="bg-orange-600 px-4 py-2 rounded-lg hover:bg-orange-500 transition-colors flex items-center gap-2"
              >
                <Package className="w-5 h-5" />
                My Orders ({userOrders.length})
              </button>
              <button
                onClick={handleLogout}
                className="bg-red-600 px-4 py-2 rounded-lg hover:bg-red-500 transition-colors flex items-center gap-2"
              >
                <LogOut className="w-5 h-5" />
              </button>
            </div>
          </div>
        </header>

        <div className="max-w-7xl mx-auto p-6">
          <div className="grid lg:grid-cols-3 gap-8">
            <div className="lg:col-span-2">
              <h2 className="text-2xl font-bold mb-6 text-blue-400">Available Products</h2>
              <div className="grid sm:grid-cols-2 gap-4">
                {products.map(product => (
                  <div key={product.id} className="bg-gray-800 p-6 rounded-xl border border-gray-700 hover:border-blue-500 transition-colors">
                    <div className="text-6xl mb-4 text-center">{product.image}</div>
                    <h3 className="text-xl font-semibold mb-2">{product.name}</h3>
                    <p className="text-green-400 text-lg font-bold mb-4">₹{product.price}</p>
                    <button
                      onClick={() => addToCart(product)}
                      className="w-full bg-blue-600 py-2 rounded-lg hover:bg-blue-500 transition-colors"
                    >
                      Add to Cart
                    </button>
                  </div>
                ))}
              </div>
            </div>

            <div className="lg:col-span-1">
              <div className="bg-gray-800 p-6 rounded-xl border border-gray-700 sticky top-24">
                <h2 className="text-2xl font-bold mb-6 text-green-400">Cart</h2>
                {cart.length === 0 ? (
                  <p className="text-gray-400 text-center py-8">Cart is empty</p>
                ) : (
                  <>
                    <div className="space-y-4 mb-6 max-h-96 overflow-y-auto">
                      {cart.map(item => (
                        <div key={item.id} className="flex items-center justify-between bg-gray-700 p-4 rounded-lg">
                          <div>
                            <p className="font-semibold">{item.name}</p>
                            <p className="text-sm text-gray-400">₹{item.price} x {item.quantity}</p>
                          </div>
                          <button
                            onClick={() => removeFromCart(item.id)}
                            className="text-red-400 hover:text-red-300"
                          >
                            <XCircle className="w-5 h-5" />
                          </button>
                        </div>
                      ))}
                    </div>
                    <div className="border-t border-gray-700 pt-4">
                      <div className="flex justify-between mb-4">
                        <span className="text-xl font-bold">Total:</span>
                        <span className="text-xl font-bold text-green-400">
                          ₹{cart.reduce((sum, item) => sum + (item.price * item.quantity), 0)}
                        </span>
                      </div>
                      <button
                        onClick={placeOrder}
                        className="w-full bg-gradient-to-r from-green-600 to-green-700 py-3 rounded-lg font-semibold hover:from-green-500 hover:to-green-600 transition-all shadow-lg"
                      >
                        Place Order
                      </button>
                    </div>
                  </>
                )}
              </div>
            </div>
          </div>
        </div>
      </div>
    );
  }

  if (currentScreen === 'user-orders') {
    return (
      <div className="min-h-screen bg-gray-900 text-white">
        <header className="bg-gray-800 border-b border-gray-700 p-4">
          <div className="max-w-7xl mx-auto flex items-center justify-between">
            <h1 className="text-2xl font-bold text-orange-400">My Orders</h1>
            <button
              onClick={() => setCurrentScreen('user-dashboard')}
              className="bg-blue-600 px-4 py-2 rounded-lg hover:bg-blue-500 transition-colors"
            >
              ← Back to Shop
            </button>
          </div>
        </header>

        <div className="max-w-7xl mx-auto p-6">
          {userOrders.length === 0 ? (
            <p className="text-center text-gray-400 py-12">No orders yet</p>
          ) : (
            <div className="space-y-4">
              {userOrders.map(order => (
                <div key={order.id} className="bg-gray-800 p-6 rounded-xl border border-gray-700">
                  <div className="flex items-center justify-between mb-4">
                    <div>
                      <p className="text-sm text-gray-400">Order #{order.id}</p>
                      <p className="text-sm text-gray-400">{new Date(order.timestamp).toLocaleString()}</p>
                    </div>
                    <div className={`px-4 py-2 rounded-lg font-semibold ${
                      order.status === 'pending' ? 'bg-orange-600' :
                      order.status === 'accepted' ? 'bg-green-600' :
                      'bg-red-600'
                    }`}>
                      {order.status.toUpperCase()}
                    </div>
                  </div>
                  
                  <div className="space-y-2 mb-4">
                    {order.items.map(item => (
                      <div key={item.id} className="flex justify-between text-gray-300">
                        <span>{item.name} x {item.quantity}</span>
                        <span>₹{item.price * item.quantity}</span>
                      </div>
                    ))}
                  </div>
                  
                  <div className="flex justify-between items-center pt-4 border-t border-gray-700">
                    <span className="text-xl font-bold">Total: ₹{order.total}</span>
                    {order.assignedShop && (
                      <span className="text-green-400">Shop: {order.assignedShop}</span>
                    )}
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    );
  }

  if (currentScreen === 'owner-dashboard') {
    return (
      <div className="min-h-screen bg-gray-900 text-white">
        <header className="bg-gray-800 border-b border-gray-700 p-4">
          <div className="max-w-7xl mx-auto flex items-center justify-between">
            <div>
              <h1 className="text-2xl font-bold text-green-400">🏪 {ownerShop.name}</h1>
              <p className="text-gray-400">Shop Owner Dashboard</p>
            </div>
            <div className="flex items-center gap-4">
              <button
                onClick={() => setCurrentScreen('owner-inventory')}
                className="bg-blue-600 px-4 py-2 rounded-lg hover:bg-blue-500 transition-colors"
              >
                Manage Inventory
              </button>
              <button
                onClick={handleLogout}
                className="bg-red-600 px-4 py-2 rounded-lg hover:bg-red-500 transition-colors flex items-center gap-2"
              >
                <LogOut className="w-5 h-5" />
              </button>
            </div>
          </div>
        </header>

        <div className="max-w-7xl mx-auto p-6">
          <div className="grid lg:grid-cols-2 gap-8">
            <div>
              <h2 className="text-2xl font-bold mb-6 text-orange-400 flex items-center gap-2">
                <Clock className="w-6 h-6" />
                Pending Orders
              </h2>
              {pendingOrders.length === 0 ? (
                <p className="text-gray-400 text-center py-8 bg-gray-800 rounded-xl">No pending orders</p>
              ) : (
                <div className="space-y-4">
                  {pendingOrders.map(order => (
                    <div key={order.id} className="bg-gray-800 p-6 rounded-xl border-2 border-orange-600">
                      <div className="flex items-center justify-between mb-4">
                        <div>
                          <p className="text-sm text-gray-400">Order #{order.id}</p>
                          <p className="text-2xl font-bold text-orange-400">
                            Time Left: {formatTime(order.timer)}
                          </p>
                        </div>
                        <div className="text-right">
                          <p className="text-2xl font-bold text-green-400">₹{order.total}</p>
                        </div>
                      </div>
                      
                      <div className="space-y-2 mb-4">
                        {order.items.map(item => {
                          const inventoryItem = inventory.find(inv => inv.name === item.name);
                          const hasStock = inventoryItem && inventoryItem.stock >= item.quantity;
                          return (
                            <div key={item.id} className={`flex justify-between ${hasStock ? 'text-gray-300' : 'text-red-400'}`}>
                              <span>{item.name} x {item.quantity}</span>
                              <span>{hasStock ? '✓ In Stock' : '✗ Out of Stock'}</span>
                            </div>
                          );
                        })}
                      </div>
                      
                      <button
                        onClick={() => acceptOrder(order.id)}
                        className="w-full bg-green-600 py-3 rounded-lg font-semibold hover:bg-green-500 transition-colors"
                      >
                        Accept Order
                      </button>
                    </div>
                  ))}
                </div>
              )}
            </div>

            <div>
              <h2 className="text-2xl font-bold mb-6 text-green-400 flex items-center gap-2">
                <CheckCircle className="w-6 h-6" />
                Accepted Orders
              </h2>
              {acceptedOrders.length === 0 ? (
                <p className="text-gray-400 text-center py-8 bg-gray-800 rounded-xl">No accepted orders</p>
              ) : (
                <div className="space-y-4">
                  {acceptedOrders.map(order => (
                    <div key={order.id} className="bg-gray-800 p-6 rounded-xl border-2 border-green-600">
                      <div className="flex items-center justify-between mb-4">
                        <div>
                          <p className="text-sm text-gray-400">Order #{order.id}</p>
                          <p className="text-sm text-gray-400">{new Date(order.timestamp).toLocaleString()}</p>
                        </div>
                        <div className="text-right">
                          <p className="text-2xl font-bold text-green-400">₹{order.total}</p>
                        </div>
                      </div>
                      
                      <div className="space-y-2">
                        {order.items.map(item => (
                          <div key={item.id} className="flex justify-between text-gray-300">
                            <span>{item.name} x {item.quantity}</span>
                            <span>₹{item.price * item.quantity}</span>
                          </div>
                        ))}
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
    );
  }

  if (currentScreen === 'owner-inventory') {
    return (
      <div className="min-h-screen bg-gray-900 text-white">
        <header className="bg-gray-800 border-b border-gray-700 p-4">
          <div className="max-w-7xl mx-auto flex items-center justify-between">
            <h1 className="text-2xl font-bold text-blue-400">Inventory Management</h1>
            <button
              onClick={() => setCurrentScreen('owner-dashboard')}
              className="bg-green-600 px-4 py-2 rounded-lg hover:bg-green-500 transition-colors"
            >
              ← Back to Dashboard
            </button>
          </div>
        </header>

        <div className="max-w-4xl mx-auto p-6">
          <div className="bg-gray-800 rounded-xl border border-gray-700 overflow-hidden">
            <table className="w-full">
              <thead className="bg-gray-700">
                <tr>
                  <th className="px-6 py-4 text-left">Product</th>
                  <th className="px-6 py-4 text-left">Price</th>
                  <th className="px-6 py-4 text-left">Stock</th>
                  <th className="px-6 py-4 text-left">Update Stock</th>
                </tr>
              </thead>
              <tbody>
                {inventory.map(item => (
                  <tr key={item.id} className="border-t border-gray-700">
                    <td className="px-6 py-4 font-semibold">{item.name}</td>
                    <td className="px-6 py-4 text-green-400">₹{item.price}</td>
                    <td className="px-6 py-4">
                      <span className={`px-3 py-1 rounded-lg ${
                        item.stock > 20 ? 'bg-green-600' :
                        item.stock > 10 ? 'bg-orange-600' :
                        'bg-red-600'
                      }`}>
                        {item.stock} units
                      </span>
                    </td>
                    <td className="px-6 py-4">
                      <input
                        type="number"
                        value={item.stock}
                        onChange={(e) => updateInventoryStock(item.id, e.target.value)}
                        className="bg-gray-700 text-white px-4 py-2 rounded-lg border border-gray-600 focus:border-blue-500 focus:outline-none w-32"
                        min="0"
                      />
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      </div>
    );
  }

  return null;
};

export default GroceryApp;