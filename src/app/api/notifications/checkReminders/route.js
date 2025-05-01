// app/api/notifications/checkReminders/route.js

import pool from '../../../../../lib/mysql';
import nodemailer from 'nodemailer';
import twilio from 'twilio';
import { NextResponse } from 'next/server';
import dayjs from 'dayjs';

// 1) สร้าง transporter สำหรับ Nodemailer โดยใช้ Gmail
const transporter = nodemailer.createTransport({
  service: 'gmail',
  auth: {
    user: process.env.GMAIL_USER,
    pass: process.env.GMAIL_PASS,
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

// helper: ฟอร์แมตรูปแบบวันที่เป็น DD-MM-YYYY
function formatDate(date) {
  return dayjs(date).format('DD-MM-YYYY');
}

// ส่งอีเมลจริงไปยังอีเมลจากฐานข้อมูล
async function sendEmail(to, subject, html) {
  try {
    await transporter.sendMail({
      from: process.env.GMAIL_USER,
      to,
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
      `SELECT smsNotification, emailNotification FROM user WHERE userID = ?`,
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
      const name = item.borrowerName || item.reserverName;
      const email = item.userEmail;
      const settings = await getUserNotificationSettings(item.userID);
      const dateStr = formatDate(item.endDate);

      // แจ้งเตือนผู้ใช้ทางอีเมล (ถ้าเปิด)
      if (settings.email === 'enabled') {
        await sendEmail(
          email,
          '🔔 แจ้งเตือน: เกินกำหนดคืนอุปกรณ์',
          `<p>เรียน คุณ ${name},</p>
           <p>อุปกรณ์ครบกำหนดคืนเมื่อ ${dateStr} และยังไม่คืน</p>
           <p>กรุณาคืนอุปกรณ์โดยด่วน ชั้น 4</p>`
        );
      }
      // ส่งสำเนาแจ้งเตือนให้เจ้าหน้าที่เสมอ
      await sendEmail(
        'jingpt888@gmail.com',
        `📋 แจ้งเตือนเกินกำหนด: ${name}`,
        `<p>ผู้ใช้: ${name} (${item.userID})</p>
         <p>สถานะ: ${item.status}</p>
         <p>ครบกำหนด: ${dateStr} (เกินกำหนดคืนอุปกรณ์)</p>`
      );
      // ส่ง SMS ให้เจ้าหน้าที่เสมอ
      await sendSMS(
        `📱 เจ้าหน้าที่: ผู้ใช้ ${name} (${item.userID}) สถานะ ${item.status} ครบกำหนด ${dateStr}`
      );

      // แจ้งเตือนทาง SMS (ถ้าเปิด)
      if (settings.sms === 'enabled') {
        await sendSMS(
          `📱 คุณ ${name}, อุปกรณ์ครบกำหนดคืน ${dateStr} เกินกำหนดแล้ว กรุณาคืนทันที`
        );
      }
    }

    // 2) แจ้งเตือนจะครบกำหนดคืนพรุ่งนี้
    for (const item of reminderList) {
      const name = item.borrowerName || item.reserverName;
      const email = item.userEmail;
      const settings = await getUserNotificationSettings(item.userID);
      const dateStr = formatDate(item.endDate);

      // แจ้งเตือนผู้ใช้ทางอีเมล (ถ้าเปิด)
      if (settings.email === 'enabled') {
        await sendEmail(
          email,
          '🔔 แจ้งเตือน: คืนอุปกรณ์พรุ่งนี้',
          `<p>เรียน คุณ ${name},</p>
           <p>อุปกรณ์จะครบกำหนดคืนพรุ่งนี้ (${dateStr})</p>
           <p>กรุณาคืนตามกำหนด ชั้น 4</p>`
        );
      }
      // ส่งสำเนาแจ้งเตือนให้เจ้าหน้าที่เสมอ
      await sendEmail(
        'jingpt888@gmail.com',
        `📋 แจ้งเตือนล่วงหน้า: ${name}`,
        `<p>ผู้ใช้: ${name} (${item.userID})</p>
         <p>สถานะ: ${item.status}</p>
         <p>ครบกำหนด: ${dateStr} (อุปกรณ์จะครบกำหนดคืนพรุ่งนี้)</p>`
      );
      // ส่ง SMS ให้เจ้าหน้าที่เสมอ
      await sendSMS(
        `📱 เจ้าหน้าที่: ผู้ใช้ ${name} (${item.userID}) สถานะ ${item.status} ครบกำหนดพรุ่งนี้ ${dateStr}`
      );

      // แจ้งเตือนทาง SMS (ถ้าเปิด)
      if (settings.sms === 'enabled') {
        await sendSMS(
          `📱 คุณ ${name}, อุปกรณ์จะครบกำหนดคืนพรุ่งนี้ (${dateStr}) โปรดคืนตามกำหนด`
        );
      }
    }

    return NextResponse.json({ success: true, message: 'Notifications processed' });
  } catch (err) {
    console.error('Error in checkReminders:', err);
    return NextResponse.json({ success: false, message: err.message }, { status: 500 });
  }
}
