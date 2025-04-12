import pool from '../../../../../lib/mysql';
import { MailerSend } from 'mailersend';  // Import แบบ destructuring
import twilio from 'twilio';

const mailersend = new MailerSend({ api_key: process.env.MAILERSEND_API_KEY });
const twilioClient = twilio(process.env.TWILIO_ACCOUNT_SID, process.env.TWILIO_AUTH_TOKEN);

// ฟังก์ชันแปลงเบอร์โทร: ถ้าเบอร์ขึ้นต้นด้วย "0" ให้แปลงเป็น "+66" ตามรูปแบบ E.164
function formatPhone(phone) {
  phone = phone.trim();
  if (phone.startsWith("0")) {
    return "+66" + phone.slice(1);
  }
  return phone;
}

// ฟังก์ชันส่งอีเมลแจ้งเตือนโดยใช้ MailerSend
const sendEmail = async (email, name, subject, html) => {
  const emailData = { from: 'sukuntun31633@gmail.com', to: email, subject, html };
  try {
    await mailersend.email.send(emailData);
    console.log(`ส่งอีเมลแจ้งเตือนเรียบร้อยแล้ว: ${subject}`);
  } catch (error) {
    console.error("เกิดข้อผิดพลาดในการส่งอีเมล:", error);
  }
};

// ฟังก์ชันส่ง SMS แจ้งเตือนโดยใช้ Twilio
const sendSMS = async (phone, name, message) => {
  if (!phone) {
    console.error("ไม่พบเบอร์โทรสำหรับส่ง SMS, ใช้เบอร์ทดสอบแทน");
    phone = "0999719451";
  }
  const formattedPhone = formatPhone(phone);
  try {
    await twilioClient.messages.create({
      body: message,
      from: process.env.TWILIO_PHONE_NUMBER,
      to: formattedPhone,
    });
    console.log(`ส่ง SMS แจ้งเตือนเรียบร้อยแล้ว: ${message}`);
  } catch (error) {
    console.error("เกิดข้อผิดพลาดในการส่ง SMS:", error);
  }
};

// ฟังก์ชันสำหรับดึงค่าการตั้งค่าแจ้งเตือนของผู้ใช้จาก API user-preferences
const getUserNotificationSettings = async (userId) => {
  try {
    const res = await fetch(`${process.env.NEXTAUTH_URL || ''}/api/notifications/user-preferences?userId=${userId}`);
    const data = await res.json();
    if (data.success) {
      return {
        sms: data.smsNotification,   // "enabled" หรือ "disabled"
        email: data.emailNotification, // "enabled" หรือ "disabled"
      };
    }
  } catch (error) {
    console.error("Error fetching notification settings for user:", userId, error);
  }
  return { sms: "disabled", email: "disabled" };
};

export async function GET(req) {
  try {
    // คำนวณวันที่ในรูปแบบ "YYYY-MM-DD"
    const today = new Date();
    const yesterday = new Date();
    yesterday.setDate(today.getDate() - 1);
    const tomorrow = new Date();
    tomorrow.setDate(today.getDate() + 1);
    
    const formatDate = (date) => date.toISOString().split("T")[0];
    const yesterdayFormatted = formatDate(yesterday);
    const tomorrowFormatted = formatDate(tomorrow);

    // ดึงข้อมูลจากตาราง borrowing
    const [overdueBorrowRequests] = await pool.query(
      'SELECT * FROM borrowing WHERE DATE(endDate) = ? AND status = "Overdue"',
      [yesterdayFormatted]
    );
    const [borrowRequests] = await pool.query(
      'SELECT * FROM borrowing WHERE DATE(endDate) = ? AND status = "Borrowed"',
      [tomorrowFormatted]
    );

    // ดึงข้อมูลจากตาราง reservation
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

    // ส่งแจ้งเตือนสำหรับรายการ Overdue
    for (let request of overdueRequests) {
      const { borrowerName, reserverName, borrowerEmail, reserverEmail, borrowerPhone, reserverPhone, userID, endDate } = request;
      const userName = borrowerName || reserverName;
      const email = borrowerEmail || reserverEmail;
      const phone = borrowerPhone || reserverPhone;
      const settings = await getUserNotificationSettings(userID);

      if (settings.email === "enabled") {
        await sendEmail(
          email,
          userName,
          'การแจ้งเตือน: คุณยังไม่ได้คืนอุปกรณ์',
          `<p>เรียน คุณ ${userName},</p>
           <p>อุปกรณ์ที่คุณยืมมีวันคืนเป็น ${endDate} และเกินกำหนดคืนแล้ว (แจ้งเตือนเมื่อวันถัดไปหลังจากวันคืน) กรุณาคืนอุปกรณ์ทันที</p>
           <p>ขอบคุณค่ะ!</p>`
        );
      }
      if (settings.sms === "enabled") {
        await sendSMS(
          phone,
          userName,
          `สวัสดีคุณ ${userName}, อุปกรณ์ที่คุณยืมมีวันคืนเป็น ${endDate} และเกินกำหนดคืนแล้ว กรุณาคืนอุปกรณ์ทันที.`
        );
      }
    }

    // ส่งแจ้งเตือนสำหรับรายการ Borrowed (แจ้งให้คืนในวันพรุ่งนี้)
    for (let request of tomorrowRequests) {
      const { borrowerName, reserverName, borrowerEmail, reserverEmail, borrowerPhone, reserverPhone, userID, endDate } = request;
      const userName = borrowerName || reserverName;
      const email = borrowerEmail || reserverEmail;
      const phone = borrowerPhone || reserverPhone;
      const settings = await getUserNotificationSettings(userID);

      if (settings.email === "enabled") {
        await sendEmail(
          email,
          userName,
          'การแจ้งเตือน: กรุณาคืนอุปกรณ์ในวันพรุ่งนี้',
          `<p>เรียน คุณ ${userName},</p>
           <p>นี่คือการแจ้งเตือนว่าอุปกรณ์ที่คุณยืมจะครบกำหนดคืนในวันพรุ่งนี้ (${endDate}). กรุณาคืนอุปกรณ์ตามกำหนดเวลา</p>
           <p>ขอบคุณค่ะ!</p>`
        );
      }
      if (settings.sms === "enabled") {
        await sendSMS(
          phone,
          userName,
          `สวัสดีคุณ ${userName}, อุปกรณ์ที่คุณยืมจะครบกำหนดคืนในวันพรุ่งนี้ (${endDate}). กรุณาคืนอุปกรณ์ตามกำหนดเวลา.`
        );
      }
    }

    return new Response(
      JSON.stringify({
        success: true,
        message: "Reminders checked and notifications sent (if applicable).",
        overdueBorrowRequests,
        overdueReservationRequests,
        borrowRequests,
        reservationRequests,
      }),
      { status: 200 }
    );
  } catch (error) {
    console.error("Error checking reminders and sending notifications:", error);
    return new Response(
      JSON.stringify({ success: false, message: "Error checking reminders and sending notifications." }),
      { status: 500 }
    );
  }
}
