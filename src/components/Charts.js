"use client";
import axios from "axios";
import dynamic from "next/dynamic";
import { useState, useEffect } from "react";

// Dynamically import the Chart component
const Chart = dynamic(() => import("./Chart"), { ssr: false });

const Charts = ({ setAllRecords }) => {
  const [chartData, setChartData] = useState([]);
  const [loading, setLoading] = useState(true);

  const fetchData = async () => {
    try {
      const response = await fetch("http://localhost:5500/get-data"); // Updated port
      const data = await response.json();
      setChartData(data);
      setAllRecords(data);
    } catch (error) {
      console.error("Error fetching data:", error);
      setChartData([]);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    // Initial fetch
    fetchData();

    // Fetch data every 5 seconds
    const interval = setInterval(fetchData, 5000);

    // Cleanup interval on component unmount
    return () => clearInterval(interval);
  }, []);

  return (
    <div className="w-4/5 mx-auto my-10">
      <h1 className="text-xl font-bold">图表展示</h1>

      {loading ? (
        <p className="text-center mt-20">Loading charts...</p>
      ) : chartData.length > 0 ? (
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-10">
          {chartData?.length > 0 &&
            chartData?.map((chart, index) => (
              <div key={index}>
                <h2 className="text-lg font-semibold mb-2">
                  {chart.treeId ? (
                    <span>树的标号: {chart.treeId}</span>
                  ) : (
                    `Record ${index + 1}`
                  )}
                </h2>
                <Chart chartData={chart} />
              </div>
            ))}
        </div>
      ) : (
        <p className="text-center mt-20">No records found!</p>
      )}
    </div>
  );
};

export default Charts;
