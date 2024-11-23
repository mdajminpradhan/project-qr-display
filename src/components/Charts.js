"use client";
import dynamic from "next/dynamic";
import { useState, useEffect } from "react";

const Chart = dynamic(() => import("./Chart"), { ssr: false });

const Charts = () => {
  const [chartData, setChartData] = useState([]);

  const fetchChartData = async () => {
    try {
      const response = await fetch("/api/get-data"); // Replace with your API endpoint
      const responseData = await response.json();
      console.log("🚀 ~ fetchChartData ~ responseData:", responseData);

      if (responseData.records && Array.isArray(responseData.records)) {
        const formattedData = responseData.records.map((record) => ({
          label: record.label,
          desc: record.desc,
          data: record.data.map((item) => ({
            name: item.name,
            value: item.value,
          })),
        }));

        // Replace state with the new data
        setChartData(formattedData);
      } else {
        console.error("Unexpected response structure:", responseData);
        setChartData([]); // Reset state if structure is invalid
      }
    } catch (error) {
      console.error("Error fetching chart data:", error);
      setChartData([]); // Reset state on error
    }
  };

  useEffect(() => {
    // Fetch data every 5 seconds
    const interval = setInterval(() => {
      fetchChartData();
    }, 5000);

    // Initial fetch
    fetchChartData();

    // Cleanup interval on component unmount
    return () => clearInterval(interval);
  }, []);

  console.log("data - ", chartData);

  return (
    <div className="w-4/5 mx-auto my-10">
      <h1 className="text-xl">All Charts</h1>

      {chartData?.length > 0 ? (
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-10">
          {chartData.map((chart, index) => (
            <Chart
              key={index}
              chartData={chart.data}
              label={chart.label}
              desc={chart.desc}
            />
          ))}
        </div>
      ) : (
        <p className="text-center mt-20">No records found!</p>
      )}
    </div>
  );
};

export default Charts;
