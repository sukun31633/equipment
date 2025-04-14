import pool from '../../../../../lib/mysql';
import nodemailer from 'nodemailer';
import twilio from 'twilio';
import { NextResponse } from 'next/server';

// 1) สร้าง transporter สำหรับ Nodemailer โดยใช้บริการของ Gmail
const transporter = nodemailer.createTransport({
  service: 'gmail',
  auth: {
    user: process.env.GMAIL_USER,   // เช่น sukuntun31633@gmail.com
    pass: process.env.GMAIL_PASS,   // App Password ที่สร้างจาก Google Account
  },
});

// 2) สร้าง client สำหรับ Twilio
const twilioClient = twilio(
  process.env.TWILIO_ACCOUNT_SID,
  process.env.TWILIO_AUTH_TOKEN
);

/**
 * ฟังก์ชันแปลงเบอร์โทร: 
 * ถ้าเบอร์ขึ้นต้นด้วย "0" ให้เปลี่ยนเป็น "+66" เพื่อให้ถูกต้องตามรูปแบบ E.164 (Twilio)
 */
function formatPhone(phone) {
  phone = phone.trim();
  if (phone.startsWith("0")) {
    return "+66" + phone.slice(1);
  }
  return phone;
}

/**
 * ฟังก์ชันส่งอีเมล (Nodemailer)
 * - ในตัวอย่างนี้ override ให้ทุกอีเมลส่งไปที่ forcedEmail (สำหรับทดสอบ)
 */
const sendEmail = async (email, userName, subject, html) => {
  const forcedEmail = "sukuntun31633@gmail.com"; // ทดสอบ: ส่งทั้งหมดมาที่อีเมลนี้
  const mailOptions = {
    from: process.env.GMAIL_USER, // บัญชี Gmail ที่ตั้งค่าไว้ใน .env
    to: forcedEmail,              // override ให้ส่งเข้าอีเมลทดสอบ
    subject,
    html,
  };
  try {
    const info = await transporter.sendMail(mailOptions);
    console.log(`ส่งอีเมลแจ้งเตือนเรียบร้อยแล้ว: ${subject} (Message ID: ${info.messageId})`);
  } catch (error) {
    console.error("เกิดข้อผิดพลาดในการส่งอีเมล:", error);
  }
};

/**
 * ฟังก์ชันส่ง SMS (Twilio)
 * - ในตัวอย่าง override เบอร์โทรเป็นของทดสอบ (Twilio Trial) เช่น "0999719451"
 */
const sendSMS = async (phone, userName, message) => {
  const testPhone = "0999719451"; // สำหรับทดสอบ
  const formattedPhone = formatPhone(testPhone);
  try {
    const result = await twilioClient.messages.create({
      body: message,
      from: process.env.TWILIO_PHONE_NUMBER, // หมายเลข Twilio ที่ผูกไว้
      to: formattedPhone,
    });
    console.log(`ส่ง SMS แจ้งเตือนเรียบร้อยแล้ว: ${message}`);
    console.log("Twilio Response:", result);
  } catch (error) {
    console.error("เกิดข้อผิดพลาดในการส่ง SMS:", error);
  }
};

/**
 * ฟังก์ชันดึงค่าการตั้งค่าแจ้งเตือนของผู้ใช้ (userID = 641372) จากตาราง user
 * - เช็คคอลัมน์: smsNotification, emailNotification
 */
async function getUserNotificationSettings(userId) {
  // ตรวจสอบว่า userId ตรงกับ 641372 หรือไม่
  if (userId !== 641372) {
    // ถ้าไม่ใช่ 641372 อาจไม่ต้องส่งหรือ return disabled ทั้งสอง
    return { sms: "disabled", email: "disabled" };
  }

  try {
    const [rows] = await pool.query(`
      SELECT smsNotification, emailNotification
      FROM user
      WHERE userID = ?
    `, [userId]);

    if (!rows || rows.length === 0) {
      // ไม่พบ user
      return { sms: "disabled", email: "disabled" };
    }

    const row = rows[0];
    // สมมติว่าใน DB เก็บค่าเป็น 'enabled'/'disabled' อยู่แล้ว
    // หากเก็บเป็น 1/0 หรือ boolean ต้อง map ใหม่เป็น "enabled"/"disabled"
    return {
      sms: row.smsNotification || "disabled",      // ถ้าค่าว่างให้ถือว่า disabled
      email: row.emailNotification || "disabled",  // ถ้าค่าว่างให้ถือว่า disabled
    };
  } catch (error) {
    console.error("Error fetching user notification settings:", error);
    return { sms: "disabled", email: "disabled" };
  }
}

/**
 * API หลักสำหรับดึงรายการ Overdue / Borrowed แล้วส่งแจ้งเตือน (Email, SMS)
 */
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

    // 1) Query ข้อมูลจากตาราง borrowing
    const [overdueBorrow] = await pool.query(`
      SELECT * 
      FROM borrowing 
      WHERE DATE(endDate) = ? 
        AND status = "Overdue"
    `, [yesterdayFormatted]);
    const [borrowTomorrow] = await pool.query(`
      SELECT *
      FROM borrowing
      WHERE DATE(endDate) = ?
        AND status = "Borrowed"
    `, [tomorrowFormatted]);

    // 2) Query ข้อมูลจากตาราง reservation
    const [overdueReservation] = await pool.query(`
      SELECT *
      FROM reservation
      WHERE DATE(endDate) = ?
        AND status = "Overdue"
    `, [yesterdayFormatted]);
    const [reservationTomorrow] = await pool.query(`
      SELECT *
      FROM reservation
      WHERE DATE(endDate) = ?
        AND status = "Borrowed"
    `, [tomorrowFormatted]);

    // รวมรายการ Overdue กับ Borrowed (2 ประเภท) เข้าด้วยกัน
    const overdueRequests = [...overdueBorrow, ...overdueReservation];
    const tomorrowRequests = [...borrowTomorrow, ...reservationTomorrow];

    // === ส่วน Overdue ===
    for (let reqItem of overdueRequests) {
      const {
        borrowerName,
        reserverName,
        borrowerEmail,
        reserverEmail,
        borrowerPhone,
        reserverPhone,
        userID,
        endDate,
      } = reqItem;
      const userName = borrowerName || reserverName;
      const email = borrowerEmail || reserverEmail; 
      const phone = borrowerPhone || reserverPhone;

      // เรียกฟังก์ชันเช็คว่าผู้ใช้เปิด/ปิดการแจ้งเตือน
      const settings = await getUserNotificationSettings(userID);

      // ตรวจสอบค่า email/smsNotification = "enabled" ?
      if (settings.email === "enabled") {
        await sendEmail(
          email,
          userName,
          "การแจ้งเตือน: คุณยังไม่ได้คืนอุปกรณ์",
          `<p>เรียน คุณ ${userName},</p>
           <p>อุปกรณ์ที่คุณยืมมีวันคืนเป็น ${endDate} และเกินกำหนดคืนแล้ว 
              (แจ้งเตือนเมื่อวันถัดไปหลังจากวันคืน) 
              กรุณาคืนอุปกรณ์ทันที ภายในเวลาทำการ 8:30 - 16:30.</p>
           <p>ขอบคุณค่ะ!</p>`
        );
      }

      if (settings.sms === "enabled") {
        await sendSMS(
          phone,
          userName,
          `สวัสดีคุณ ${userName}, อุปกรณ์ที่คุณยืม (end: ${endDate}) เกินกำหนดแล้ว กรุณาคืนทันที.`
        );
      }
    }

    // === ส่วน Borrowed (เตือนให้คืนพรุ่งนี้) ===
    for (let reqItem of tomorrowRequests) {
      const {
        borrowerName,
        reserverName,
        borrowerEmail,
        reserverEmail,
        borrowerPhone,
        reserverPhone,
        userID,
        endDate,
      } = reqItem;
      const userName = borrowerName || reserverName;
      const email = borrowerEmail || reserverEmail; 
      const phone = borrowerPhone || reserverPhone;

      const settings = await getUserNotificationSettings(userID);

      if (settings.email === "enabled") {
        await sendEmail(
          email,
          userName,
          "การแจ้งเตือน: กรุณาคืนอุปกรณ์ในวันพรุ่งนี้",
          `<p>เรียน คุณ ${userName},</p>
           <p>อุปกรณ์ที่คุณยืมจะครบกำหนดคืนในวันพรุ่งนี้ (${endDate}). 
              กรุณาคืนอุปกรณ์ตามกำหนดเวลา (8:30 - 16:30).</p>
           <p>ขอบคุณค่ะ!</p>`
        );
      }

      if (settings.sms === "enabled") {
        await sendSMS(
          phone,
          userName,
          `สวัสดีคุณ ${userName}, อุปกรณ์ที่ยืม (end: ${endDate}) จะครบกำหนดคืนพรุ่งนี้ โปรดคืนตามกำหนด.`
        );
      }
    }

    return new NextResponse(
      JSON.stringify({
        success: true,
        message: "Reminders checked and notifications sent (if applicable).",
      }),
      { status: 200 }
    );
  } catch (error) {
    console.error("Error checking reminders and sending notifications:", error);
    return new NextResponse(
      JSON.stringify({
        success: false,
        message: "Error checking reminders and sending notifications.",
      }),
      { status: 500 }
    );
  }
}
