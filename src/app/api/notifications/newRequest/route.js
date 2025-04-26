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
  await transporter.sendMail({
    from: process.env.GMAIL_USER,
    to,
    subject,
    html,
  });
}

// -- ฟังก์ชันส่ง SMS --
const twilioClient = twilio(process.env.TWILIO_ACCOUNT_SID, process.env.TWILIO_AUTH_TOKEN);

async function sendSMS(message, toPhone) {
  const to = toPhone.startsWith('0') ? '+66' + toPhone.slice(1) : toPhone;
  await twilioClient.messages.create({
    body: message,
    from: process.env.TWILIO_PHONE_NUMBER,
    to,
  });
}

// -- ฟังก์ชันหลัก แจ้งเตือน admin --
async function notifyAdminNewRequest({ equipmentID, reserverName, type }) {
  const [[equipment]] = await pool.query(
    `SELECT name FROM equipment WHERE id = ?`,
    [equipmentID]
  );

  const equipmentName = equipment?.name || 'ไม่พบชื่ออุปกรณ์';
  const action = type === 'borrow' ? 'ยืม' : 'จอง';

  const adminEmail = 'jingpt888@gmail.com'; 
  const adminPhone = '0999719451';              

  const emailSubject = `📢 แจ้งเตือน: มีการ${action}อุปกรณ์ใหม่`;
  const emailBody = `
    <p>เรียน เจ้าหน้าที่,</p>
    <p>มีการ${action}อุปกรณ์ใหม่:</p>
    <ul>
      <li><b>ชื่อผู้${action}:</b> ${reserverName}</li>
      <li><b>อุปกรณ์:</b> ${equipmentName}</li>
    </ul>
    <p>กรุณาเข้าสู่ระบบเพื่อตรวจสอบ</p>
  `;

  const smsMessage = `📢 ${reserverName} ${action}อุปกรณ์ ${equipmentName}`;

  await sendEmail(adminEmail, emailSubject, emailBody);
  await sendSMS(smsMessage, adminPhone);

  console.log('✅ แจ้งเตือน admin สำเร็จ');

  // ✨ ส่งค่ากลับไปพร้อมชื่อที่ใช้
  return {
    reserverName,
    equipmentName,
    action,
  };
}

// -- ตัว API route (main) --
export async function POST(req) {
  try {
    const { equipmentID, reserverName, type } = await req.json();

    if (!equipmentID || !reserverName || !type) {
      return NextResponse.json(
        { success: false, message: '❌ ข้อมูลไม่ครบถ้วน' },
        { status: 400 }
      );
    }

    const result = await notifyAdminNewRequest({ equipmentID, reserverName, type });

    return NextResponse.json({
      success: true,
      message: '✅ ส่งแจ้งเตือนสำเร็จ',
      reserverName: result.reserverName,
      equipmentName: result.equipmentName,
      action: result.action,
    });
  } catch (error) {
    console.error('❌ Error sending notification:', error);
    return NextResponse.json(
      { success: false, message: '❌ เกิดข้อผิดพลาดในการส่งแจ้งเตือน' },
      { status: 500 }
    );
  }
}
