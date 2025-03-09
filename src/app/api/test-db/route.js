// src/app/api/test-db/route.js

import { NextResponse } from "next/server";
import pool from "../../../../lib/mysql";

// API สำหรับทดสอบการเชื่อมต่อกับ MySQL
export async function GET() {
  try {
    const [rows] = await pool.query("SELECT DATABASE() as db");
    return NextResponse.json({
      message: "เชื่อมต่อกับฐานข้อมูลสำเร็จ!",
      database: rows[0].db,
    });
  } catch (error) {
    console.error("ข้อผิดพลาดในการเชื่อมต่อฐานข้อมูล:", error);
    return NextResponse.json(
      { message: "เชื่อมต่อกับฐานข้อมูลไม่สำเร็จ", error: error.message },
      { status: 500 }
    );
  }
}
