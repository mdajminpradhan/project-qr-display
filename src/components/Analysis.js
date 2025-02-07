"use client";
import { useState, useEffect } from "react";
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Cell,
} from "recharts";
import { jsPDF } from "jspdf";
import autoTable from "jspdf-autotable";
import QRCode from "qrcode";

const Analysis = ({ isOpen, onClose, allRecords }) => {
  const [aggregatedData, setAggregatedData] = useState([]);
  const colors = {
    "Citrus leafminer": "#FF8042",
    Healthy: "#00C49F",
    "Red scale": "#FFBB28",
  };

  useEffect(() => {
    const calculateTotals = async () => {
      if (!allRecords || allRecords.length === 0) return;

      try {
        const diseaseTotal = {
          "Citrus leafminer": 0,
          Healthy: 0,
          "Red scale": 0,
        };

        allRecords.forEach((record) => {
          if (!record.orangeData) return;

          try {
            const orangeData = JSON.parse(record.orangeData);

            if (typeof orangeData === "object" && orangeData !== null) {
              Object.entries(orangeData).forEach(([disease, value]) => {
                const normalizedDisease = disease.trim();
                if (normalizedDisease in diseaseTotal && !isNaN(value)) {
                  diseaseTotal[normalizedDisease] += Number(value);
                }
              });
            }
          } catch (error) {
            console.error("Error parsing record:", error, record.orangeData);
          }
        });

        // Calculate percentages and prepare chart data
        const total = Object.values(diseaseTotal).reduce((a, b) => a + b, 0);
        const chartData = Object.entries(diseaseTotal)
          .map(([name, value]) => ({
            name,
            value: total > 0 ? (value / total) * 100 : 0,
          }))
          .sort((a, b) => b.value - a.value);

        setAggregatedData(chartData);
      } catch (error) {
        console.error("Error processing data:", error);
      }
    };

    calculateTotals();
  }, [allRecords]);

  const handleDownloadPDF = async () => {
    try {
      // Create PDF without Chinese font support
      const doc = new jsPDF();

      // Use English for all text to ensure compatibility
      doc.setFontSize(16);
      doc.text("Garden Analysis Report", 14, 20);

      // Add Tree IDs summary if any exist
      const uniqueTreeIds = [
        ...new Set(allRecords.filter((r) => r.treeId).map((r) => r.treeId)),
      ];
      if (uniqueTreeIds.length > 0) {
        doc.setFontSize(12);
        doc.text(`Trees analyzed: ${uniqueTreeIds.join(", ")}`, 14, 30);
      }

      // Find the maximum value
      const maxValue = Math.max(...aggregatedData.map((d) => d.value));

      // Determine suggestions based on highest value disease
      const maxDisease = aggregatedData.find((item) => item.value === maxValue);
      let suggestions = [];
      if (maxDisease) {
        if (maxDisease.name === "Citrus leafminer") {
          suggestions = [
            "Apply neem oil spray",
            "Remove infected leaves",
            "Use sticky traps",
          ];
        } else if (maxDisease.name === "Red scale") {
          suggestions = [
            "Use horticultural oil",
            "Prune affected areas",
            "Introduce natural predators",
          ];
        } else if (maxDisease.name === "Healthy") {
          suggestions = [
            "Continue regular maintenance",
            "Monitor water levels",
            "Check soil nutrients",
          ];
        }
      }

      // Prepare table data
      const tableData = aggregatedData.map((item) => {
        const isMax = item.value === maxValue;
        return [
          item.name,
          `${item.value.toFixed(2)}%`,
          isMax ? "Highest" : "",
          isMax ? suggestions.join("\n") : "",
        ];
      });

      // Add the table
      const startY = uniqueTreeIds.length > 0 ? 40 : 30;

      autoTable(doc, {
        head: [["Disease", "Value", "Status", "Treatment Suggestions"]],
        body: tableData,
        startY: startY,
        styles: {
          fontSize: 10,
          cellPadding: 5,
        },
        columnStyles: {
          0: { cellWidth: 40 },
          1: { cellWidth: 30, halign: "center" },
          2: { cellWidth: 30, textColor: "#FF0000", halign: "center" },
          3: { cellWidth: 60 },
        },
        headStyles: {
          fillColor: [255, 128, 66],
          textColor: 255,
          fontStyle: "bold",
        },
      });

      // Generate QR code with summary data
      const qrData = aggregatedData
        .map((item) => `${item.name}: ${item.value.toFixed(2)}%`)
        .join("\n");

      const qrCodeImage = await QRCode.toDataURL(qrData);

      // Add QR code
      const pageHeight = doc.internal.pageSize.height;
      const lastY = doc.lastAutoTable.finalY || 30;

      if (lastY + 60 > pageHeight) {
        doc.addPage();
        doc.text("Scan QR code for quick access:", 14, 20);
        doc.addImage(qrCodeImage, "PNG", 14, 30, 50, 50);
      } else {
        doc.text("Scan QR code for quick access:", 14, lastY + 10);
        doc.addImage(qrCodeImage, "PNG", 14, lastY + 20, 50, 50);
      }

      // Save the PDF with timestamp
      const timestamp = new Date().toISOString().replace(/[:.]/g, "-");
      doc.save(`garden-analysis-${timestamp}.pdf`);
    } catch (error) {
      console.error("Error generating PDF:", error);
    }
  };

  if (!isOpen) return null;

  // Get the maximum value for comparison
  const maxValue = Math.max(...aggregatedData.map((item) => item.value));

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
      <div className="bg-white p-6 rounded-lg w-[90%] max-w-4xl">
        <div className="flex justify-between items-center mb-6">
          <div>
            <h2 className="text-2xl font-bold">果园分析报告</h2>
            {allRecords.some((r) => r.treeId) && (
              <p className="text-sm text-gray-600 mt-1">
                Trees:{" "}
                {[
                  ...new Set(
                    allRecords.filter((r) => r.treeId).map((r) => r.treeId)
                  ),
                ].join(", ")}
              </p>
            )}
          </div>
          <div className="flex items-center gap-4">
            <button
              onClick={handleDownloadPDF}
              className="flex items-center gap-2 px-4 py-2 bg-amber-400 text-white rounded-md hover:bg-amber-500 transition-colors"
            >
              <svg
                xmlns="http://www.w3.org/2000/svg"
                fill="none"
                viewBox="0 0 24 24"
                strokeWidth={1.5}
                stroke="currentColor"
                className="w-5 h-5"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  d="M3 16.5v2.25A2.25 2.25 0 0 0 5.25 21h13.5A2.25 2.25 0 0 0 21 18.75V16.5M16.5 12 12 16.5m0 0L7.5 12m4.5 4.5V3"
                />
              </svg>
              下载报告
            </button>
            <button
              onClick={onClose}
              className="text-gray-500 hover:text-gray-700"
            >
              <svg
                xmlns="http://www.w3.org/2000/svg"
                className="h-6 w-6"
                fill="none"
                viewBox="0 0 24 24"
                stroke="currentColor"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M6 18L18 6M6 6l12 12"
                />
              </svg>
            </button>
          </div>
        </div>

        <div className="flex flex-col items-center">
          <BarChart
            width={800}
            height={400}
            data={aggregatedData}
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
              {aggregatedData.map((entry) => (
                <Cell
                  key={`cell-${entry.name}`}
                  fill={
                    entry.value === maxValue ? "#FF0000" : colors[entry.name]
                  }
                />
              ))}
            </Bar>
          </BarChart>

          <div className="mt-6">
            <h3 className="text-xl font-semibold mb-3">疾病汇总</h3>
            <div className="flex items-center justify-center gap-6 p-4 bg-gray-50 rounded-lg">
              {aggregatedData.map((item) => (
                <div
                  key={item.name}
                  className="flex items-center gap-2 px-4 py-2 bg-white rounded-md shadow-sm"
                >
                  <div
                    className="w-3 h-3 rounded-full"
                    style={{
                      backgroundColor:
                        item.value === maxValue ? "#FF0000" : colors[item.name],
                    }}
                  ></div>
                  <div className="flex flex-col">
                    <span className="text-sm text-gray-600">{item.name}</span>
                    <span
                      className={`font-bold text-lg ${
                        item.value === maxValue ? "text-red-600" : ""
                      }`}
                    >
                      {item.value.toFixed(2)}%
                    </span>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Analysis;
