import React, { useState, useEffect } from "react";
import "./Customer.css";

export default function Customer() {
  const [customers, setCustomers] = useState([]);
  const [products, setProducts] = useState([]);

  const [newCustomer, setNewCustomer] = useState({
    id: "",
    name: "",
    email: "",
    product: "",
    purchaseDate: new Date().toISOString().split("T")[0],
    amount: "",
    paymentMethod: "",
    quantity: 1,
  });

  const [searchTerm, setSearchTerm] = useState("");

  // Fetch customers
  useEffect(() => {
    fetch("http://localhost:5000/api/customers")
      .then(res => res.json())
      .then(data => setCustomers(data))
      .catch(err => console.error(err));
  }, []);

  // Fetch products
  useEffect(() => {
    fetch("http://localhost:5000/api/products")
      .then(res => res.json())
      .then(data => setProducts(data))
      .catch(err => console.error(err));
  }, []);

  // Add record
  const handleAddCustomer = async (e) => {
    e.preventDefault();

    const customer = {
      ...newCustomer,
      id: parseInt(newCustomer.id),
      quantity: parseInt(newCustomer.quantity),
      amount: parseFloat(newCustomer.amount),
    };

    const response = await fetch(
      "http://localhost:5000/api/customers",
      {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(customer),
      }
    );

    const saved = await response.json();
    setCustomers([...customers, saved]);

    setNewCustomer({
      id: "",
      name: "",
      email: "",
      product: "",
      purchaseDate: new Date().toISOString().split("T")[0],
      amount: "",
      paymentMethod: "",
      quantity: 1,
    });
  };

  // Delete
  const handleDelete = async (id) => {
    await fetch(`http://localhost:5000/api/customers/${id}`, {
      method: "DELETE",
    });

    setCustomers(customers.filter(c => c.id !== id));
  };

  // Select product
  const handleProductSelect = (product) => {
    setNewCustomer({
      ...newCustomer,
      product: product.name,
      amount: product.price * newCustomer.quantity,
    });
  };

  // Quantity change
  const handleQuantityChange = (qty) => {
    const quantity = parseInt(qty);

    const selected = products.find(
      p => p.name === newCustomer.product
    );

    if (selected) {
      setNewCustomer({
        ...newCustomer,
        quantity,
        amount: selected.price * quantity,
      });
    } else {
      setNewCustomer({
        ...newCustomer,
        quantity,
      });
    }
  };

  const filteredCustomers = customers.filter(c =>
    c.name.toLowerCase().includes(searchTerm.toLowerCase())
  );

  return (
    <div className="customer-management-wrapper">
      <div className="customer-management-container">

        {/* HEADER */}
        <div className="customer-header">
          <h1>Customer Purchase Records</h1>

          <div className="search-bar">
            <input
              type="text"
              placeholder="Search customers..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
            />
          </div>
        </div>

        {/* FORM */}
        <form onSubmit={handleAddCustomer} className="add-form">
          <h3>Add New Purchase Record</h3>

          <div className="form-grid">

            <input
              type="number"
              placeholder="ID"
              value={newCustomer.id}
              onChange={(e) =>
                setNewCustomer({ ...newCustomer, id: e.target.value })
              }
              required
            />

            <input
              type="text"
              placeholder="Customer Name"
              value={newCustomer.name}
              onChange={(e) =>
                setNewCustomer({ ...newCustomer, name: e.target.value })
              }
              required
            />

            <input
              type="email"
              placeholder="Email Address"
              value={newCustomer.email}
              onChange={(e) =>
                setNewCustomer({ ...newCustomer, email: e.target.value })
              }
              required
            />

            {/* PRODUCT SELECT */}
            <div className="inventory-products">
              <div className="selected-product">
                {newCustomer.product || "Choose scent from inventory"}
              </div>

              <div className="inventory-dropdown">
                {products.map((product) => (
                  <div
                    key={product.id}
                    className="inventory-item"
                    onClick={() => handleProductSelect(product)}
                  >
                    <b>{product.name}</b>
                    <small>
                      ₹{product.price} | Stock: {product.stock}
                    </small>
                  </div>
                ))}
              </div>
            </div>

            <input
              type="number"
              placeholder="Quantity"
              min="1"
              value={newCustomer.quantity}
              onChange={(e) =>
                handleQuantityChange(e.target.value)
              }
              required
            />

            <input
              type="number"
              placeholder="Amount (₹)"
              value={newCustomer.amount}
              readOnly
            />

            <select
              value={newCustomer.paymentMethod}
              onChange={(e) =>
                setNewCustomer({
                  ...newCustomer,
                  paymentMethod: e.target.value,
                })
              }
              required
            >
              <option value="">Payment Method</option>
              <option>Cash</option>
              <option>UPI</option>
              <option>Card</option>
            </select>

            <input
              type="date"
              value={newCustomer.purchaseDate}
              onChange={(e) =>
                setNewCustomer({
                  ...newCustomer,
                  purchaseDate: e.target.value,
                })
              }
              required
            />

            <button type="submit" className="add-btn">
              Add Record
            </button>

          </div>
        </form>

        {/* TABLE */}
        <div className="customers-table-container">
          <table className="customers-table">
            <thead>
              <tr>
                <th>ID</th>
                <th>Name</th>
                <th>Email</th>
                <th>Product</th>
                <th>Qty</th>
                <th>Amount</th>
                <th>Date</th>
                <th>Payment</th>
                <th>Action</th>
              </tr>
            </thead>

            <tbody>
              {filteredCustomers.map((c) => (
                <tr key={c.id}>
                  <td>{c.id}</td>
                  <td>{c.name}</td>
                  <td>{c.email}</td>
                  <td>{c.product}</td>
                  <td>{c.quantity}</td>
                  <td>₹{c.amount}</td>
                  <td>{c.purchaseDate}</td>
                  <td>{c.paymentMethod}</td>
                  <td>
                    <button
                      className="delete-btn"
                      onClick={() => handleDelete(c.id)}
                    >
                      Delete
                    </button>
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