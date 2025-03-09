import mysql from 'mysql2/promise';

const pool = mysql.createPool({
  host: process.env.MYSQL_HOST || 'localhost',
  user: process.env.MYSQL_USER || 'root',  // ใช้ environment variable สำหรับชื่อผู้ใช้ MySQL
  password: process.env.MYSQL_PASSWORD || '',  // ใช้ environment variable สำหรับรหัสผ่าน MySQL
  database: process.env.MYSQL_DATABASE || 'rentcar',  // ใช้ environment variable สำหรับชื่อฐานข้อมูล
});

// ไม่จำเป็นต้องมีฟังก์ชันตรวจสอบการเชื่อมต่อหากทำงานถูกต้องแล้ว

export default pool;


