import { NextResponse } from "next/server";
import pool from "../../../../lib/mysql"; // เชื่อมต่อกับฐานข้อมูล MySQL
          
export async function GET(req) {
  try {
    // SQL query สำหรับดึงข้อมูลผู้ใช้ทั้งหมด
    const query = `
      SELECT userID, Name, phoneNumber, email, status, password
      FROM user;
    `;
         
    // ดึงข้อมูลจากฐานข้อมูล
    const [rows] = await pool.query(query);
     
    // ส่งข้อมูลกลับไปในรูปแบบ JSON
    return NextResponse.json({ success: true, data: rows });
  } catch (error) {
    console.error("❌ เกิดข้อผิดพลาดในการดึงข้อมูลผู้ใช้:", error);
    return NextResponse.json({ success: false, message: "❌ ไม่สามารถดึงข้อมูลได้" }, { status: 500 });
  }
}
