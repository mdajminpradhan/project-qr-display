"use client";
import axios from "axios";
import dynamic from "next/dynamic";
import { useState, useEffect } from "react";

// Dynamically import the Chart component
const Chart = dynamic(() => import("./Chart"), { ssr: false });

const Charts = ({ setAllRecords }) => {
  const [chartData, setChartData] = useState([]);
  const [loading, setLoading] = useState(true);

  const fetchChartData = async () => {
    try {
      const response = await axios.get("http://localhost:5001/get-data"); // Replace with your API endpoint
      setChartData(response.data);
      setAllRecords(response.data);
    } catch (error) {
      console.error("Error fetching chart data:", error);
      setChartData([]);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    // Initial fetch
    fetchChartData();

    // Fetch data every 5 seconds
    const interval = setInterval(fetchChartData, 5000);

    // Cleanup interval on component unmount
    return () => clearInterval(interval);
  }, []);

  return (
    <div className="w-4/5 mx-auto my-10">
      <h1 className="text-xl font-bold">All Charts</h1>

      {loading ? (
        <p className="text-center mt-20">Loading charts...</p>
      ) : chartData.length > 0 ? (
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-10">
          {chartData?.length > 0 &&
            chartData?.map((chart, index) => (
              <div key={index}>
                <h2 className="text-lg font-semibold mb-2">{`Record ${
                  index + 1
                }`}</h2>
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
