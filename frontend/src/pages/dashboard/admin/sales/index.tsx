// SalesChart.tsx
import React, { useEffect, useState } from "react";
import { Chart, registerables } from "chart.js";
import { Line } from "react-chartjs-2";
import { pdf } from "@react-pdf/renderer";
import { useAuth } from "@/context/authContext";
import PdfDocument from "@/components/PdfDocument/PdfDocument";
import Router from "next/router";
import router from "next/router";
import withAdmin from "@/context/withAdmin";

Chart.register(...registerables);

interface SalesData {
  date: string;
  totalSales: number;
}

interface SalesByDay {
  [key: string]: number[];
}

const toName = (month: string): string => {
  const [year, monthStr] = month.split("-");
  const monthNames = [
    "January",
    "February",
    "March",
    "April",
    "May",
    "June",
    "July",
    "August",
    "September",
    "October",
    "November",
    "December",
  ];
  const monthIndex = parseInt(monthStr, 10) - 1;
  return `${monthNames[monthIndex]} ${year}`;
};

const fetchSalesHistory = async (): Promise<SalesByDay> => {
  const response = await fetch("http://localhost:5000/orders/sales");
  const data = await response.json();

  if (!Array.isArray(data)) {
    throw new Error("Unexpected data format");
  }

  const salesByDay: SalesByDay = data.reduce((acc, item) => {
    const [year, month, day] = item._id.split("-");
    const key = `${year}-${month}`;
    if (!acc[key]) {
      acc[key] = Array(31).fill(0);
    }
    acc[key][parseInt(day, 10) - 1] += item.totalSales;
    return acc;
  }, {} as SalesByDay);

  return salesByDay;
};

const getRandomColor = (): string => {
  return `rgba(${Math.floor(Math.random() * 255)}, ${Math.floor(
    Math.random() * 255
  )}, ${Math.floor(Math.random() * 255)}, 0.5)`;
};

const SalesChart: React.FC = () => {
  const [salesData, setSalesData] = useState<SalesByDay>({});
  const [selectedMonth, setSelectedMonth] = useState<string>("");
  const [months, setMonths] = useState<string[]>([]);
  const { user, loading, isAuthenticated } = useAuth();

  useEffect(() => {
    if (loading) return;
    if (!isAuthenticated) {
      router.push("/signin");
    }
    if (user && user.is_admin === false) {
      router.push("/");
    }

    const loadSalesData = async () => {
      const data = await fetchSalesHistory();
      setSalesData(data);
      setMonths(Object.keys(data));
    };

    loadSalesData();
  }, []);

  const handleMonthChange = (event: React.ChangeEvent<HTMLSelectElement>) => {
    setSelectedMonth(event.target.value);
  };

  const handlePrintToPDF = async () => {
    if (selectedMonth) {
      const monthName = toName(selectedMonth);
      const pdfDoc = (
        <PdfDocument
          monthName={monthName}
          tableData={
            salesData[selectedMonth]?.map((sales, index) => ({
              date: `Day ${index + 1}`,
              sales,
            })) || []
          }
        />
      );
      const blob = await pdf(pdfDoc).toBlob();
      const url = URL.createObjectURL(blob);
      const link = document.createElement("a");
      link.href = url;
      //name the pdf file month-year-report.pdf
      link.download = `${monthName.toLowerCase().replace(" ", "-")}-report.pdf`;
      link.click();
      URL.revokeObjectURL(url);
    }
  };

  const chartData = {
    labels: Array.from({ length: 31 }, (_, i) => `Day ${i + 1}`),
    datasets: selectedMonth
      ? [
          {
            label: toName(selectedMonth),
            data: salesData[selectedMonth] || [],
            borderColor: getRandomColor(),
            fill: false,
          },
        ]
      : [],
  };

  const chartOptions = {
    responsive: true,
    plugins: {
      legend: {
        display: true,
      },
      tooltip: {
        callbacks: {
          label: function (tooltipItem: any) {
            return `Sales: $${tooltipItem.raw.toFixed(2)}`;
          },
        },
      },
    },
    scales: {
      x: {
        title: {
          display: true,
          text: "Days of the Month",
        },
      },
      y: {
        title: {
          display: true,
          text: "Total Sales",
        },
        beginAtZero: true,
      },
    },
  };

  const salesTableData = selectedMonth
    ? salesData[selectedMonth]?.map((sales, index) => ({
        date: `Day ${index + 1}`,
        sales,
      })) || []
    : [];

  return (
    <div className="w-full min-h-[calc(100vh-144px)] justify-start p-10 items-center text-gray-600 bg-gray-50 flex flex-col">
      <h2 className="text-4xl font-bold">Sales History</h2>

      <div className="flex w-1/2 h-1/2">
        <Line data={chartData} options={chartOptions} />
      </div>

      <div className="mt-4">
        <label htmlFor="month" className="mr-2 text-lg font-medium">
          Select Month:
        </label>
        <select
          id="month"
          value={selectedMonth}
          onChange={handleMonthChange}
          className="p-2 border rounded"
        >
          <option value="">--Select a month--</option>
          {months.map((month) => (
            <option key={month} value={month}>
              {toName(month)}
            </option>
          ))}
        </select>
      </div>

      <div className="mt-4">
        <button
          onClick={handlePrintToPDF}
          className="px-4 py-2 bg-blue-500 text-white rounded"
        >
          Print to PDF
        </button>
      </div>

      <div className="mt-10 w-full max-w-4xl overflow-x-auto">
        <table className="min-w-full divide-y divide-gray-200">
          <thead className="bg-gray-50">
            <tr>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Date
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Sales
              </th>
            </tr>
          </thead>
          <tbody className="bg-white divide-y divide-gray-200">
            {salesTableData.map((row, index) =>
              row.sales === 0 ? null : (
                <tr key={index}>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                    {row.date}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                    ${row.sales.toFixed(2)}
                  </td>
                </tr>
              )
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
};

export default withAdmin(SalesChart);
