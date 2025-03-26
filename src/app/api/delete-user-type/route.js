import { NextResponse } from "next/server";
import pool from "../../../../lib/mysql"; // ปรับ path ให้ตรงกับโครงสร้างของโปรเจค

export async function POST(req) {
    try {
      const { status } = await req.json();
  
      if (!status) {
        return NextResponse.json({ success: false, message: "❌ โปรดระบุสถานะผู้ใช้งานที่ต้องการลบ" }, { status: 400 });
      }
  
      const query = "DELETE FROM user WHERE status = ?";
      const [result] = await pool.query(query, [status]);
  
      return NextResponse.json({ success: true, message: `✅ ลบผู้ใช้ทั้งหมดที่มีสถานะ ${status} สำเร็จแล้ว`, deleted: result.affectedRows });
    } catch (error) {
      console.error("❌ Error deleting users by type:", error);
      return NextResponse.json({ success: false, message: "❌ เกิดข้อผิดพลาดในการลบตามประเภท" }, { status: 500 });
    }
  }