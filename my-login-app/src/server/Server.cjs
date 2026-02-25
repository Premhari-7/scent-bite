const express = require('express');
const mongoose = require('mongoose');
const bodyParser = require('body-parser');
const cors = require('cors');
const bcrypt = require('bcryptjs');

const app = express();
const PORT = 5000;

app.use(cors());
app.use(bodyParser.json());

// MongoDB connection
mongoose.connect('mongodb://localhost:27017/UserDB', {
    useNewUrlParser: true,
    useUnifiedTopology: true
  }).then(() => console.log('MongoDB connected'))
  .catch(err => console.error('MongoDB connection error:', err));

// Schema
const employeeSchema = new mongoose.Schema({
  employeeId: {
    type: String,
    required: true,
    unique: true
  },
  fullName: {
    type: String,
    required: true
  },
  dob: {
    type: String,
    default: ''
  },
  phone: {
    type: String,
    default: ''
  },
  email: {
    type: String,
    required: true,
    unique: true
  },
  password: {
    type: String,
    required: true
  },
  role: {
    type: String,
    default: 'employee'
  },
  salary: {
    type: Number,
    default: 0
  },
  dateOfJoining: {
    type: String,
    default: ''
  }
});

const Employee = mongoose.model('Employee', employeeSchema, 'Employees');

// Auto-generate employeeId
const generateEmployeeId = async () => {
  const lastEmployee = await Employee.findOne().sort({
    employeeId: -1
  });
  if (!lastEmployee || !lastEmployee.employeeId) return 'EMP001';
  const lastNumber = parseInt(lastEmployee.employeeId.replace('EMP', ''));
  const newNumber = lastNumber + 1;
  return 'EMP' + String(newNumber).padStart(3, '0');
};

// Update employee details
app.put("/api/employees/:id", async (req, res) => {
  try {
const { fullName, email, dob, phone } = req.body;

const updatedEmployee = await Employee.findByIdAndUpdate(
  req.params.id,
  { fullName, email, dob, phone },
  { new: true }
);

    if (!updatedEmployee) {
      return res.status(404).json({
        message: "Employee not found"
      });
    }

    res.json({
      message: "Employee updated successfully",
      user: updatedEmployee,
    });
  } catch (err) {
    console.error("Error updating employee:", err);
    res.status(500).json({
      message: "Error updating employee",
      error: err.message
    });
  }
});

// Register
app.post('/api/register', async (req, res) => {
  try {
    const {
      fullName,
      email,
      password
    } = req.body;

    if (!fullName || !email || !password) {
      return res.status(400).json({
        message: 'Full Name, Email and Password are required.'
      });
    }

    const existingUser = await Employee.findOne({
      email
    });
    if (existingUser) {
      return res.status(400).json({
        message: 'Email already exists.'
      });
    }

    const hashedPassword = await bcrypt.hash(password, 10);
    const employeeId = await generateEmployeeId();

    const newEmployee = new Employee({
      employeeId,
      fullName,
      email,
      password: hashedPassword,
      salary: req.body.salary || 0,
      dateOfJoining: req.body.dateOfJoining || ''
    });

    await newEmployee.save();

    res.status(201).json({
      message: `Registered successfully as ${fullName}`,
      employeeId
    });
  } catch (err) {
    console.error('Registration error:', err);
    res.status(500).json({
      message: 'Internal server error'
    });
  }
});

// Login
app.post('/api/login', async (req, res) => {
  const {
    email,
    password
  } = req.body;

  try {
    const user = await Employee.findOne({
      email
    });
    if (!user) {
      return res.status(404).json({
        message: 'No user found with this email.'
      });
    }

    const isMatch = await bcrypt.compare(password, user.password);
    if (!isMatch) {
      return res.status(401).json({
        message: 'Incorrect password.'
      });
    }

    res.status(200).json({
      message: `Welcome ${user.fullName}`,
      user: {
        _id: user._id,
        fullName: user.fullName,
        email: user.email,
        role: user.role,
        salary: user.salary,
        employeeId: user.employeeId,
        dateOfJoining: user.dateOfJoining,
        dob: user.dob,
        phone: user.phone,
      },
    });

  } catch (err) {
    console.error('Login error:', err);
    res.status(500).json({
      message: 'Server error'
    });
  }
});

// Product Schema
const productSchema = new mongoose.Schema({
  productId: {
    type: String,
    required: true,
    unique: true
  },
  name: String,
  price: Number,
  image: String,
  description: String,
  category: String,
  gender: String,
  stock: Number
});

const Product = mongoose.model("Product", productSchema, "Products");

// ✅ Get all products
app.get("/api/products", async (req, res) => {
  try {
    const products = await Product.find();
    res.json(products);
  } catch (err) {
    res.status(500).json({
      message: "Error fetching products"
    });
  }
});

// PUT /api/products/:id
app.put("/api/products/:id", async (req, res) => {
  try {
    const {
      stockToAdd
    } = req.body;
    const product = await Product.findByIdAndUpdate(
      req.params.id, {
        $inc: {
          stock: stockToAdd
        }
      }, // increment stock
      {
        new: true
      }
    );
    res.json(product);
  } catch (err) {
    res.status(500).json({
      error: err.message
    });
  }
});

// POST /api/products
app.post("/api/products", async (req, res) => {
  try {
    const {
      name,
      price,
      stock,
      image,
      description,
      category,
      gender
    } = req.body;

    // Find last product with a valid productId
    const lastProduct = await Product.findOne({
        productId: {
          $regex: /^PROD\d+$/
        }
      })
      .sort({
        productId: -1
      });

    let nextId = 1;
    if (lastProduct) {
      const lastNum = parseInt(lastProduct.productId.replace("PROD", ""), 10);
      nextId = lastNum + 1;
    }

    const newProduct = new Product({
      productId: `PROD${String(nextId).padStart(3, "0")}`,
      name,
      price,
      stock,
      image,
      description,
      category,
      gender
    });

    await newProduct.save();
    res.status(201).json(newProduct);
  } catch (err) {
    res.status(500).json({
      error: err.message
    });
  }
});

// Delete product by ID
app.delete("/api/products/:id", async (req, res) => {
  try {
    const deletedProduct = await Product.findByIdAndDelete(req.params.id);

    if (!deletedProduct) {
      return res.status(404).json({
        message: "Product not found"
      });
    }

    res.json({
      message: "Product deleted successfully",
      deletedProduct
    });
  } catch (err) {
    console.error("Error deleting product:", err);
    res.status(500).json({
      message: "Error deleting product",
      error: err.message
    });
  }
});

// Order Schema
const orderSchema = new mongoose.Schema({
  customerName: String,
  email: String,
  phoneNo: String,
  order: [{
    productId: {
      type: String,
      required: true
    },
    productName: String,
    purchaseQty: Number,
    price: Number
  }],
  totalAmount: Number,
  paymentMethod: String,
  billerName: String,
  createdAt: {
    type: Date,
    default: Date.now
  }
});

const Order = mongoose.model("Order", orderSchema, "Billing Orders");

// Save new order + update product stock
app.post("/api/orders", async (req, res) => {
  try {
    const {
      order,
      totalAmount,
      paymentMethod,
      customerName,
      email,
      phoneNo,
      billerName
    } = req.body;

    const newOrder = new Order({
      customerName,
      email,
      phoneNo,
      order,
      totalAmount,
      paymentMethod,
      billerName
    });

    await newOrder.save();

    // reduce stock
    for (let item of order) {
      await Product.findOneAndUpdate({
          productId: item.productId
        }, // ✅ find by custom productId
        {
          $inc: {
            stock: -item.purchaseQty
          }
        }
      );
    }

    res.status(201).json({
      message: "Order saved successfully",
      order: newOrder
    });
  } catch (err) {
    console.error("Order saving error:", err.message);
    res.status(500).json({
      message: "Failed to save order",
      error: err.message
    });
  }
});


// Get all orders
app.get("/api/orders", async (req, res) => {
  try {
    const orders = await Order.find().sort({
      createdAt: -1
    });
    res.json(orders);
  } catch (err) {
    res.status(500).json({
      message: "Error fetching orders"
    });
  }
});

app.get("/api/employees", async (req, res) => {
  try {
    const employees = await Employee.find();
    res.json(employees);
  } catch (err) {
    res.status(500).json({
      message: "Error fetching employees"
    });
  }
});

app.delete("/api/employees/:id", async (req, res) => {
  try {
    await Employee.findByIdAndDelete(req.params.id);
    res.json({
      message: "Employee deleted successfully"
    });
  } catch (err) {
    res.status(500).json({
      message: "Error deleting employee"
    });
  }
});

// Customer Schema
const customerSchema = new mongoose.Schema({
  id: Number,
  name: String,
  email: String,
  product: String,
  purchaseDate: String, // or Date
  amount: Number,
  paymentMethod: String,
  quantity: Number
});

const Customer = mongoose.model('Customer', customerSchema, 'Customers');

// ➡️ Get all customers
app.get('/api/customers', async (req, res) => {
  try {
    const customers = await Customer.find();
    res.json(customers);
  } catch (err) {
    res.status(500).json({
      message: 'Error fetching customers',
      error: err.message
    });
  }
});

// ➡️ Add new customer
app.post('/api/customers', async (req, res) => {
  try {
    const newCustomer = new Customer(req.body); // Create a new document from request body
    await newCustomer.save(); // Save it to MongoDB
    res.status(201).json(newCustomer); // Return the saved customer
  } catch (err) {
    res.status(500).json({
      message: 'Error adding customer',
      error: err.message
    });
  }
});

// ➡️ Delete a customer by ID
app.delete('/api/customers/:id', async (req, res) => {
  try {
    const id = req.params.id;
    const deletedCustomer = await Customer.findOneAndDelete({
      id: Number(id)
    });

    if (!deletedCustomer) {
      return res.status(404).json({
        message: 'Customer not found'
      });
    }

    res.json({
      message: 'Customer deleted successfully',
      deletedCustomer
    });
  } catch (err) {
    res.status(500).json({
      message: 'Error deleting customer',
      error: err.message
    });
  }
});

app.listen(PORT, () => {
  console.log(`Server running at http://localhost:${PORT}`);
});   