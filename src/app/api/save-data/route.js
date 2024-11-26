import { NextResponse } from "next/server";
import sqlite3 from "sqlite3";
import { open } from "sqlite";

export async function POST(request) {
  const data = await request.json();

  // Parse the Text field from the input
  const parsedData = JSON.parse(data.Text);

  // Open SQLite database
  const db = await open({
    filename: "/tmp/qrdisplay.db",
    driver: sqlite3.Database,
  });

  // Ensure the 'trees' table has the 'created_at' column
  await db.exec(`
    CREATE TABLE IF NOT EXISTS trees (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      label TEXT NOT NULL,
      desc TEXT NOT NULL,
      created_at TEXT DEFAULT CURRENT_TIMESTAMP
    );
  `);

  await db.exec(`
    CREATE TABLE IF NOT EXISTS tree_data (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      tree_id INTEGER NOT NULL,
      name TEXT NOT NULL,
      value REAL NOT NULL,
      FOREIGN KEY (tree_id) REFERENCES trees(id)
    );
  `);

  // Insert main tree record
  const treeResult = await db.run(
    "INSERT INTO trees (label, desc) VALUES (?, ?)",
    "Default Label", // Use default label since not provided in the data
    "Default Description" // Use default description since not provided
  );
  const treeId = treeResult.lastID;

  // Insert associated data
  const insertDataStmt = await db.prepare(
    "INSERT INTO tree_data (tree_id, name, value) VALUES (?, ?, ?)"
  );

  for (const [name, value] of parsedData) {
    await insertDataStmt.run(treeId, name, value);
  }

  await insertDataStmt.finalize();

  console.log("hey");

  return NextResponse.json(
    { msg: "Data inserted successfully" },
    { status: 200 }
  );
}
