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
        const formattedData = Object.entries(parseData).map(([key, value]) => ({
          name: key,
          value: parseFloat(value),
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

    // Create PDF without Chinese font support
    const doc = new jsPDF();

    // Use English for all text to ensure compatibility
    doc.setFontSize(16);
    doc.text("Disease Analysis Report", 14, 20);

    // Add Tree ID and timestamp on the next line
    doc.setFontSize(12);
    const treeIdText = chartData.treeId
      ? `Tree ID: ${chartData.treeId}`
      : "No Tree ID";
    const timestampText = chartData.timestamp
      ? new Date(chartData.timestamp).toLocaleString()
      : "No date";
    doc.text(`${treeIdText} - ${timestampText}`, 14, 30);

    // Set up cure points
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

    // Determine the row with the maximum value BEFORE preparing table data
    const maxEntry = barData.reduce(
      (max, entry) => (entry.value > max.value ? entry : max),
      { name: "", value: -Infinity }
    );

    // Prepare data for the table
    const tableData = barData.map((entry) => {
      const howToCure =
        entry.name === maxEntry.name
          ? curePoints[entry.name]?.join("\n") || "No cure points available"
          : "";

      return {
        Name: entry.name,
        Value: entry.value,
        Suggestions: howToCure,
      };
    });

    // Add the table with English headers
    autoTable(doc, {
      head: [["Disease Name", "Value (%)", "Treatment Suggestions"]],
      body: tableData.map((row) => [
        row.Name,
        row.Value.toFixed(2),
        row["Suggestions"],
      ]),
      startY: 40,
      styles: {
        fontSize: 10,
        cellPadding: 4,
        overflow: "linebreak",
      },
      columnStyles: {
        0: { cellWidth: 50, textColor: "#0088FE", fillColor: "#E0F7FA" },
        1: { cellWidth: 30, textColor: "#FF8042", fillColor: "#FFF3E0" },
        2: { cellWidth: 80, textColor: "#FFBB28", fillColor: "#FFF9C4" },
      },
    });

    // Generate QR code data
    const qrCodeData = tableData
      .map(
        (row) =>
          `Disease: ${row.Name}\nValue: ${row.Value.toFixed(2)}%\nTreatment:\n${
            row["Suggestions"]
          }`
      )
      .join("\n\n");

    const qrCodeImage = await QRCode.toDataURL(qrCodeData);

    // Add QR code at the bottom
    const pageHeight = doc.internal.pageSize.height;
    const lastY = doc.lastAutoTable.finalY || 30;
    const qrCodeY = lastY + 20;

    if (qrCodeY + 60 > pageHeight) {
      doc.addPage();
      doc.text("Scan QR code for quick access:", 14, 20);
      doc.addImage(qrCodeImage, "PNG", 14, 30, 50, 50);
    } else {
      doc.text("Scan QR code for quick access:", 14, qrCodeY);
      doc.addImage(qrCodeImage, "PNG", 14, qrCodeY + 10, 50, 50);
    }

    // Save the PDF with a timestamp
    const timestamp = new Date().toISOString().replace(/[:.]/g, "-");
    doc.save(`disease-analysis-${timestamp}.pdf`);
  };

  // Determine the maximum value for coloring
  const maxValue = Math.max(...barData.map((entry) => entry.value));

  return (
    <div className="mt-5 border p-4 rounded-md bg-white">
      <div className="flex justify-between items-center">
        <p className="text-sm text-gray-600">
          {chartData.timestamp
            ? `日期和时间: ${dayjs(chartData.timestamp).format(
                "YYYY-MM-DD HH:mm:ss"
              )}`
            : "No date and time was provided"}
          {chartData.treeId && (
            <span className="ml-4">树的标号: {chartData.treeId}</span>
          )}
        </p>
      </div>
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
        <CartesianGrid strokeDasharray="3 3" vertical={false} />
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
          形成二维码
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
          下载报告
        </button>
      </div>

      <QRCodeModal isOpen={isOpen} setIsOpen={(val) => setIsOpen(val)} />
    </div>
  );
};

export default Chart;
