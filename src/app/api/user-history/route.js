import { NextResponse } from "next/server";
import pool from "../../../../lib/mysql";

export async function GET(req) {
  try {
    const { searchParams } = new URL(req.url);
    const userId = searchParams.get("userId");
    if (!userId) {
      return NextResponse.json(
        { success: false, message: "userId is required" },
        { status: 400 }
      );
    }

    // ดึงรายการยืมจริง
    const [borrowRows] = await pool.query(
      `SELECT 
         b.borrowID      AS recordID,
         'Borrow'        AS type,
         e.id            AS equipmentId,
         e.equipment_code AS equipmentCode,
         e.name          AS equipmentName,
         b.startDate,
         b.endDate,
         b.courseCode,
         b.usageReason,
         b.status
       FROM borrowing b
       JOIN equipment e ON e.id = b.equipmentID
       WHERE b.userID = ?`,
      [userId]
    );

    // ดึงรายการจองล่วงหน้า
    const [resRows] = await pool.query(
      `SELECT 
         r.reservationID AS recordID,
         'Reservation'   AS type,
         e.id            AS equipmentId,
         e.equipment_code AS equipmentCode,
         e.name          AS equipmentName,
         r.startDate,
         r.endDate,
         r.courseCode,
         r.usageReason,
         r.status
       FROM reservation r
       JOIN equipment e ON e.id = r.equipmentID
       WHERE r.userID = ?`,
      [userId]
    );

    // รวมข้อมูลแล้วเรียงจากใหม่→เก่า
    const data = [...borrowRows, ...resRows].sort(
      (a, b) => new Date(b.startDate) - new Date(a.startDate)
    );

    return NextResponse.json({ success: true, data });
  } catch (error) {
    console.error("❌ User-history API error:", error);
    return NextResponse.json(
      { success: false, message: "Server error" },
      { status: 500 }
    );
  }
}
