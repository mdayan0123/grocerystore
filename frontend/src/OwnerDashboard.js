import React, { useEffect, useState } from "react";

function OwnerDashboard({ onBack }) {
  const [shops, setShops] = useState([]);
  const [shopId, setShopId] = useState(1);
  const [inventory, setInventory] = useState([]);
  const [orders, setOrders] = useState([]);

  useEffect(() => {
    fetch("http://localhost:4000/api/shops")
      .then((r) => r.json())
      .then((d) => {
        setShops(d.shops);
        setInventory(d.shops[0].inventory);
      });
  }, []);

  useEffect(() => {
    fetch(`http://localhost:4000/api/owner/${shopId}/orders`)
      .then((r) => r.json())
      .then((d) => setOrders(d.orders));
  }, [shopId, inventory]);

  async function updateInventory() {
    await fetch(`http://localhost:4000/api/owner/${shopId}/inventory`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ inventory }),
    });
    alert("Inventory updated");
  }

  async function act(id, action) {
    const res = await fetch(
      `http://localhost:4000/api/owner/orders/${id}/action`,
      {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ action }),
      }
    );
    const data = await res.json();

    if (data.moved) alert("Order sent to next shop");
    else alert("Order " + action);

    setOrders((o) => o.filter((x) => x.id !== id));
  }

  return (
    <div className="container">
      <button className="back-btn" onClick={onBack}>← Back</button>

      <h2 className="gradient-text">Owner Dashboard</h2>

      <select
        value={shopId}
        onChange={(e) => {
          const id = Number(e.target.value);
          setShopId(id);
          const shop = shops.find((s) => s.id === id);
          setInventory(shop.inventory);
        }}
      >
        {shops.map((s) => (
          <option key={s.id} value={s.id}>
            {s.name}
          </option>
        ))}
      </select>

      <h3>Inventory</h3>
      {inventory.map((i, idx) => (
        <div className="inv-row" key={idx}>
          <span>Product {i.productId}</span>
          <input
            type="number"
            value={i.qty}
            onChange={(e) => {
              const updated = [...inventory];
              updated[idx].qty = Number(e.target.value);
              setInventory(updated);
            }}
          />
        </div>
      ))}

      <button className="grad-btn" onClick={updateInventory}>
        Update Inventory
      </button>

      <h3>Incoming Orders</h3>

      {orders.map((o) => (
        <div className="order-card" key={o.id}>
          <p>Order #{o.id}</p>
          {o.items.map((i) => (
            <p key={i.id}>
              Product {i.id} × {i.qty}
            </p>
          ))}

          <button className="green-btn" onClick={() => act(o.id, "accept")}>
            Accept
          </button>
          <button className="red-btn" onClick={() => act(o.id, "decline")}>
            Decline
          </button>
        </div>
      ))}
    </div>
  );
}

export default OwnerDashboard;
