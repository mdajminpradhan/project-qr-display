"use client";
import { useState } from "react";
import Header from "../components/Header";
import Charts from "../components/Charts";

const Page = () => {
  const [allRecords, setAllRecords] = useState([]);

  return (
    <div>
      <Header allRecords={allRecords} />
      <Charts setAllRecords={setAllRecords} />
    </div>
  );
};

export default Page;
