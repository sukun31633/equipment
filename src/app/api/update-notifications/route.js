// /app/api/update-notifications/route.js
import pool from "../../../../lib/mysql"; // เชื่อมต่อกับฐานข้อมูล

export async function POST(req) {
  try {
    const { userId, smsNotification, emailNotification } = await req.json();

    if (!userId) {
      return new Response(
        JSON.stringify({ success: false, message: "Missing userId" }),
        { status: 400 }
      );
    }

    // คาดว่าค่า smsNotification และ emailNotification ที่ส่งมาจะเป็น "enabled" หรือ "disabled"
    const [result] = await pool.query(
      "UPDATE `user` SET smsNotification = ?, emailNotification = ? WHERE userID = ?",
      [smsNotification, emailNotification, userId]
    );

    if (result.affectedRows === 0) {
      return new Response(
        JSON.stringify({ success: false, message: "User not found" }),
        { status: 404 }
      );
    }

    return new Response(
      JSON.stringify({ success: true, message: "Notification settings updated successfully" }),
      { status: 200 }
    );
  } catch (error) {
    console.error("Error updating notification settings:", error);
    return new Response(
      JSON.stringify({ success: false, message: "Failed to update notification settings" }),
      { status: 500 }
    );
  }
}
