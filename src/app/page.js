"use client";
import { useState, useEffect } from "react";
import Header from "../components/Header";
import Charts from "../components/Charts";

const Page = () => {
  const [allRecords, setAllRecords] = useState([]);

  useEffect(() => {
    console.log("Current allRecords:", allRecords);
  }, [allRecords]);

  return (
    <div>
      <Header allRecords={allRecords} />
      <Charts setAllRecords={setAllRecords} />
    </div>
  );
};

export default Page;
