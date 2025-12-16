import React, { useEffect, useState } from "react";

function Products({ onBack }) {
  const [products, setProducts] = useState([]);
  const [cart, setCart] = useState({});
  const [orderInfo, setOrderInfo] = useState(null);

  useEffect(() => {
    fetch("${process.env.REACT_APP_API_URL}/api/products")
      .then((r) => r.json())
      .then((d) => setProducts(d.products));
  }, []);

  function add(p) {
    setCart({
      ...cart,
      [p.id]: (cart[p.id] || 0) + 1,
    });
  }

  async function placeOrder() {
    const items = Object.keys(cart).map((id) => ({
      id: Number(id),
      qty: cart[id],
    }));

    const res = await fetch("${process.env.REACT_APP_API_URL}/api/orders", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ items, address: "User Address" }),
    });

    const data = await res.json();
    setOrderInfo(data);
    alert("Order Placed!");
  }

  return (
    <div className="container">
      <button className="back-btn" onClick={onBack}>← Back</button>

      <h2 className="gradient-text">Groceries</h2>

      <div className="product-list">
        {products.map((p) => (
          <div className="prod-card" key={p.id}>
            <div className="card-header"></div>
            <img src={p.image} alt="" className="prod-img" />

            <h3>{p.name}</h3>
            <p>{p.label}</p>
            <p className="price">{p.price}</p>

            <button className="grad-btn-small" onClick={() => add(p)}>
              Add
            </button>
          </div>
        ))}
      </div>

      <button className="grad-btn wide" onClick={placeOrder}>
        Place Order
      </button>

      {orderInfo && (
        <div className="status-box">
          Order #{orderInfo.orderId} sent to Shop {orderInfo.shopId}
        </div>
      )}
    </div>
  );
}

export default Products;

