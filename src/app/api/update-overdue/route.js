import { NextResponse } from "next/server";
import pool from "../../../../lib/mysql";

export async function GET() {
  try {
    // ดึงเวลาปัจจุบันในรูปแบบ ISO string (วันที่และเวลา)
    const currentTimestamp = new Date().toISOString();
    console.log(`Current timestamp: ${currentTimestamp}`);

    // อัปเดตสถานะของรายการ Borrowed ที่เลยเวลา (endDate) ให้เป็น Overdue
    const [resultBorrow] = await pool.query(
      `UPDATE borrowing 
       SET status = 'Overdue' 
       WHERE status = 'Borrowed' AND endDate < ?`,
      [currentTimestamp]
    );
    console.log(`Updated borrowing: ${resultBorrow.affectedRows} record(s) to Overdue`);

    // ตรวจสอบในตาราง reservation (ถ้ามีรายการที่มีสถานะ Borrowed)
    const [resultResv] = await pool.query(
      `UPDATE reservation 
       SET status = 'Overdue' 
       WHERE status = 'Borrowed' AND endDate < ?`,
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
