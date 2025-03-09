import NextAuth from "next-auth";
import CredentialsProvider from "next-auth/providers/credentials";
import pool from "../../../../../lib/mysql";

export const authOptions = {
  providers: [
    CredentialsProvider({
      name: "Credentials",
      credentials: {
        userID: { label: "รหัสผู้ใช้", type: "text" },
        password: { label: "รหัสผ่าน", type: "password" },
      },
      async authorize(credentials) {
        const { userID, password } = credentials;

        try {
          const [rows] = await pool.query("SELECT * FROM user WHERE userID = ?", [userID]);

          if (rows.length === 0) {
            throw new Error("❌ ไม่พบผู้ใช้ในระบบ");
          }

          const user = rows[0];

          if (password !== user.password) {
            throw new Error("🔐 รหัสผ่านไม่ถูกต้อง");
          }

          // ✅ บล็อกเจ้าหน้าที่ ไม่ให้ล็อกอิน
          if (user.status === "เจ้าหน้าที่") {
            throw new Error("⛔ เจ้าหน้าที่ไม่สามารถเข้าสู่ระบบนี้ได้");
          }

          return {
            id: user.userID,
            name: user.Name,
            email: user.email,
            role: user.status,
          };
        } catch (error) {
          throw new Error(error.message || "⚠️ เกิดข้อผิดพลาด กรุณาลองใหม่");
        }
      },
    }),
  ],
  pages: {
    signIn: "/login",
  },
  callbacks: {
    async jwt({ token, user }) {
      if (user) {
        token.id = user.id;
        token.role = user.role;
      }
      return token;
    },
    async session({ session, token }) {
      if (session.user) {
        session.user.id = token.id;
        session.user.role = token.role;
      }
      return session;
    },
  },
  secret: process.env.NEXTAUTH_SECRET,
};

const handler = NextAuth(authOptions);
export { handler as GET, handler as POST };
