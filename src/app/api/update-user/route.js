import { NextResponse } from "next/server";
import pool from "../../../../lib/mysql"; // เชื่อมต่อกับฐานข้อมูล MySQL

export async function PUT(req) {
  try {
    // ดึงข้อมูลจาก request body
    const { userID, name, phoneNumber, email, status,  } = await req.json();

    // ตรวจสอบข้อมูลที่จำเป็น
    if (!userID || !name || !phoneNumber || !email || !status  ) {
      return NextResponse.json({ success: false, message: "❌ ข้อมูลไม่ครบถ้วน" }, { status: 400 });
    }

    // SQL query สำหรับการอัปเดตข้อมูลผู้ใช้
    const query = `
      UPDATE user 
      SET Name = ?, phoneNumber = ?, email = ?, status = ?, facultyCode = ?
      WHERE userID = ?;
    `;
    const values = [name, phoneNumber, email, status, userID];

    // อัปเดตข้อมูลในฐานข้อมูล
    const [result] = await pool.query(query, values);

    // หากไม่มีการอัปเดต (เช่น ไม่พบ userID ในฐานข้อมูล)
    if (result.affectedRows === 0) {
      return NextResponse.json({ success: false, message: "❌ ไม่พบผู้ใช้ในระบบ" }, { status: 404 });
    }

    // ส่งข้อความสำเร็จกลับไป
    return NextResponse.json({ success: true, message: "✅ ข้อมูลอัปเดตสำเร็จ!" });
  } catch (error) {
    console.error("❌ Error updating user:", error);
    // ส่งข้อความผิดพลาดกลับไป
    return NextResponse.json({ success: false, message: "❌ เกิดข้อผิดพลาดในการอัปเดตข้อมูล" }, { status: 500 });
  }
}
