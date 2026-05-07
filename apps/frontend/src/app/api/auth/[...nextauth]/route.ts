// apps/frontend/src/app/api/auth/[...nextauth]/route.ts
import NextAuth from "next-auth";
import CredentialsProvider from "next-auth/providers/credentials";

const handler = NextAuth({
  providers: [
    CredentialsProvider({
      name: "Credentials",
      credentials: {
        email: { label: "Email", type: "email" },
        password: { label: "Password", type: "password" }
      },
      async authorize(credentials) {
        // In a real app, you'd verify the password here.
        // For now, we fetch/create the user in our backend.
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