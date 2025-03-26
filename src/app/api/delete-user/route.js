import { NextResponse } from "next/server";
import pool from "../../../../lib/mysql"; // ปรับ path ให้ตรงกับโครงสร้างของโปรเจค

// 🔹 DELETE ผู้ใช้รายคน


export async function DELETE(req) {
    try {
      const { userID } = await req.json();
  
      if (!userID) {
        return NextResponse.json({ success: false, message: "❌ ไม่พบ userID" }, { status: 400 });
      }
  
      const query = "DELETE FROM user WHERE userID = ?";
      const [result] = await pool.query(query, [userID]);
  
      if (result.affectedRows === 0) {
        return NextResponse.json({ success: false, message: "❌ ไม่พบผู้ใช้งานที่ต้องการลบ" }, { status: 404 });
      }
  
      return NextResponse.json({ success: true, message: "✅ ลบผู้ใช้เรียบร้อยแล้ว" });
    } catch (error) {
      console.error("❌ Error deleting user:", error);
      return NextResponse.json({ success: false, message: "❌ เกิดข้อผิดพลาดในการลบ" }, { status: 500 });
    }
  }