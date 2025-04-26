// app/api/notifications/checkReminders/route.js

import pool from '../../../../../lib/mysql';
import nodemailer from 'nodemailer';
import twilio from 'twilio';
import { NextResponse } from 'next/server';

// 1) สร้าง transporter สำหรับ Nodemailer โดยใช้ Gmail
const transporter = nodemailer.createTransport({
  service: 'gmail',
  auth: {
    user: process.env.GMAIL_USER,   // เช่น sukuntun31633@gmail.com
    pass: process.env.GMAIL_PASS,   // App Password ที่สร้างจาก Google Account
  },
});

// 2) สร้าง Twilio client
const twilioClient = twilio(
  process.env.TWILIO_ACCOUNT_SID,
  process.env.TWILIO_AUTH_TOKEN
);

// แปลงเบอร์โทรให้เป็น E.164 (+66...)
function formatPhone(phone) {
  const p = phone.trim();
  return p.startsWith('0') ? '+66' + p.slice(1) : p;
}

// ส่งอีเมลจริงไปยังอีเมลจากฐานข้อมูล
async function sendEmail(to, subject, html) {
  try {
    await transporter.sendMail({
      from: process.env.GMAIL_USER,
      to,      // ← ส่งไปยังอีเมลของผู้ใช้ที่ดึงจากตาราง user
      subject,
      html,
    });
    console.log(`✅ Email sent to ${to}: ${subject}`);
  } catch (err) {
    console.error(`❌ Failed to send email to ${to}:`, err);
  }
}

// ส่ง SMS ไปยังเบอร์ทดสอบคงที่
async function sendSMS(message) {
  const TEST_PHONE = '0999719451';
  const to = formatPhone(TEST_PHONE);
  try {
    await twilioClient.messages.create({
      body: message,
      from: process.env.TWILIO_PHONE_NUMBER,
      to,
    });
    console.log(`✅ SMS sent to ${to}: ${message}`);
  } catch (err) {
    console.error(`❌ Failed to send SMS to ${to}:`, err);
  }
}

// อ่าน setting ว่า user ปิด/เปิด แจ้งเตือน
async function getUserNotificationSettings(userID) {
  try {
    const [rows] = await pool.query(
      `SELECT smsNotification, emailNotification
       FROM user
       WHERE userID = ?`,
      [userID]
    );
    if (!rows.length) return { sms: 'disabled', email: 'disabled' };
    const { smsNotification, emailNotification } = rows[0];
    return {
      sms: smsNotification === 'enabled' ? 'enabled' : 'disabled',
      email: emailNotification === 'enabled' ? 'enabled' : 'disabled',
    };
  } catch (err) {
    console.error('Error fetching notification settings:', err);
    return { sms: 'disabled', email: 'disabled' };
  }
}

export async function GET() {
  try {
    const today = new Date();
    const fmt = d => d.toISOString().slice(0, 10);
    const yesterday = new Date(today);
    yesterday.setDate(today.getDate() - 1);
    const tomorrow = new Date(today);
    tomorrow.setDate(today.getDate() + 1);

    const dY = fmt(yesterday), dT = fmt(tomorrow);

    // ดึง Overdue เมื่อวาน พร้อม JOIN ดึงอีเมลจาก user
    const [overdueBorrow] = await pool.query(
      `SELECT b.*, u.email AS userEmail, u.userID
       FROM borrowing b
       JOIN user u ON b.userID = u.userID
       WHERE DATE(b.endDate)=? AND b.status='Overdue'`,
      [dY]
    );
    const [overdueRes] = await pool.query(
      `SELECT r.*, u.email AS userEmail, u.userID
       FROM reservation r
       JOIN user u ON r.userID = u.userID
       WHERE DATE(r.endDate)=? AND r.status='Overdue'`,
      [dY]
    );

    // ดึงจะครบกำหนดคืนพรุ่งนี้ พร้อม JOIN ดึงอีเมลจาก user
    const [borrowTomorrow] = await pool.query(
      `SELECT b.*, u.email AS userEmail, u.userID
       FROM borrowing b
       JOIN user u ON b.userID = u.userID
       WHERE DATE(b.endDate)=? AND b.status='Borrowed'`,
      [dT]
    );
    const [resTomorrow] = await pool.query(
      `SELECT r.*, u.email AS userEmail, u.userID
       FROM reservation r
       JOIN user u ON r.userID = u.userID
       WHERE DATE(r.endDate)=? AND r.status='Borrowed'`,
      [dT]
    );

    const overdueList = [...overdueBorrow, ...overdueRes];
    const reminderList = [...borrowTomorrow, ...resTomorrow];

    // 1) แจ้งเตือน Overdue
    for (const item of overdueList) {
      const name  = item.borrowerName  || item.reserverName;
      const email = item.userEmail;      // ← ใช้ email จาก user table
      const settings = await getUserNotificationSettings(item.userID);

      if (settings.email === 'enabled') {
        await sendEmail(
          email,
          '🔔 แจ้งเตือน: เกินกำหนดคืนอุปกรณ์',
          `<p>เรียน คุณ ${name},</p>
           <p>อุปกรณ์ครบกำหนดคืนเมื่อ ${item.endDate} และยังไม่คืน</p>
           <p>กรุณาคืนอุปกรณ์โดยด่วน ชั้น 4</p>`
        );
      }
      if (settings.sms === 'enabled') {
        await sendSMS(
          `📱 คุณ ${name}, อุปกรณ์ครบกำหนดคืน ${item.endDate} เกินกำหนดแล้ว กรุณาคืนทันที`
        );
      }
    }

    // 2) แจ้งเตือนจะครบกำหนดคืนพรุ่งนี้
    for (const item of reminderList) {
      const name  = item.borrowerName  || item.reserverName;
      const email = item.userEmail;
      const settings = await getUserNotificationSettings(item.userID);

      if (settings.email === 'enabled') {
        await sendEmail(
          email,
          '🔔 แจ้งเตือน: คืนอุปกรณ์พรุ่งนี้',
          `<p>เรียน คุณ ${name},</p>
           <p>อุปกรณ์จะครบกำหนดคืนพรุ่งนี้ (${item.endDate})</p>
           <p>กรุณาคืนตามกำหนด ชั้น 4</p>`
        );
      }
      if (settings.sms === 'enabled') {
        await sendSMS(
          `📱 คุณ ${name}, อุปกรณ์จะครบกำหนดคืนพรุ่งนี้ (${item.endDate}) โปรดคืนตามกำหนด `
        );
      }
    }

    return NextResponse.json({
      success: true,
      message: 'Notifications processed',
    });
  } catch (err) {
    console.error('Error in checkReminders:', err);
    return NextResponse.json(
      { success: false, message: err.message },
      { status: 500 }
    );
  }
}
