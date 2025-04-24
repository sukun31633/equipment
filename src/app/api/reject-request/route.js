// File: app/api/reject-request/route.js
import { NextResponse } from "next/server";
import pool from "../../../../lib/mysql";

export async function POST(req) {
  try {
    const { id, type, reason } = await req.json();
    if (!id || !type || !reason || !reason.trim()) {
      return NextResponse.json({ success: false, message: "❌ ต้องระบุเหตุผล" }, { status: 400 });
    }

    // เลือกตาราง+คอลัมน์ตาม type
    const table = type === "borrow" ? "borrowing" : "reservation";
    const column = type === "borrow" ? "borrowID" : "reservationID";

    // 1) อัปเดตสถานะเป็น Rejected พร้อมบันทึก rejection_reason
    const [res1] = await pool.query(
      `UPDATE ${table} SET status = 'Rejected', rejection_reason = ? WHERE ${column} = ?`,
      [reason.trim(), id]
    );
    if (res1.affectedRows === 0) {
      return NextResponse.json({ success: false, message: "❌ ไม่พบรายการที่จะปฏิเสธ" }, { status: 404 });
    }

    // 2) ดึง equipmentID แล้วคืนสถานะอุปกรณ์เป็น Available
    const [[row]] = await pool.query(
      `SELECT equipmentID FROM ${table} WHERE ${column} = ?`,
      [id]
    );
    if (row?.equipmentID) {
      await pool.query(
        "UPDATE equipment SET status = 'Available' WHERE id = ?",
        [row.equipmentID]
      );
    }

    return NextResponse.json({ success: true, message: "✅ ปฏิเสธรายการเรียบร้อย" });
  } catch (error) {
    console.error(error);
    return NextResponse.json({ success: false, message: "❌ เกิดข้อผิดพลาด" }, { status: 500 });
  }
}
