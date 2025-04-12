// /app/api/notifications/checkReminders/route.js
import pool from '../../../../../lib/mysql';
import MailerSend from 'mailersend';
import twilio from 'twilio';

// ตั้งค่า MailerSend API Key
const mailersend = new MailerSend({ apiKey: process.env.MAILERSEND_API_KEY });
// ตั้งค่า Twilio API
const twilioClient = twilio(process.env.TWILIO_ACCOUNT_SID, process.env.TWILIO_AUTH_TOKEN);

// ฟังก์ชันส่งอีเมลแจ้งเตือน
const sendEmail = async (email, name, subject, html) => {
  const emailData = { from: 'sukuntun31633@gmail.com', to: email, subject, html };
  try {
    await mailersend.send(emailData);
    console.log(`ส่งอีเมลแจ้งเตือนเรียบร้อยแล้ว: ${subject}`);
  } catch (error) {
    console.error("เกิดข้อผิดพลาดในการส่งอีเมล:", error);
  }
};

// ฟังก์ชันส่ง SMS แจ้งเตือน
const sendSMS = async (phone, name, message) => {
  try {
    await twilioClient.messages.create({
      body: message,
      from: process.env.TWILIO_PHONE_NUMBER,
      to: phone,
    });
    console.log(`ส่ง SMS แจ้งเตือนเรียบร้อยแล้ว: ${message}`);
  } catch (error) {
    console.error("เกิดข้อผิดพลาดในการส่ง SMS:", error);
  }
};

export async function GET(req) {
  try {
    const today = new Date();
    const yesterday = new Date();
    yesterday.setDate(today.getDate() - 1);
    const tomorrow = new Date();
    tomorrow.setDate(today.getDate() + 1);

    const formatDate = (date) => date.toISOString().split("T")[0];
    const yesterdayFormatted = formatDate(yesterday);
    const tomorrowFormatted = formatDate(tomorrow);

    // Query borrowing
    const [overdueBorrowRequests] = await pool.query(
      'SELECT * FROM borrowing WHERE DATE(endDate) = ? AND status = "Overdue"',
      [yesterdayFormatted]
    );
    const [borrowRequests] = await pool.query(
      'SELECT * FROM borrowing WHERE DATE(endDate) = ? AND status = "Borrowed"',
      [tomorrowFormatted]
    );

    // Query reservation
    const [overdueReservationRequests] = await pool.query(
      'SELECT * FROM reservation WHERE DATE(endDate) = ? AND status = "Overdue"',
      [yesterdayFormatted]
    );
    const [reservationRequests] = await pool.query(
      'SELECT * FROM reservation WHERE DATE(endDate) = ? AND status = "Borrowed"',
      [tomorrowFormatted]
    );

    // รวมรายการทั้งหมด
    const overdueRequests = [...overdueBorrowRequests, ...overdueReservationRequests];
    const tomorrowRequests = [...borrowRequests, ...reservationRequests];

    // ส่งแจ้งเตือนสำหรับรายการที่เลยกำหนด (Overdue) 
    for (let request of overdueRequests) {
      const { borrowerName, reserverName, borrowerEmail, reserverEmail, borrowerPhone, reserverPhone } = request;
      const name = borrowerName || reserverName;
      const email = borrowerEmail || reserverEmail;
      const phone = borrowerPhone || reserverPhone;
      
      // ส่งแจ้งเตือน Overdue
      await sendEmail(
        email,
        name,
        'การแจ้งเตือน: คุณยังไม่ได้คืนอุปกรณ์',
        `<p>เรียน คุณ ${name},</p><p>อุปกรณ์ที่คุณยืมเลยกำหนดคืนแล้ว กรุณาคืนอุปกรณ์ทันที</p><p>ขอบคุณค่ะ!</p>`
      );
      await sendSMS(
        phone,
        name,
        `สวัสดีคุณ ${name}, อุปกรณ์ที่คุณยืมเลยกำหนดคืนแล้ว กรุณาคืนอุปกรณ์ทันที.`
      );
    }

    // ส่งแจ้งเตือนสำหรับรายการที่ต้องคืนในวันพรุ่งนี้ (Borrowed)
    for (let request of tomorrowRequests) {
      const { borrowerName, reserverName, borrowerEmail, reserverEmail, borrowerPhone, reserverPhone } = request;
      const name = borrowerName || reserverName;
      const email = borrowerEmail || reserverEmail;
      const phone = borrowerPhone || reserverPhone;

      // ส่งแจ้งเตือนสำหรับวันพรุ่งนี้
      await sendEmail(
        email,
        name,
        'การแจ้งเตือน: กรุณาคืนอุปกรณ์ในวันพรุ่งนี้',
        `<p>เรียน คุณ ${name},</p><p>นี่คือการแจ้งเตือนว่าอุปกรณ์ที่คุณยืมจะครบกำหนดคืนในวันพรุ่งนี้ กรุณาคืนอุปกรณ์ตามกำหนดเวลา</p><p>ขอบคุณค่ะ!</p>`
      );
      await sendSMS(
        phone,
        name,
        `สวัสดีคุณ ${name}, อุปกรณ์ที่คุณยืมจะครบกำหนดคืนในวันพรุ่งนี้ กรุณาคืนอุปกรณ์ตามกำหนดเวลา.`
      );
    }

    return new Response(
      JSON.stringify({
        success: true,
        message: "Reminders checked and notifications sent (if applicable).",
        overdueBorrowRequests,
        borrowRequests,
        overdueReservationRequests,
        reservationRequests,
      }),
      { status: 200 }
    );
  } catch (error) {
    console.error('Error checking reminders and sending notifications:', error);
    return new Response(
      JSON.stringify({
        success: false,
        message: "Error checking reminders and sending notifications."
      }),
      { status: 500 }
    );
  }
}
