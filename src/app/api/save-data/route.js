import { NextResponse } from "next/server";
import { PrismaClient } from "@prisma/client";

const prisma = new PrismaClient();

export async function POST(request) {
  let data;
  try {
    data = await request.json();
  } catch (error) {
    return NextResponse.json({ msg: "Not good data" }, { status: 500 });
  }

  try {
    await prisma.user.create({
      data: {
        orangeData: data.orangeData,
      },
    });

    return NextResponse.json({ msg: "inserted successfully" }, { status: 200 });
  } catch (error) {
    // console.log("🚀 ~ POST ~ error:", error)
    return NextResponse.json({ msg: error }, { status: 500 });
  }
}
