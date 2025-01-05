"use client";
import dayjs from "dayjs";
import {
  BarChart,
  Bar,
  Cell,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
} from "recharts";
import QRCodeModal from "./QRCodeModal";
import { useEffect, useState } from "react";
import { jsPDF } from "jspdf";
import autoTable from "jspdf-autotable";
import QRCode from "qrcode";

const colors = ["#0088FE", "#00C49F", "#FFBB28", "#FF8042", "red", "pink"];

const Chart = ({ chartData }) => {
  const [isOpen, setIsOpen] = useState(null);
  const [barData, setShowBarData] = useState([]);

  useEffect(() => {
    if (chartData?.orangeData) {
      try {
        const parseData = JSON.parse(chartData.orangeData);

        // Transform object to array of { name, value }
        const formattedData = Object.keys(parseData).map((key) => ({
          name: key,
          value: parseData[key],
        }));

        setShowBarData(formattedData);
      } catch (error) {
        console.error("Failed to parse orangeData:", error);
      }
    }
  }, [chartData]);

  const handleDownloadPDF = async () => {
    if (!barData || barData.length === 0) {
      console.error("No data to download");
      return;
    }

    const curePoints = {
      "Citrus leafminer": [
        "1. Apply neem oil spray.",
        "2. Remove and destroy infested leaves.",
        "3. Use pheromone traps to monitor infestation.",
      ],
      Healthy: [
        "1. Maintain proper watering.",
        "2. Ensure good soil health.",
        "3. Regularly inspect for pests or diseases.",
      ],
      "Red scale": [
        "1. Use horticultural oil spray.",
        "2. Introduce natural predators like ladybugs.",
        "3. Prune heavily infested branches.",
      ],
    };

    // Determine the row with the maximum value
    const maxEntry = barData.reduce(
      (max, entry) => (entry.value > max.value ? entry : max),
      { name: "", value: -Infinity }
    );

    // Prepare data for the table
    const tableData = barData.map((entry) => {
      const howToCure =
        entry.name === maxEntry.name
          ? curePoints[entry.name]?.join("\n") || "No cure points available"
          : ""; // Add cure points only for the maximum value

      return {
        Name: entry.name,
        Value: entry.value,
        "How to Cure": howToCure,
      };
    });

    // Generate QR code data (summarizing all report data)
    const qrCodeData = tableData
      .map(
        (row) =>
          `Name: ${row.Name}\nValue: ${row.Value}\nCure Points:\n${row["How to Cure"]}`
      )
      .join("\n\n");

    const qrCodeImage = await QRCode.toDataURL(qrCodeData);

    // Generate the PDF
    const doc = new jsPDF();

    // Add a title
    doc.setFontSize(16);
    doc.text("Chart Data with Cure Points", 14, 20);

    // Add the table
    autoTable(doc, {
      head: [["Name", "Value", "How to Cure"]],
      body: tableData.map((row) => [row.Name, row.Value, row["How to Cure"]]),
      startY: 30,
      styles: {
        fontSize: 10,
        cellPadding: 4,
        overflow: "linebreak",
      },
      columnStyles: {
        0: { cellWidth: 50, textColor: "#0088FE", fillColor: "#E0F7FA" }, // First column (Name)
        1: { cellWidth: 30, textColor: "#FF8042", fillColor: "#FFF3E0" }, // Second column (Value)
        2: { cellWidth: 80, textColor: "#FFBB28", fillColor: "#FFF9C4" }, // Third column (How to Cure)
      },
    });

    // Add QR code at the bottom of the same page
    const pageHeight = doc.internal.pageSize.height;
    const lastY = doc.lastAutoTable.finalY || 30; // Get the last Y position after the table

    // Ensure there is enough space for the QR code
    const qrCodeY = lastY + 20;
    if (qrCodeY + 60 > pageHeight) {
      doc.addPage();
      doc.text("Scan this QR code to view the report summary:", 14, 20);
      doc.addImage(qrCodeImage, "PNG", 14, 30, 50, 50); // Adjust size and position
    } else {
      doc.text("Scan this QR code to view the report summary:", 14, qrCodeY);
      doc.addImage(qrCodeImage, "PNG", 14, qrCodeY + 10, 50, 50); // Adjust size and position
    }

    // Save the PDF
    doc.save("chart-data-with-cures-and-qr.pdf");
  };

  // Determine the maximum value for coloring
  const maxValue = Math.max(...barData.map((entry) => entry.value));

  return (
    <div className="mt-5 border p-4 rounded-md bg-white">
      <p className="text-sm text-gray-600 mb-4">
        {chartData.timestamp
          ? `Date and Time: ${dayjs(chartData.timestamp).format(
              "YYYY-MM-DD HH:mm:ss"
            )}`
          : "No date and time was provided"}
      </p>
      <BarChart
        width={500}
        height={300}
        data={barData}
        margin={{
          top: 20,
          right: 30,
          left: 20,
          bottom: 5,
        }}
      >
        <CartesianGrid strokeDasharray="3 3" />
        <XAxis dataKey="name" />
        <YAxis />
        <Tooltip />
        <Bar dataKey="value" label={{ position: "top" }}>
          {barData?.map((entry, index) => (
            <Cell
              key={`cell-${index}`}
              fill={
                entry.value === maxValue ? "red" : colors[index % colors.length]
              } // Set red for max value
            />
          ))}
        </Bar>
      </BarChart>

      <div className="flex items-center space-x-4">
        <button
          className="mt-2 border border-amber-400 hover:bg-amber-400 hover:text-white w-full py-2 rounded-md flex justify-center items-center"
          onClick={() => setIsOpen(chartData)}
        >
          <svg
            xmlns="http://www.w3.org/2000/svg"
            fill="none"
            viewBox="0 0 24 24"
            strokeWidth={1.5}
            stroke="currentColor"
            className="size-6"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              d="M3.75 4.875c0-.621.504-1.125 1.125-1.125h4.5c.621 0 1.125.504 1.125 1.125v4.5c0 .621-.504 1.125-1.125 1.125h-4.5A1.125 1.125 0 0 1 3.75 9.375v-4.5ZM3.75 14.625c0-.621.504-1.125 1.125-1.125h4.5c.621 0 1.125.504 1.125 1.125v4.5c0 .621-.504 1.125-1.125 1.125h-4.5a1.125 1.125 0 0 1-1.125-1.125v-4.5ZM13.5 4.875c0-.621.504-1.125 1.125-1.125h4.5c.621 0 1.125.504 1.125 1.125v4.5c0 .621-.504 1.125-1.125 1.125h-4.5A1.125 1.125 0 0 1 13.5 9.375v-4.5Z"
            />
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              d="M6.75 6.75h.75v.75h-.75v-.75ZM6.75 16.5h.75v.75h-.75v-.75ZM16.5 6.75h.75v.75h-.75v-.75ZM13.5 13.5h.75v.75h-.75v-.75ZM13.5 19.5h.75v.75h-.75v-.75ZM19.5 13.5h.75v.75h-.75v-.75ZM19.5 19.5h.75v.75h-.75v-.75ZM16.5 16.5h.75v.75h-.75v-.75Z"
            />
          </svg>
          Show QR Code
        </button>
        <button
          className="mt-2 border border-amber-400 hover:bg-amber-400 hover:text-white w-full py-2 rounded-md flex justify-center items-center"
          onClick={handleDownloadPDF}
        >
          <svg
            xmlns="http://www.w3.org/2000/svg"
            fill="none"
            viewBox="0 0 24 24"
            strokeWidth={1.5}
            stroke="currentColor"
            className="size-5 mr-2.5"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              d="M3 16.5v2.25A2.25 2.25 0 0 0 5.25 21h13.5A2.25 2.25 0 0 0 21 18.75V16.5M16.5 12 12 16.5m0 0L7.5 12m4.5 4.5V3"
            />
          </svg>
          Download Report
        </button>
      </div>

      <QRCodeModal isOpen={isOpen} setIsOpen={(val) => setIsOpen(val)} />
    </div>
  );
};

export default Chart;
