// /app/api/get-notifications/route.js
import pool from "../../../../lib/mysql"; // เชื่อมต่อกับฐานข้อมูล

export async function GET(req) {
  try {
    const url = new URL(req.url);
    const userId = url.searchParams.get("userId");

    if (!userId) {
      return new Response(
        JSON.stringify({ success: false, message: "Missing userId" }),
        { status: 400 }
      );
    }

    const [result] = await pool.query(
      "SELECT smsNotification, emailNotification FROM `user` WHERE userID = ?",
      [userId]
    );

    if (result.length === 0) {
      return new Response(
        JSON.stringify({ success: false, message: "User not found" }),
        { status: 404 }
      );
    }

    const { smsNotification, emailNotification } = result[0];
    return new Response(
      JSON.stringify({
        success: true,
        smsNotification: smsNotification, // ควรได้ค่า "enabled" หรือ "disabled" อยู่แล้ว
        emailNotification: emailNotification,
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
