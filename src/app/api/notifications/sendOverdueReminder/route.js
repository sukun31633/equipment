// /app/api/notifications/sendOverdueReminder/route.js
import MailerSend from 'mailersend';
import twilio from 'twilio';
import pool from '../../../../lib/mysql';

// ตั้งค่า MailerSend API Key
const mailersend = new MailerSend({ apiKey: process.env.MAILERSEND_API_KEY });

// ตั้งค่า Twilio API
const twilioClient = twilio(process.env.TWILIO_ACCOUNT_SID, process.env.TWILIO_AUTH_TOKEN);

// ฟังก์ชันส่งอีเมล
const sendEmailOverdueReminder = async (email, name) => {
    const emailData = {
      from: 'sukuntun31633@gmail.com',
      to: email,
      subject: 'การแจ้งเตือน: คุณยังไม่ได้คืนอุปกรณ์',
      html: `<p>เรียน คุณ ${name},</p><p>อุปกรณ์ที่คุณยืมได้เลยกำหนดคืนแล้ว กรุณาคืนอุปกรณ์ทันที</p><p>ขอบคุณค่ะ!</p>`,
    };
  
    try {
      await mailersend.send(emailData);
      console.log('การแจ้งเตือนทางอีเมลส่งเรียบร้อยแล้ว');
    } catch (error) {
      console.error('เกิดข้อผิดพลาดในการส่งอีเมล:', error);
    }
  };
  
  // ฟังก์ชันส่ง SMS
  const sendSMSOverdueReminder = async (phoneNumber, name) => {
    try {
      await twilioClient.messages.create({
        body: `สวัสดีคุณ ${name}, อุปกรณ์ที่คุณยืมเลยกำหนดคืนแล้ว กรุณาคืนอุปกรณ์ทันที.`,
        from: process.env.TWILIO_PHONE_NUMBER,
        to: phoneNumber,
      });
      console.log('การแจ้งเตือนทาง SMS ส่งเรียบร้อยแล้ว');
    } catch (error) {
      console.error('เกิดข้อผิดพลาดในการส่ง SMS:', error);
    }
  };

// API route handler
export async function POST(req) {
  const yesterday = new Date();
  yesterday.setDate(yesterday.getDate() - 1); // วันก่อนหน้า

  try {
    // ดึงข้อมูลจากทั้ง 2 ตาราง borrows และ reservation
    const [borrowRequests] = await pool.query(
      'SELECT * FROM borrowing WHERE endDate = ? AND status = "Overdue"',
      [yesterday]
    );

    const [reservationRequests] = await pool.query(
      'SELECT * FROM reservation WHERE endDate = ? AND status = "Overdue"',
      [yesterday]
    );

    // รวมข้อมูลจากทั้งสองตาราง
    const allRequests = [...borrowRequests, ...reservationRequests];

    // ส่งการแจ้งเตือนให้กับผู้ที่เลยกำหนดคืนแล้ว
    for (let request of allRequests) {
      const { borrowerName, reserverName, borrowerEmail, reserverEmail, borrowerPhone, reserverPhone } = request;

      const name = borrowerName || reserverName;
      const email = borrowerEmail || reserverEmail;
      const phone = borrowerPhone || reserverPhone;

      await sendEmailOverdueReminder(email, name);
      await sendSMSOverdueReminder(phone, name);
    }

    return new Response(
      JSON.stringify({ success: true, message: 'Overdue reminders sent successfully.' }),
      { status: 200 }
    );
  } catch (error) {
    console.error('Error sending overdue reminders:', error);
    return new Response(
      JSON.stringify({ success: false, message: 'Error sending overdue reminders.' }),
      { status: 500 }
    );
  }
}
