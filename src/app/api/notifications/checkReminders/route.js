// /app/api/notifications/checkReminders/route.js
import pool from '../../../../lib/mysql'; // อัปเดตเส้นทางให้ตรงกับโปรเจกต์ของคุณ

export async function GET(req) {
  const today = new Date();
  const tomorrow = new Date();
  tomorrow.setDate(today.getDate() + 1); // วันถัดไป
  const yesterday = new Date();
  yesterday.setDate(today.getDate() - 1); // วันก่อนหน้า

  try {
    // ตรวจสอบรายการการยืมที่ครบกำหนดคืน (borrow)
    const [overdueBorrowRequests] = await pool.query(
      'SELECT * FROM borrowing WHERE endDate = ? AND status = "Overdue"',
      [yesterday]
    );

    // ตรวจสอบรายการการยืมที่ต้องคืนในวันพรุ่งนี้
    const [borrowRequests] = await pool.query(
      'SELECT * FROM borrowing WHERE endDate = ? AND status = "Borrowed"',
      [tomorrow]
    );

    // ตรวจสอบรายการการจองที่ครบกำหนดคืน (reservation)
    const [overdueReservationRequests] = await pool.query(
      'SELECT * FROM reservation WHERE endDate = ? AND status = "Overdue"',
      [yesterday]
    );

    // ตรวจสอบรายการการจองที่ต้องคืนในวันพรุ่งนี้
    const [reservationRequests] = await pool.query(
      'SELECT * FROM reservation WHERE endDate = ? AND status = "Reserved"',
      [tomorrow]
    );

    // ส่งข้อมูลที่ได้กลับมา
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
