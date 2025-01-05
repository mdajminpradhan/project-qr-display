"use client";
import { useRouter } from "next/navigation";
import { useEffect, useLayoutEffect } from "react";
import Image from "next/image";
import { jsPDF } from "jspdf";
import autoTable from "jspdf-autotable";
import QRCode from "qrcode";

const Header = ({ allRecords }) => {
  const router = useRouter();

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
    if (!allRecords || allRecords.length === 0) {
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

    const doc = new jsPDF();

    // Process each record
    for (let recordIndex = 0; recordIndex < allRecords.length; recordIndex++) {
      const record = allRecords[recordIndex];

      try {
        const parseData = JSON.parse(record.orangeData);

        // Transform object to array of { name, value }
        const formattedData = Object.keys(parseData).map((key) => ({
          name: key,
          value: parseData[key],
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
              : ""; // Add cure points only for the maximum value

          return {
            Name: entry.name,
            Value: entry.value,
            "How to Cure": howToCure,
          };
        });

        // Add a new page for records after the first one
        if (recordIndex > 0) {
          doc.addPage();
        }

        // Add a title for each record
        doc.setFontSize(16);
        doc.text(
          `Record ${recordIndex + 1} - ${
            record.timestamp
              ? new Date(record.timestamp).toLocaleString()
              : "No date"
          }`,
          14,
          20
        );

        // Add the table
        autoTable(doc, {
          head: [["Name", "Value", "How to Cure"]],
          body: tableData.map((row) => [
            row.Name,
            row.Value,
            row["How to Cure"],
          ]),
          startY: 30,
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

        // QR code generation logic removed
        // const qrCodeData = tableData
        //   .map(
        //     (row) =>
        //       `Name: ${row.Name}\nValue: ${row.Value}\nCure Points:\n${row["How to Cure"]}`
        //   )
        //   .join("\n\n");

        // const qrCodeImage = await QRCode.toDataURL(qrCodeData);

        // Add QR code at the bottom of the same page
        // const pageHeight = doc.internal.pageSize.height;
        // const lastY = doc.lastAutoTable.finalY || 30;

        // Ensure there is enough space for the QR code
        // const qrCodeY = lastY + 20;
        // if (qrCodeY + 60 > pageHeight) {
        //   doc.addPage();
        //   doc.text("Scan this QR code to view the report summary:", 14, 20);
        //   doc.addImage(qrCodeImage, "PNG", 14, 30, 50, 50);
        // } else {
        //   doc.text(
        //     "Scan this QR code to view the report summary:",
        //     14,
        //     qrCodeY
        //   );
        //   doc.addImage(qrCodeImage, "PNG", 14, qrCodeY + 10, 50, 50);
        // }
      } catch (error) {
        console.error(`Error processing record ${recordIndex}:`, error);
      }
    }

    // Save the PDF with all records
    doc.save("all-records-report.pdf");
  };

  return (
    <div className="bg-white py-5">
      <div className="w-4/5 mx-auto flex justify-between items-center">
        <div className="w-4/5 mx-auto flex items-center">
          <div className="relative h-16 w-16">
            <Image
              src="/images/logo.jpg"
              objectFit="cover"
              layout="fill"
              alt="logo"
            />
          </div>
          <div className="ml-3.5 mt-1">
            <h1 className="font-medium text-xl leading-none">Project Orange</h1>
          </div>
          <span></span>
        </div>
        <div className="flex space-x-4">
          <button
            className="mt-2 border border-amber-400 hover:bg-amber-400 hover:text-white w-full px-2 py-2 rounded-md flex justify-center items-center"
            onClick={handleDownloadReports}
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
            Download Reports
          </button>
          <button className="text-amber-400" onClick={handleLogOut}>
            Logout
          </button>
        </div>
      </div>
    </div>
  );
};

export default Header;
