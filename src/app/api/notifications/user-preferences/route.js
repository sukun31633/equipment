import pool from "../../../../../lib/mysql";

export async function GET(req) {
  try {
    // กำหนด userId เป็น "641372" โดยตรง
    const userId = "641372";

    // ดึงค่าการตั้งค่าแจ้งเตือน, เบอร์โทร และอีเมลจากตาราง user โดยอิงจาก userId
    const [result] = await pool.query(
      "SELECT smsNotification, emailNotification, phoneNumber, email FROM user WHERE userID = ?",
      [userId]
    );

    // ถ้าไม่พบ user -> ส่งกลับ error 404
    if (result.length === 0) {
      return new Response(
        JSON.stringify({ success: false, message: "User not found" }),
        { status: 404 }
      );
    }

    // ถ้าพบ user -> ส่งกลับค่าการตั้งค่าการแจ้งเตือน พร้อมข้อมูลเบอร์โทรและอีเมล
    const { smsNotification, emailNotification, phoneNumber, email } = result[0];
    return new Response(
      JSON.stringify({
        success: true,
        smsNotification: smsNotification ? "enabled" : "disabled",
        emailNotification: emailNotification ? "enabled" : "disabled",
        phoneNumber,
        email,
      }),
      { status: 200 }
    );
  } catch (error) {
    console.error("Error fetching notification settings:", error);
    return new Response(
      JSON.stringify({ success: false, message: "Failed to fetch notification settings" }),
      { status: 500 }
    );
  }
}
