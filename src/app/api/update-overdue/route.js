import { NextResponse } from "next/server";
import pool from "../../../../lib/mysql";

export async function GET() {
  try {
    // ดึงเวลาปัจจุบันในรูปแบบ ISO string (วันที่และเวลา)
    const currentTimestamp = new Date().toISOString();
    console.log(`Current timestamp: ${currentTimestamp}`);

    // อัปเดตสถานะของรายการ Borrowed ที่เลยเวลา (endDate+1 วัน) ให้เป็น Overdue
    const [resultBorrow] = await pool.query(
      `UPDATE borrowing 
       SET status = 'Overdue' 
       WHERE status = 'Borrowed' AND DATE_ADD(endDate, INTERVAL 1 DAY) < ?`,
      [currentTimestamp]
    );
    console.log(`Updated borrowing: ${resultBorrow.affectedRows} record(s) to Overdue`);

    // อัปเดตสถานะของรายการในตาราง reservation ที่มีสถานะ Borrowed เมื่อเกินเวลาคืน+1 วัน
    const [resultResv] = await pool.query(
      `UPDATE reservation 
       SET status = 'Overdue' 
       WHERE status = 'Borrowed' AND DATE_ADD(endDate, INTERVAL 1 DAY) < ?`,
      [currentTimestamp]
    );
    console.log(`Updated reservation: ${resultResv.affectedRows} record(s) to Overdue`);

    return NextResponse.json({
      success: true,
      message: `Updated ${resultBorrow.affectedRows + resultResv.affectedRows} record(s) to Overdue`,
    });
  } catch (error) {
    console.error("Error updating overdue records:", error);
    return NextResponse.json(
      { success: false, message: error.message },
      { status: 500 }
    );
  }
}
