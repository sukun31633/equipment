import { NextResponse } from 'next/server';
import pool from '../../../../../lib/mysql';
import nodemailer from 'nodemailer';
import twilio from 'twilio';

// -- ฟังก์ชันส่ง Email --
const transporter = nodemailer.createTransport({
  service: 'gmail',
  auth: {
    user: process.env.GMAIL_USER,
    pass: process.env.GMAIL_PASS,
  },
});

async function sendEmail(to, subject, html) {
  try {
    await transporter.sendMail({
      from: process.env.GMAIL_USER,
      to,
      subject,
      html,
    });
    console.log(`✅ Email sent to ${to}`);
  } catch (err) {
    console.error(`❌ Failed to send Email to ${to}:`, err);
  }
}

// -- ฟังก์ชันส่ง SMS --
const twilioClient = twilio(process.env.TWILIO_ACCOUNT_SID, process.env.TWILIO_AUTH_TOKEN);

// ❗ ใช้เบอร์นี้เสมอสำหรับ SMS
const ADMIN_PHONE_NUMBER = '0999719451';

async function sendSMS(message) {
  try {
    const to = ADMIN_PHONE_NUMBER.startsWith('0') ? '+66' + ADMIN_PHONE_NUMBER.slice(1) : ADMIN_PHONE_NUMBER;
    await twilioClient.messages.create({
      body: message,
      from: process.env.TWILIO_PHONE_NUMBER,
      to,
    });
    console.log(`✅ SMS sent to ${to}`);
  } catch (err) {
    console.error(`❌ Failed to send SMS to ${ADMIN_PHONE_NUMBER}:`, err);
  }
}

// -- ฟังก์ชันหลัก แจ้งเตือนผู้ใช้เมื่ออนุมัติหรือปฏิเสธ --
async function notifyUserApproval({ userID, equipmentName, status, type }) {
  try {
    const [[user]] = await pool.query(
      `SELECT email, smsNotification, emailNotification FROM user WHERE userID = ?`,
      [userID]
    );

    if (!user) {
      console.error('❌ ไม่พบข้อมูลผู้ใช้ userID:', userID);
      return;
    }

    const { email, smsNotification, emailNotification } = user;
    const actionText = status === 'approved' ? 'อนุมัติ' : 'ปฏิเสธ';
    const typeText = type === 'borrow' ? 'การยืม' : 'การจอง';

    const emailSubject = `📢 แจ้งเตือน: ผลการ${typeText}อุปกรณ์`;
    const emailBody = `
      <p>เรียน ผู้ใช้งาน,</p>
      <p>ผลการ${typeText}อุปกรณ์ของคุณ:</p>
      <ul>
        <li><b>ชื่ออุปกรณ์:</b> ${equipmentName}</li>
        <li><b>สถานะ:</b> ${actionText}</li>
      </ul>
      <p>กรุณาเข้าสู่ระบบเพื่อตรวจสอบข้อมูลเพิ่มเติม</p>
    `;

    const smsMessage = `📢 ระบบแจ้งผล${typeText}: ${equipmentName} ถูก${actionText}`;

    // -- ส่ง SMS ไปเบอร์ 0999719451 ถ้าเปิดการแจ้งเตือน
    if (smsNotification === 'enabled') {
      await sendSMS(smsMessage);
    }

    // -- ส่ง Email ไปหาผู้ใช้ ถ้าเปิดการแจ้งเตือน
    if (emailNotification === 'enabled' && email) {
      await sendEmail(email, emailSubject, emailBody);
    }

    console.log(`✅ แจ้งเตือนผล ${status} ให้ userID ${userID} สำเร็จ`);
  } catch (error) {
    console.error('❌ Error notifying user approval status:', error);
  }
}

// -- ตัว API Route หลัก --
export async function POST(req) {
  try {
    const { userID, equipmentName, status, type } = await req.json();

    if (!userID || !equipmentName || !status || !type) {
      return NextResponse.json({ success: false, message: 'ข้อมูลไม่ครบถ้วน' }, { status: 400 });
    }

    await notifyUserApproval({ userID, equipmentName, status, type });

    return NextResponse.json({ success: true, message: 'ส่งแจ้งเตือนผู้ใช้สำเร็จ' });
  } catch (error) {
    console.error('❌ Error sending user notification:', error);
    return NextResponse.json({ success: false, message: 'เกิดข้อผิดพลาดในการส่งแจ้งเตือนผู้ใช้' }, { status: 500 });
  }
}
