"use client";
import dynamic from "next/dynamic";
import { useState, useEffect } from "react";

const Chart = dynamic(() => import("./Chart"), { ssr: false });

const Charts = () => {
  const [chartData, setChartData] = useState([
    {
      label: "tree1",
      desc: "gg",
      data: [
        { name: "Mn (Manganese Deficiency)", value: 0.08704 },
        { name: "Zn (Zinc Deficiency)", value: 0.17908 },
        { name: "Texas Mite", value: 0.20728 },
      ],
    },
  ]);

  const fetchChartData = async () => {
    try {
      const response = await fetch("/api/get-data"); // Replace with your API endpoint
      const newData = await response.json();

      // Append new data to existing state
      setChartData((prevData) => [
        ...prevData,
        {
          label: newData.Label,
          desc: newData.Desc,
          data: Object.entries(newData)
            .filter(([key]) => key !== "Label" && key !== "Desc")
            .map(([name, value]) => ({ name, value })),
        },
      ]);
    } catch (error) {
      console.error("Error fetching chart data:", error);
    }
  };

  useEffect(() => {
    // Fetch data every 5 seconds
    const interval = setInterval(() => {
      fetchChartData();
    }, 5000);

    // Cleanup interval on component unmount
    return () => clearInterval(interval);
  }, []);

  return (
    <div className="w-4/5 mx-auto my-10">
      <h1 className="text-xl">All Charts</h1>

      <div className="grid grid-cols-2 gap-10">
        {chartData.map((chart, index) => (
          <Chart
            key={index}
            chartData={chart.data}
            label={chart.label}
            desc={chart.desc}
          />
        ))}
      </div>
    </div>
  );
};

export default Charts;
