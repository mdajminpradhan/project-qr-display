"use client";
import { useRouter } from "next/navigation";
import { useEffect, useLayoutEffect, useState } from "react";
import Image from "next/image";
import { jsPDF } from "jspdf";
import autoTable from "jspdf-autotable";
import QRCode from "qrcode";
import Analysis from "./Analysis";

const Header = ({ allRecords }) => {
  const router = useRouter();
  const [showAnalysis, setShowAnalysis] = useState(false);

  useLayoutEffect(() => {
    const isLoggedIn = localStorage.getItem("isOrangeLoggedIn") === "true";
    if (!isLoggedIn) {
      router.push("/login");
    }
  }, [router]);

  const handleLogOut = () => {
    localStorage.removeItem("isOrangeLoggedIn");
    router.push("/login");
  };

  const handleDownloadReports = async () => {
    if (!allRecords || allRecords.length === 0) return;

    // Create PDF without Chinese font support
    const doc = new jsPDF();

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

    // Process each record
    for (let recordIndex = 0; recordIndex < allRecords.length; recordIndex++) {
      const record = allRecords[recordIndex];

      try {
        const parseData = JSON.parse(record.orangeData);
        const formattedData = Object.entries(parseData).map(([key, value]) => ({
          name: key,
          value: parseFloat(value),
        }));

        // Determine the row with the maximum value
        const maxEntry = formattedData.reduce(
          (max, entry) => (entry.value > max.value ? entry : max),
          { name: "", value: -Infinity }
        );

        // Prepare data for the table
        const tableData = formattedData.map((entry) => {
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

        // Add a new page for records after the first one
        if (recordIndex > 0) {
          doc.addPage();
        }

        // Add title with Tree ID
        doc.setFontSize(16);
        
        // Use English for the main title to avoid encoding issues
        doc.text("Disease Analysis Report", 14, 20);
        
        // Add Tree ID and timestamp on the next line
        doc.setFontSize(12);
        const treeIdText = record.treeId ? `Tree ID: ${record.treeId}` : `Record ${recordIndex + 1}`;
        const timestampText = record.timestamp 
          ? new Date(record.timestamp).toLocaleString()
          : "No date";
        doc.text(`${treeIdText} - ${timestampText}`, 14, 30);

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

      } catch (error) {
        console.error(`Error processing record ${recordIndex}:`, error);
      }
    }

    // Save the PDF with a timestamp
    const timestamp = new Date().toISOString().replace(/[:.]/g, '-');
    doc.save(`disease-analysis-${timestamp}.pdf`);
  };

  const handleDownloadCSV = () => {
    if (!allRecords || allRecords.length === 0) {
      console.error("No data to download");
      return;
    }

    try {
      // Create CSV header
      let csvContent =
        "ID,Date,Time,Tree ID,Max Disease,Max Value,Other Disease Values,Suggestions\n";

      // Process each record
      allRecords.forEach((record, index) => {
        try {
          const timestamp = new Date(record.timestamp);
          const date = timestamp.toLocaleDateString();
          const time = timestamp.toLocaleTimeString();

          const orangeData = JSON.parse(record.orangeData);
          const entries = Object.entries(orangeData);

          const maxEntry = entries.reduce((max, curr) =>
            curr[1] > max[1] ? curr : max
          );

          const otherDiseases = entries
            .filter(([name]) => name !== maxEntry[0])
            .map(([name, value]) => `${name}:${value}`)
            .join("; ");

          let suggestions = "";
          if (maxEntry[0] === "Citrus leafminer") {
            suggestions =
              "Apply neem oil spray; Remove infected leaves; Use sticky traps";
          } else if (maxEntry[0] === "Red scale") {
            suggestions =
              "Use horticultural oil; Prune affected areas; Introduce natural predators";
          } else if (maxEntry[0] === "Healthy") {
            suggestions =
              "Continue regular maintenance; Monitor water levels; Check soil nutrients";
          }

          // Add row to CSV with Tree ID
          csvContent += `${index + 1},${date},${time},${record.treeId || ""},${
            maxEntry[0]
          },${maxEntry[1]},${otherDiseases},"${suggestions}"\n`;
        } catch (error) {
          console.error("Error processing record:", error);
        }
      });

      // Create and trigger download
      const blob = new Blob([csvContent], { type: "text/csv;charset=utf-8;" });
      const url = window.URL.createObjectURL(blob);
      const link = document.createElement("a");
      link.setAttribute("href", url);
      link.setAttribute(
        "download",
        `garden-analysis-${new Date().getTime()}.csv`
      );
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      window.URL.revokeObjectURL(url);
    } catch (error) {
      console.error("Error generating CSV:", error);
    }
  };

  return (
    <>
      <div className="bg-white py-5">
        <div className="w-4/5 mx-auto flex justify-between items-center">
          <div className="flex items-center">
            <div className="relative h-16 w-16">
              <Image
                src="/images/logo.jpg"
                objectFit="cover"
                layout="fill"
                alt="logo"
              />
            </div>
            <div className="ml-3.5">
              <h1 className="font-medium text-xl">柑橘工程\橙色计划</h1>
            </div>
          </div>

          <div className="flex items-center gap-3">
            <button
              className="border border-amber-400 hover:bg-amber-400 hover:text-white px-4 py-2 rounded-md flex items-center whitespace-nowrap"
              onClick={() => setShowAnalysis(true)}
            >
              <svg
                xmlns="http://www.w3.org/2000/svg"
                fill="none"
                viewBox="0 0 24 24"
                strokeWidth={1.5}
                stroke="currentColor"
                className="w-5 h-5 mr-2"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  d="M7.5 14.25v2.25m3-4.5v4.5m3-6.75v6.75m3-9v9M6 20.25h12A2.25 2.25 0 0020.25 18V6A2.25 2.25 0 0018 3.75H6A2.25 2.25 0 003.75 6v12A2.25 2.25 0 006 20.25z"
                />
              </svg>
              进行分析
            </button>
            <button
              className="border border-amber-400 hover:bg-amber-400 hover:text-white px-4 py-2 rounded-md flex items-center whitespace-nowrap"
              onClick={handleDownloadCSV}
            >
              <svg
                xmlns="http://www.w3.org/2000/svg"
                fill="none"
                viewBox="0 0 24 24"
                strokeWidth={1.5}
                stroke="currentColor"
                className="w-5 h-5 mr-2"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  d="M3.375 19.5h17.25m-17.25 0a1.125 1.125 0 0 1-1.125-1.125M3.375 19.5h7.5c.621 0 1.125-.504 1.125-1.125m-9.75 0V5.625m0 12.75v-1.5c0-.621.504-1.125 1.125-1.125m18.375 2.625V5.625m0 12.75c0 .621-.504 1.125-1.125 1.125m1.125-1.125v-1.5c0-.621-.504-1.125-1.125-1.125m0 3.75h-7.5A1.125 1.125 0 0 1 12 18.375m9.75-12.75c0-.621-.504-1.125-1.125-1.125H3.375c-.621 0-1.125.504-1.125 1.125m19.5 0v1.5c0 .621-.504 1.125-1.125 1.125M2.25 5.625v1.5c0 .621.504 1.125 1.125 1.125m0 0h17.25m-17.25 0h7.5c.621 0 1.125.504 1.125 1.125M3.375 8.25c-.621 0-1.125.504-1.125 1.125v1.5c0 .621.504 1.125 1.125 1.125m17.25-3.75h-7.5c-.621 0-1.125.504-1.125 1.125m8.625-1.125c.621 0 1.125.504 1.125 1.125v1.5c0 .621-.504 1.125-1.125 1.125m-17.25 0h7.5m-7.5 0c-.621 0-1.125.504-1.125 1.125v1.5c0 .621.504 1.125 1.125 1.125M12 10.875v-1.5m0 1.5c0 .621-.504 1.125-1.125 1.125M12 10.875c0 .621.504 1.125 1.125 1.125m-2.25 0c.621 0 1.125.504 1.125 1.125M13.125 12h7.5m-7.5 0c-.621 0-1.125.504-1.125 1.125M20.625 12c.621 0 1.125.504 1.125 1.125v1.5c0 .621-.504 1.125-1.125 1.125m-17.25 0h7.5M12 14.625v-1.5m0 1.5c0 .621-.504 1.125-1.125 1.125M12 14.625c0 .621.504 1.125 1.125 1.125m-2.25 0c.621 0 1.125.504 1.125 1.125m0 1.5v-1.5m0 0c0-.621.504-1.125 1.125-1.125m0 0h7.5"
                />
              </svg>
              形成csv文件
            </button>
            <button
              className="border border-amber-400 hover:bg-amber-400 hover:text-white px-4 py-2 rounded-md flex items-center whitespace-nowrap"
              onClick={handleDownloadReports}
            >
              <svg
                xmlns="http://www.w3.org/2000/svg"
                fill="none"
                viewBox="0 0 24 24"
                strokeWidth={1.5}
                stroke="currentColor"
                className="w-5 h-5 mr-2"
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
              className="text-amber-400 hover:text-amber-500 px-4 py-2"
              onClick={handleLogOut}
            >
              退出
            </button>
          </div>
        </div>
      </div>

      <Analysis
        isOpen={showAnalysis}
        onClose={() => setShowAnalysis(false)}
        allRecords={allRecords}
      />
    </>
  );
};

export default Header;
