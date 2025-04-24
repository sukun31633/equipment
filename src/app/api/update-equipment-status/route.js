// app/api/update-equipment-status/route.js  (Next.js 13 app router)
import { NextResponse } from "next/server";
import pool from "../../../../lib/mysql";

export async function POST(req) {
  try {
    const { id, status } = await req.json();

    // ตรวจสอบข้อมูลเบื้องต้น
    const validStatuses = ["Available", "Repair", "Damaged"];
    if (!id || !validStatuses.includes(status)) {
      return NextResponse.json(
        { success: false, message: "❌ ข้อมูลไม่ถูกต้อง" },
        { status: 400 }
      );
    }

    // อัปเดตสถานะในตาราง equipment
    const [result] = await pool.query(
      "UPDATE equipment SET status = ? WHERE id = ?",
      [status, id]
    );

    if (result.affectedRows === 0) {
      return NextResponse.json(
        { success: false, message: "❌ ไม่พบอุปกรณ์ที่ต้องการอัปเดต" },
        { status: 404 }
      );
    }

    return NextResponse.json({
      success: true,
      message: `✅ เปลี่ยนสถานะอุปกรณ์เป็น ${statusMap[status] || status} แล้ว`,
    });
  } catch (error) {
    console.error("❌ update-equipment-status error:", error);
    return NextResponse.json(
      { success: false, message: "❌ เกิดข้อผิดพลาดในการอัปเดตสถานะ" },
      { status: 500 }
    );
  }
}

// ถ้าต้องการแปลงชื่อภาษาไทยใน API ด้วย ก็เพิ่ม:
const statusMap = {
  Available: "พร้อมใช้งาน",
  Repair: "ซ่อม",
  Damaged: "พัง",
};
