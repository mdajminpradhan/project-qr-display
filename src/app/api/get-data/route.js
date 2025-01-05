import { NextResponse } from "next/server";
import { PrismaClient } from "@prisma/client";
const prisma = new PrismaClient();

export async function GET() {
  const allUsers = await prisma.user.findMany();
  console.log(allUsers);

  return NextResponse.json({ records: allUsers }, { status: 200 });
}
