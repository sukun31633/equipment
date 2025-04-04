import { NextResponse } from "next/server";
import pool from "../../../../lib/mysql";

export async function POST(req) {
  try {
    // ลบข้อมูลทั้งหมดในตาราง borrowing
    await pool.query("DELETE FROM borrowing");
    // ลบข้อมูลทั้งหมดในตาราง reservation
    await pool.query("DELETE FROM reservation");
    // รีเซ็ตสถานะอุปกรณ์ทั้งหมดให้เป็น "Available"
    await pool.query("UPDATE equipment SET status = 'Available'");

    return NextResponse.json({ 
      success: true, 
      message: "ลบข้อมูลทั้งหมดเรียบร้อยแล้ว และรีเซ็ตสถานะอุปกรณ์เป็น Available" 
    });
  } catch (error) {
    console.error("❌ Error deleting all data:", error);
    return NextResponse.json({ success: false, message: error.message }, { status: 500 });
  }
}
