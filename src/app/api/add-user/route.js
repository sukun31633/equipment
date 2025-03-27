import { NextResponse } from "next/server";
import pool from "../../../../lib/mysql";

export async function POST(request) {
  try {
    const data = await request.json();
    const { firstName, lastName, phone, email, idNumber, userType, password } = data;
    
    const userID = idNumber;
    const fullName = `${firstName} ${lastName}`;

    const conn = await pool.getConnection();
    try {
      await conn.query(
        `INSERT INTO user (userID, status, Name, phoneNumber, email, password)
         VALUES (?, ?, ?, ?, ?, ?)`,
        [
          userID,
          userType,  // เก็บ userType ลงในคอลัมน์ status
          fullName,
          phone,
          email,
          password
        ]
      );
    } finally {
      conn.release();
    }

    return NextResponse.json({ success: true });
  } catch (error) {
    return NextResponse.json({ success: false, message: error.message });
  }
}
