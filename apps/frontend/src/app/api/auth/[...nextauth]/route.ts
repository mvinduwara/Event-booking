import NextAuth from "next-auth";
import CredentialsProvider from "next-auth/providers/credentials";

const handler = NextAuth({
  // FIXED: Add a hard fallback string to bypass Turbopack .env loading issues
  secret: process.env.NEXTAUTH_SECRET || "eventify_super_secret_key_2026_dev_fallback_123!", 
  
  providers: [
    CredentialsProvider({
      name: "Credentials",
      credentials: {
        email: { label: "Email", type: "email" },
        password: { label: "Password", type: "password" }
      },
      async authorize(credentials) {
        const res = await fetch("http://localhost:8000/api/users/auth", {
          method: 'POST',
          body: JSON.stringify(credentials),
          headers: { "Content-Type": "application/json" }
        });
        const user = await res.json();

        if (res.ok && user) return user;
        return null;
      }
    })
  ],
  pages: { signIn: '/auth/signin' },
  callbacks: {
    async session({ session, token }: any) {
      session.user.id = token.sub;
      return session;
    }
  }
});

export { handler as GET, handler as POST };