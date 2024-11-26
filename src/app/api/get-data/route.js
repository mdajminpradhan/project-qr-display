import { NextResponse } from "next/server";
import sqlite3 from "sqlite3";
import { open } from "sqlite";

export async function GET() {
  const db = await open({
    filename: "/tmp/qrdisplay.db",
    driver: sqlite3.Database,
  });

  // Query to fetch all data ordered by created_at DESC
  const rows = await db.all(`
    SELECT
      t.id AS treeId,
      t.label,
      t.desc,
      td.name,
      td.value,
      t.created_at
    FROM trees t
    LEFT JOIN tree_data td ON t.id = td.tree_id
    ORDER BY t.created_at DESC
  `);

  // Format the data into a structured JSON response
  const formattedData = rows.reduce((acc, row) => {
    let tree = acc.find((t) => t.treeId === row.treeId);
    if (!tree) {
      tree = {
        treeId: row.treeId,
        label: row.label,
        desc: row.desc,
        createdAt: row.created_at,
        data: [],
      };
      acc.push(tree);
    }
    if (row.name && row.value !== null) {
      tree.data.push({
        name: row.name,
        value: row.value,
      });
    }
    return acc;
  }, []);

  return NextResponse.json({ records: formattedData }, { status: 200 });
}
