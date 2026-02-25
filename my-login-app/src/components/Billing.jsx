import React, { useState, useEffect } from "react";
import "./Billing.css";

const BillingPage = () => {
  const [searchTerm, setSearchTerm] = useState("");
  const [products, setProducts] = useState([]);
  const [inventory, setInventory] = useState([]);
  const [paymentMethod, setPaymentMethod] = useState("cash");
  const [customerInfo, setCustomerInfo] = useState({
    name: "",
    phone: "",
    email: "",
  });
  const [popup, setPopup] = useState({ show: false, message: "", type: "" });
  const [billerName, setBillerName] = useState("");

  // ✅ Load logged-in user (biller) from localStorage/session
  useEffect(() => {
    const storedUser = localStorage.getItem("user");
    if (storedUser) {
      const user = JSON.parse(storedUser);
      setBillerName(user.fullName || user.email);
    }
  }, []);

  // Fetch product data
  useEffect(() => {
    const fetchProducts = async () => {
      try {
        const response = await fetch("http://localhost:5000/api/products");
        const data = await response.json();
        const mappedData = data.map((product) => ({
          id: product.productId,
          name: product.name,
          price: product.price,
          stock: product.stock,
          image: product.image,
          description: product.description,
        }));
        setProducts(mappedData);
      } catch (err) {
        console.error("Error fetching products:", err);
      }
    };

    fetchProducts();
  }, []);

  const filteredProducts = products
    .filter((product) =>
      product.name.toLowerCase().includes(searchTerm.toLowerCase())
    )
    .filter((product) => product.stock > 0);

  const addToInventory = (product) => {
    const existingItem = inventory.find((item) => item.id === product.id);
    if (existingItem) {
      if (existingItem.quantity < product.stock) {
        setInventory(
          inventory.map((item) =>
            item.id === product.id
              ? { ...item, quantity: item.quantity + 1 }
              : item
          )
        );
      }
    } else {
      setInventory([...inventory, { ...product, quantity: 1 }]);
    }
  };

  const removeFromInventory = (productId) => {
    setInventory(inventory.filter((item) => item.id !== productId));
  };

  const updateQuantity = (productId, newQuantity) => {
    if (newQuantity < 1) return;
    const product = products.find((p) => p.id === productId);
    if (newQuantity > product.stock) return;

    setInventory(
      inventory.map((item) =>
        item.id === productId
          ? { ...item, quantity: parseInt(newQuantity) }
          : item
      )
    );
  };

  const calculateTotal = () => {
    return inventory.reduce(
      (total, item) => total + item.price * item.quantity,
      0
    );
  };

  const handleCheckout = async () => {
    if (inventory.length === 0) {
      setPopup({
        show: true,
        message: "Please add items before checkout",
        type: "error",
      });
      return;
    }

    if (!billerName) {
      setPopup({
        show: true,
        message: "No biller logged in!",
        type: "error",
      });
      return;
    }

    const orderData = {
      customerName: customerInfo.name,
      email: customerInfo.email,
      phoneNo: customerInfo.phone,
      order: inventory.map((i) => ({
        productId: i.id,
        productName: i.name,
        purchaseQty: i.quantity,
        price: i.price,
      })),
      totalAmount: calculateTotal(),
      paymentMethod,
      billerName, // ✅ dynamic from logged-in user
      createdAt: new Date().toISOString(),
    };

    try {
      const response = await fetch("http://localhost:5000/api/orders", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(orderData),
      });

      if (response.ok) {
        const result = await response.json();
        setPopup({
          show: true,
          message: `Order placed successfully! Total: ₹${calculateTotal()}`,
          type: "success",
        });
        console.log("Saved order:", result);

        const updatedProducts = products.map((p) => {
          const orderedItem = inventory.find((i) => i.id === p.id);
          if (orderedItem) {
            return { ...p, stock: p.stock - orderedItem.quantity };
          }
          return p;
        });
        setProducts(updatedProducts);

        setInventory([]);
        setCustomerInfo({ name: "", phone: "", email: "" });
      } else {
        setPopup({
          show: true,
          message: "Failed to save order",
          type: "error",
        });
      }
    } catch (error) {
      console.error("Error saving order:", error);
      setPopup({ show: true, message: "Error placing order", type: "error" });
    }
  };

  // ✅ Popup Component
  const Popup = ({ show, message, type, onClose }) => {
    if (!show) return null;
    return (
      <div className={`popup-overlay ${type}`}>
        <div className="popup-box">
          <p>{message}</p>
          <button onClick={onClose}>OK</button>
        </div>
      </div>
    );
  };

  return (
    <div className="billing-container">
      <h1>Billing </h1>
      {billerName && <h3>Logged in as: {billerName}</h3>}

      {/* Search Bar */}
      <div className="search-section">
        <input
          type="text"
          placeholder="Search scents..."
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
          className="billing-search-bar"
        />
      </div>

      <div className="billing-content">
        {/* Product List */}
        <div className="product-list">
          <h2>Available Scents</h2>
          <div className="products-grid">
            {filteredProducts.map((product) => (
              <div key={product.id} className="product-card">
                <h3>{product.name}</h3>
                <p>Price: ₹{product.price}</p>
                <p>Stock: {product.stock}</p>
                <button
                  onClick={() => addToInventory(product)}
                  disabled={product.stock === 0}
                >
                  Add to Bill
                </button>
              </div>
            ))}
          </div>
        </div>

        {/* Inventory and Customer Info */}
        <div className="inventory-section">
          <div className="inventory-items">
            <h2>BILLING DETAILS</h2>
            {inventory.length === 0 ? (
              <p></p>
            ) : (
              <ul>
                {inventory.map((item) => (
                  <li key={item.id} className="inventory-item">
                    <div className="item-info">
                      <span>{item.name}</span>
                      <span>₹{item.price} x </span>
                    </div>
                    <div className="item-controls">
                      <input
                        type="number"
                        min="1"
                        max={item.stock}
                        value={item.quantity}
                        onChange={(e) =>
                          updateQuantity(item.id, e.target.value)
                        }
                        className="quantity-input"
                      />
                      <button
                        onClick={() => removeFromInventory(item.id)}
                        className="remove-btn"
                      >
                        Remove
                      </button>
                    </div>
                    <div className="item-total">
                      ₹{item.price * item.quantity}
                    </div>
                  </li>
                ))}
              </ul>
            )}
            <div className="inventory-total">
              <h3>Total: ₹{calculateTotal()}</h3>
            </div>
          </div>

          {/* Customer Information */}
          <div className="customer-info">
            <h2>Customer Details</h2>
            <div className="form-group">
              <label>Name:</label>
              <input
                type="text"
                value={customerInfo.name}
                onChange={(e) =>
                  setCustomerInfo({ ...customerInfo, name: e.target.value })
                }
                placeholder="Customer name"
              />
            </div>
            <div className="form-group">
              <label>Phone:</label>
              <input
                type="text"
                value={customerInfo.phone}
                onChange={(e) =>
                  setCustomerInfo({ ...customerInfo, phone: e.target.value })
                }
                placeholder="Phone number"
              />
            </div>
            <div className="form-group">
              <label>Email:</label>
              <input
                type="email"
                value={customerInfo.email}
                onChange={(e) =>
                  setCustomerInfo({ ...customerInfo, email: e.target.value })
                }
                placeholder="Email address"
              />
            </div>
          </div>

          {/* Payment Method */}
          <div className="payment-method">
            <h2>Payment Method</h2>
            <div className="payment-options">
              <label>
                <input
                  type="radio"
                  value="cash"
                  checked={paymentMethod === "cash"}
                  onChange={() => setPaymentMethod("cash")}
                />
                Cash
              </label>
              <label>
                <input
                  type="radio"
                  value="card"
                  checked={paymentMethod === "card"}
                  onChange={() => setPaymentMethod("card")}
                />
                Credit/Debit Card
              </label>
              <label>
                <input
                  type="radio"
                  value="upi"
                  checked={paymentMethod === "upi"}
                  onChange={() => setPaymentMethod("upi")}
                />
                UPI
              </label>
            </div>
          </div>

          <button
            onClick={handleCheckout}
            className="checkout-btn"
            disabled={inventory.length === 0}
          >
            Complete Purchase
          </button>
        </div>
      </div>

      {/* ✅ Custom Popup */}
      <Popup
        show={popup.show}
        message={popup.message}
        type={popup.type}
        onClose={() => setPopup({ show: false, message: "", type: "" })}
      />
    </div>
  );
};

export default BillingPage;
