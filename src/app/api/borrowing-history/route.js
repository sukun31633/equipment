// src/app/api/borrowing-history/route.js
import { NextResponse } from "next/server";
import pool from "../../../../lib/mysql";

export async function GET(request) {
  try {
    const { searchParams } = new URL(request.url);
    const equipmentId = searchParams.get("equipmentId");
    if (!equipmentId) {
      return NextResponse.json({ success: false, message: "equipmentId is required" }, { status: 400 });
    }

    // ↑↑↑ ดึงชื่ออุปกรณ์ + รหัสอุปกรณ์ ↑↑↑
    const [[equipment]] = await pool.execute(
      `SELECT name, equipment_code
       FROM equipment
       WHERE id = ?`,
      [equipmentId]
    );

    // ↓↓↓ ดึงประวัติการยืมจริง ↓↓↓
    const [borrowRows] = await pool.execute(
      `SELECT
         b.borrowID       AS recordID,
         b.userID         AS userId,
         u.Name           AS userName,
         b.courseCode     AS courseCode,
         b.startDate      AS startDate,
         b.endDate        AS endDate,
         b.usageReason    AS usageReason,
         b.status         AS status,
         'Borrow'         AS type
       FROM borrowing b
       JOIN user u ON u.userID = b.userID
       WHERE b.equipmentID = ?`,
      [equipmentId]
    );

    // ↓↓↓ ดึงประวัติการจองล่วงหน้า ↓↓↓
    const [resRows] = await pool.execute(
      `SELECT
         r.reservationID  AS recordID,
         r.userID         AS userId,
         u.Name           AS userName,
         r.courseCode     AS courseCode,
         r.startDate      AS startDate,
         r.endDate        AS endDate,
         r.usageReason    AS usageReason,
         r.status         AS status,
         'Reservation'    AS type
       FROM reservation r
       JOIN user u ON u.userID = r.userID
       WHERE r.equipmentID = ?`,
      [equipmentId]
    );

    // รวมและเรียงตามวันที่เริ่ม (ใหม่ → เก่า)
    const data = [...borrowRows, ...resRows].sort(
      (a, b) => new Date(b.startDate) - new Date(a.startDate)
    );

    return NextResponse.json({
      success: true,
      equipment,
      data,
    });
  } catch (error) {
    console.error("DB error:", error);
    return NextResponse.json({ success: false, message: "Server error" }, { status: 500 });
  }
}
