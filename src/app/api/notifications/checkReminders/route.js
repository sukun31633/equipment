// /app/api/notifications/checkReminders/route.js
import pool from '../../../../lib/mysql'; // ตรวจสอบเส้นทางให้ตรงกับโปรเจกต์ของคุณ

export async function GET(req) {
  try {
    // คำนวณวันที่
    const today = new Date();
    const yesterday = new Date();
    yesterday.setDate(today.getDate() - 1);
    const tomorrow = new Date();
    tomorrow.setDate(today.getDate() + 1);

    // ฟังก์ชันแปลงวันที่เป็นรูปแบบ "YYYY-MM-DD"
    const formatDate = (date) => date.toISOString().split("T")[0];

    const yesterdayFormatted = formatDate(yesterday);
    const tomorrowFormatted = formatDate(tomorrow);

    // Query สำหรับ borrowing ที่กำหนดคืนเมื่อวานและมีสถานะ Overdue
    const [overdueBorrowRequests] = await pool.query(
      'SELECT * FROM borrowing WHERE DATE(endDate) = ? AND status = "Overdue"',
      [yesterdayFormatted]
    );

    // Query สำหรับ borrowing ที่กำหนดคืนวันพรุ่งนี้และมีสถานะ Borrowed
    const [borrowRequests] = await pool.query(
      'SELECT * FROM borrowing WHERE DATE(endDate) = ? AND status = "Borrowed"',
      [tomorrowFormatted]
    );

    // Query สำหรับ reservation ที่กำหนดคืนเมื่อวานและมีสถานะ Overdue
    const [overdueReservationRequests] = await pool.query(
      'SELECT * FROM reservation WHERE DATE(endDate) = ? AND status = "Overdue"',
      [yesterdayFormatted]
    );

    // Query สำหรับ reservation ที่กำหนดคืนวันพรุ่งนี้และมีสถานะ Reserved
    const [reservationRequests] = await pool.query(
      'SELECT * FROM reservation WHERE DATE(endDate) = ? AND status = "Reserved"',
      [tomorrowFormatted]
    );

    // ส่งผลลัพธ์กลับมาในรูปแบบ JSON
    return new Response(
      JSON.stringify({
        success: true,
        overdueBorrowRequests,
        borrowRequests,
        overdueReservationRequests,
        reservationRequests,
      }),
      { status: 200 }
    );
  } catch (error) {
    console.error('Error fetching overdue borrow and reservation requests:', error);
    return new Response(
      JSON.stringify({ success: false, message: 'Error fetching overdue borrow and reservation requests' }),
      { status: 500 }
    );
  }
}
