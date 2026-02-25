import React, { useState, useEffect } from "react";
import axios from "axios";
import "./Employee.css";

export default function Employee() {
  const [employees, setEmployees] = useState([]);
  const [newEmployee, setNewEmployee] = useState({
    fullName: "",
    salary: "",
    dateOfJoining: new Date().toISOString().split("T")[0],
    email: "",
    password: "",
  });
  const [searchTerm, setSearchTerm] = useState("");
  const [sortConfig, setSortConfig] = useState({
    key: null,
    direction: "ascending",
  });

  // ✅ Fetch employees from backend
  useEffect(() => {
    axios
      .get("http://localhost:5000/api/employees") // <-- create this GET route in backend
      .then((res) => setEmployees(res.data))
      .catch((err) => console.error("Error fetching employees:", err));
  }, []);

  // ✅ Add new employee via backend
  const handleAddEmployee = async (e) => {
    e.preventDefault();
    try {
      const res = await axios.post("http://localhost:5000/api/register", {
        fullName: newEmployee.fullName,
        email: newEmployee.email,
        password: newEmployee.password,
        salary: newEmployee.salary,
        dateOfJoining: newEmployee.dateOfJoining,
      });

      alert(res.data.message);
      setEmployees([...employees, res.data.employee]); // append new employee
      setNewEmployee({
        fullName: "",
        salary: "",
        dateOfJoining: new Date().toISOString().split("T")[0],
        email: "",
        password: "",
      });
    } catch (err) {
      console.error("Error adding employee:", err.response?.data || err);
      alert(err.response?.data?.message || "Failed to add employee");
    }
  };

  const handleDelete = async (id) => {
    try {
      await axios.delete(`http://localhost:5000/api/employees/${id}`);
      setEmployees(employees.filter((emp) => emp._id !== id));
    } catch (err) {
      console.error("Error deleting employee:", err);
    }
  };

  const handleSort = (key) => {
    let direction = "ascending";
    if (sortConfig.key === key && sortConfig.direction === "ascending") {
      direction = "descending";
    }
    setSortConfig({ key, direction });
  };

  const sortedEmployees = React.useMemo(() => {
    let sortableEmployees = [...employees];
    if (sortConfig.key !== null) {
      sortableEmployees.sort((a, b) => {
        if (a[sortConfig.key] < b[sortConfig.key]) {
          return sortConfig.direction === "ascending" ? -1 : 1;
        }
        if (a[sortConfig.key] > b[sortConfig.key]) {
          return sortConfig.direction === "ascending" ? 1 : -1;
        }
        return 0;
      });
    }
    return sortableEmployees;
  }, [employees, sortConfig]);

  const filteredEmployees = sortedEmployees.filter((employee) =>
    employee.fullName?.toLowerCase().includes(searchTerm.toLowerCase())
  );

  return (
    <div className="employee-management-wrapper">
      <div className="employee-management-container">
        <div className="employee-header">
          <h1>Employee Management</h1>
          <div className="search-bar">
            <input
              type="text"
              placeholder="Search employees by name..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
            />
          </div>
        </div>

        {/* Add Employee Form */}
        <form onSubmit={handleAddEmployee} className="add-form">
          <h3>Add New Employee</h3>
          <div className="form-row">
            <input
              type="text"
              placeholder="Full Name"
              value={newEmployee.fullName}
              onChange={(e) =>
                setNewEmployee({ ...newEmployee, fullName: e.target.value })
              }
              required
            />
            <input
              type="email"
              placeholder="Email"
              value={newEmployee.email}
              onChange={(e) =>
                setNewEmployee({ ...newEmployee, email: e.target.value })
              }
              required
            />
            <input
              type="password"
              placeholder="Password"
              value={newEmployee.password}
              onChange={(e) =>
                setNewEmployee({ ...newEmployee, password: e.target.value })
              }
              required
            />
            <input
              type="number"
              placeholder="Monthly Salary (₹)"
              min="0"
              step="100"
              value={newEmployee.salary}
              onChange={(e) =>
                setNewEmployee({ ...newEmployee, salary: e.target.value })
              }
              required
            />
            <input
              type="date"
              value={newEmployee.dateOfJoining}
              onChange={(e) =>
                setNewEmployee({
                  ...newEmployee,
                  dateOfJoining: e.target.value,
                })
              }
              required
            />
            <button type="submit" className="add-btn">
              Add Employee
            </button>
          </div>
        </form>

        {/* Employees Table */}
        <div className="employees-table-container">
          <table className="employees-table">
            <thead>
              <tr>
                <th onClick={() => handleSort("employeeId")}>
                  ID{" "}
                  {sortConfig.key === "employeeId" &&
                    (sortConfig.direction === "ascending" ? "↑" : "↓")}
                </th>
                <th onClick={() => handleSort("fullName")}>
                  Name{" "}
                  {sortConfig.key === "fullName" &&
                    (sortConfig.direction === "ascending" ? "↑" : "↓")}
                </th>
                <th onClick={() => handleSort("salary")}>
                  Salary (₹){" "}
                  {sortConfig.key === "salary" &&
                    (sortConfig.direction === "ascending" ? "↑" : "↓")}
                </th>
                <th onClick={() => handleSort("dateOfJoining")}>
                  Join Date{" "}
                  {sortConfig.key === "dateOfJoining" &&
                    (sortConfig.direction === "ascending" ? "↑" : "↓")}
                </th>
                <th>Action</th>
              </tr>
            </thead>
            <tbody>
              {filteredEmployees.map((emp) => (
                <tr key={emp._id}>
                  <td className="employee-id">{emp.employeeId}</td>
                  <td className="employee-name">{emp.fullName}</td>
                  <td className="employee-salary">
                    ₹{emp.salary?.toLocaleString("en-IN")}
                  </td>
                  <td className="join-date">{emp.dateOfJoining}</td>
                  <td>
                    <button
                      className="delete-btn"
                      onClick={() => handleDelete(emp._id)}
                    >
                      Delete
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>

          {filteredEmployees.length === 0 && (
            <div className="no-data">
              <p>No employees found. Add your first employee above.</p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
