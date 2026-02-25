import React, { useState, useEffect } from "react";
import { Bar } from "react-chartjs-2";
import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  BarElement,
  Title,
  Tooltip,
  Legend,
} from "chart.js";

ChartJS.register(
  CategoryScale,
  LinearScale,
  BarElement,
  Title,
  Tooltip,
  Legend
);

const SalesReportPage = () => {
  const [startDate, setStartDate] = useState("");
  const [endDate, setEndDate] = useState("");
  const [salesData, setSalesData] = useState([]);
  const [isLoading, setIsLoading] = useState(false);

  // TODAY default
  useEffect(() => {
    const today = new Date().toISOString().split("T")[0];
    setStartDate(today);
    setEndDate(today);
  }, []);

  useEffect(() => {
    if (startDate && endDate) fetchSalesData();
  }, [startDate, endDate]);

  const fetchSalesData = async () => {
    setIsLoading(true);

    try {
      const response = await fetch("http://localhost:5000/api/orders");
      const data = await response.json();

      const filtered = data.filter((order) => {
        const orderDate = order.createdAt.split("T")[0];
        return orderDate >= startDate && orderDate <= endDate;
      });

      const grouped = {};

      filtered.forEach((order) => {
        const date = order.createdAt.split("T")[0];

        if (!grouped[date]) grouped[date] = { sales: 0, units: 0 };

        grouped[date].sales += order.totalAmount;

        order.order.forEach((item) => {
          grouped[date].units += item.purchaseQty;
        });
      });

      const result = Object.keys(grouped)
        .sort()
        .map((date) => ({
          date,
          sales: grouped[date].sales,
          units: grouped[date].units,
        }));

      setSalesData(result);
    } catch (err) {
      console.error(err);
    }

    setIsLoading(false);
  };

  const chartData = {
    labels: salesData.map((item) =>
      new Date(item.date).toLocaleDateString("en-IN", {
        month: "short",
        day: "numeric",
      })
    ),
    datasets: [
      {
        label: "Sales (₹)",
        data: salesData.map((item) => item.sales),
        backgroundColor: "rgba(75,192,192,0.7)",
        yAxisID: "y",
      },
      {
        label: "Units Sold",
        data: salesData.map((item) => item.units),
        backgroundColor: "rgba(255,159,64,0.7)",
        yAxisID: "y1",
      },
    ],
  };

  const chartOptions = {
    responsive: true,
    maintainAspectRatio: false, // 🔥 KEY FIX

    plugins: {
      legend: { position: "top" },
      title: {
        display: true,
        text: "Perfume Sales Analytics",
        font: { size: 22, weight: "bold" },
      },
    },

    scales: {
      y: {
        position: "left",
        title: { display: true, text: "Revenue (₹)" },
      },
      y1: {
        position: "right",
        grid: { drawOnChartArea: false },
        title: { display: true, text: "Units Sold" },
      },
    },
  };

  return (
    <div className="sales-report-page">
      <header className="report-header">
        <h1>Sales Report</h1>
      </header>

      <div className="date-selector-container">
        <div className="date-form">
          <div className="form-group">
            <label>From:</label>
            <input
              type="date"
              value={startDate}
              onChange={(e) => setStartDate(e.target.value)}
            />
          </div>

          <div className="form-group">
            <label>To:</label>
            <input
              type="date"
              value={endDate}
              onChange={(e) => setEndDate(e.target.value)}
            />
          </div>

          <button className="generate-btn" onClick={fetchSalesData}>
            Generate Report
          </button>
        </div>
      </div>

      {isLoading ? (
        <div className="loading">Loading report...</div>
      ) : salesData.length > 0 ? (
        <div className="chart-container">
          <Bar data={chartData} options={chartOptions} />
        </div>
      ) : (
        <div className="no-data">No sales data for selected dates</div>
      )}
    </div>
  );
};

export default SalesReportPage;