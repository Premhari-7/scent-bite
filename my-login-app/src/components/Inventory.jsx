import React, { useState, useEffect } from "react";
import axios from "axios";
import "./Inventory.css";

const Inventory = () => {
  const [searchTerm, setSearchTerm] = useState("");
  const [products, setProducts] = useState([]);
  const [showAddForm, setShowAddForm] = useState(false);
  const [newProduct, setNewProduct] = useState({
    name: "",
    price: "",
    stock: "",
    image: null,
    imagePreview: "",
  });
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState("");

  // ✅ Fetch products from backend
  useEffect(() => {
    fetchProducts();
  }, []);

  const fetchProducts = async () => {
    try {
      const res = await axios.get("http://localhost:5000/api/products");
      setProducts(res.data);
    } catch (err) {
      console.error("Error fetching products:", err);
      // For demo purposes, let's create some sample data
      setProducts([
        { _id: "1", id: 1, name: "Fogg", price: 1500, stock: 5, image: "" },
        { _id: "2", id: 2, name: "Axe", price: 1200, stock: 8, image: "" },
        { _id: "3", id: 3, name: "Denver", price: 900, stock: 3, image: "" },
      ]);
    }
  };

  const getStockStatus = (stock) => {
    if (stock === 0) return "out-of-stock";
    if (stock <= 5) return "low-stock";
    return "in-stock";
  };

  const filteredProducts = products.filter((p) =>
    p.name?.toLowerCase().includes(searchTerm.toLowerCase())
  );

  // ✅ Generate next available ID
  const getNextAvailableId = () => {
    if (products.length === 0) return 1;

    const existingIds = products
      .map((p) => p.id)
      .filter((id) => id !== undefined && id !== null);

    if (existingIds.length === 0) return 1;

    const maxId = Math.max(...existingIds);
    return maxId + 1;
  };

  // ✅ Handle image upload
const handleImageUpload = (e) => {
  const file = e.target.files[0];
  if (file) {
    const reader = new FileReader();
    reader.onloadend = () => {
      setNewProduct({
        ...newProduct,
        image: reader.result,      // ✅ save base64 string
        imagePreview: reader.result,
      });
    };
    reader.readAsDataURL(file); // converts to base64 string
  }
};


  // ✅ Update stock in backend
  const handleStockUpdate = async (id, newStock) => {
    const safe = Math.max(0, parseInt(newStock, 10) || 0);
    try {
      const product = products.find((p) => p._id === id);
      const res = await axios.put(`http://localhost:5000/api/products/${id}`, {
        stockToAdd: safe - product.stock,
      });
      setProducts((prev) => prev.map((p) => (p._id === id ? res.data : p)));
    } catch (err) {
      console.error("Error updating stock:", err);
      // For demo, update locally
      setProducts((prev) =>
        prev.map((p) => (p._id === id ? { ...p, stock: safe } : p))
      );
    }
  };

  // ✅ Add new product
  const handleAddProduct = async (e) => {
    e.preventDefault();
    setLoading(true);
    setMessage("");

    try {
      const formData = new FormData();
      formData.append("name", newProduct.name);
      formData.append("price", newProduct.price);
      formData.append("stock", newProduct.stock);
      formData.append("description", newProduct.description || "");
      formData.append("category", newProduct.category || "");
      formData.append("gender", newProduct.gender || "");

if (newProduct.imagePreview) {
  formData.append("image", newProduct.imagePreview); // send Base64 string
}

      const res = await axios.post(
  "http://localhost:5000/api/products",
  {
    name: newProduct.name,
    price: Number(newProduct.price),
    stock: Number(newProduct.stock),
    image: newProduct.imagePreview, // base64 string
    description: newProduct.description || "",
    category: newProduct.category || "",
    gender: newProduct.gender || "",
  }
);

      setProducts([...products, res.data]);
      setNewProduct({
        name: "",
        price: "",
        stock: "",
        image: null,
        imagePreview: "",
      });
      setShowAddForm(false);
      setMessage("Product added successfully!");
    } catch (err) {
      console.error("Error adding product:", err);
      setMessage("Error adding product. Please try again.");
    } finally {
      setLoading(false);
      setTimeout(() => setMessage(""), 3000);
    }
  };

  // ✅ Delete product
  const handleDeleteProduct = async (id) => {
    if (window.confirm("Are you sure you want to delete this product?")) {
      try {
        await axios.delete(`http://localhost:5000/api/products/${id}`);
        setProducts(products.filter((p) => p._id !== id));
        setMessage("Product deleted successfully!");
        setTimeout(() => setMessage(""), 3000);
      } catch (err) {
        console.error("Error deleting product:", err);
        // For demo, delete locally
        setProducts(products.filter((p) => p._id !== id));
        setMessage("Product deleted successfully!");
        setTimeout(() => setMessage(""), 3000);
      }
    }
  };

  return (
    <div className="inventory-container">
      <h1>SCENT BITE - Inventory</h1>

      {message && (
        <div
          className={`message ${
            message.includes("Error") ? "error" : "success"
          }`}
        >
          {message}
        </div>
      )}

      {/* Search and Add Button */}
      <div className="inventory-controls">
        <div className="search-section">
          <input
            type="text"
            placeholder="Search products..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="inventory-search-bar"
          />
        </div>
        <button
          className="add-product-btn"
          onClick={() => setShowAddForm(!showAddForm)}
          disabled={loading}
        >
          {loading ? "Adding..." : showAddForm ? "Cancel" : "Add New Product"}
        </button>
      </div>

      {/* Add New Product Form */}
      {showAddForm && (
        <div className="add-product-form">
          <h3>Add New Product</h3>
          <form onSubmit={handleAddProduct}>
            <div className="form-row">
              <div className="form-group">
                <label>Name *</label>
                <input
                  type="text"
                  placeholder="Product Name"
                  value={newProduct.name}
                  onChange={(e) =>
                    setNewProduct({ ...newProduct, name: e.target.value })
                  }
                  required
                  disabled={loading}
                />
              </div>
              <div className="form-group">
                <label>Description *</label>
                <input
                  type="text"
                  placeholder="Description"
                  value={newProduct.description}
                  onChange={(e) =>
                    setNewProduct({
                      ...newProduct,
                      description: e.target.value,
                    })
                  }
                />
              </div>
              <div className="form-group">
                <label>Price (₹) *</label>
                <input
                  type="number"
                  placeholder="Price"
                  min="0"
                  step="0.01"
                  value={newProduct.price}
                  onChange={(e) =>
                    setNewProduct({ ...newProduct, price: e.target.value })
                  }
                  required
                  disabled={loading}
                />
              </div>
              <div className="form-group">
                <label>Category *</label>
                <select
                  value={newProduct.category}
                  onChange={(e) =>
                    setNewProduct({ ...newProduct, category: e.target.value })
                  }
                >
                  <option value="">Select Category</option>
                  <option value="Perfume">Perfume</option>
                  <option value="Deodorant">Deodorant</option>
                </select>
              </div>
              <div className="form-group">
                <label>Gender *</label>
                <select
                  value={newProduct.gender}
                  onChange={(e) =>
                    setNewProduct({ ...newProduct, gender: e.target.value })
                  }
                >
                  <option value="">Select Gender</option>
                  <option value="Men">Men</option>
                  <option value="Women">Women</option>
                  <option value="Unisex">Unisex</option>
                </select>
              </div>
              <div className="form-group">
                <label>Stock *</label>
                <input
                  type="number"
                  placeholder="Stock Quantity"
                  min="0"
                  value={newProduct.stock}
                  onChange={(e) =>
                    setNewProduct({ ...newProduct, stock: e.target.value })
                  }
                  required
                  disabled={loading}
                />
              </div>
              <div className="form-group">
                <label>Product Image</label>
                <input
                  type="file"
                  accept="image/*"
                  onChange={(e) => {
                    const file = e.target.files[0];
                    if (file) {
                      const reader = new FileReader();
                      reader.onloadend = () => {
                        setNewProduct({
                          ...newProduct,
                          image: file,
                          imagePreview: reader.result,
                        });
                      };
                      reader.readAsDataURL(file);
                    }
                  }}
                />
                {newProduct.imagePreview && (
                  <div className="image-preview">
                    <img src={newProduct.imagePreview} alt="Preview" />
                  </div>
                )}
              </div>
            </div>
            <div className="form-footer">
              <p className="form-note">
                ID will be automatically assigned: {getNextAvailableId()}
              </p>
              <button
                type="submit"
                className="submit-product-btn"
                disabled={loading}
              >
                {loading ? "Adding Product..." : "Add Product"}
              </button>
            </div>
          </form>
        </div>
      )}

      {/* Inventory Table */}
      <div className="inventory-table">
        <table>
          <thead>
            <tr>
              <th>ID</th>
              <th>Image</th>
              <th>Name</th>
              <th>Price (₹)</th>
              <th>Stock</th>
              <th>Status</th>
              <th>Update Stock</th>
              <th>Action</th>
            </tr>
          </thead>
          <tbody>
            {filteredProducts.map((product) => (
              <tr key={product._id} className={getStockStatus(product.stock)}>
                <td className="product-id">{product.productId || "N/A"}</td>
                <td className="product-image-cell">
                  <img
                    src={product.image || "https://via.placeholder.com/150"}
                    alt={product.name}
                    className="product-image"
                  />
                </td>
                <td className="product-name">{product.name}</td>
                <td className="product-price">
                  ₹{product.price?.toLocaleString("en-IN")}
                </td>
                <td className="product-stock">{product.stock}</td>
                <td>
                  <span
                    className={`status-badge ${getStockStatus(product.stock)}`}
                  >
                    {getStockStatus(product.stock).replace("-", " ")}
                  </span>
                </td>
                <td>
                  <div className="stock-control">
                    <input
                      type="number"
                      value={product.stock}
                      onChange={(e) =>
                        handleStockUpdate(product._id, e.target.value)
                      }
                      min="0"
                    />
                    <button
                      onClick={() =>
                        handleStockUpdate(product._id, product.stock + 1)
                      }
                      className="stock-btn"
                    >
                      +
                    </button>
                    <button
                      onClick={() =>
                        handleStockUpdate(
                          product._id,
                          Math.max(0, product.stock - 1)
                        )
                      }
                      className="stock-btn"
                    >
                      -
                    </button>
                  </div>
                </td>
                <td>
                  <button
                    onClick={() => handleDeleteProduct(product._id)}
                    className="delete-product-btn"
                    title="Delete Product"
                  >
                    🗑️
                  </button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {/* Summary Stats */}
      <div className="inventory-summary">
        <div className="summary-card in-stock">
          <h3>In Stock</h3>
          <p>
            {
              products.filter((p) => getStockStatus(p.stock) === "in-stock")
                .length
            }
          </p>
        </div>
        <div className="summary-card low-stock">
          <h3>Low Stock</h3>
          <p>
            {
              products.filter((p) => getStockStatus(p.stock) === "low-stock")
                .length
            }
          </p>
        </div>
        <div className="summary-card out-of-stock">
          <h3>Out of Stock</h3>
          <p>
            {
              products.filter((p) => getStockStatus(p.stock) === "out-of-stock")
                .length
            }
          </p>
        </div>
        <div className="summary-card total-products">
          <h3>Total Products</h3>
          <p>{products.length}</p>
        </div>
      </div>
    </div>
  );
};

export default Inventory;
