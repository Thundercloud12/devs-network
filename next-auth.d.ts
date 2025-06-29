// types/next-auth.d.ts or anywhere global
import NextAuth from "next-auth";
import { DefaultJWT } from "next-auth/jwt";

declare module "next-auth" {

  interface User extends DefaultUser {
    username?: string;
  }

  
  interface Session {
    user: {
      id: string;
      name?: string | null;
      email?: string | null;
      image?: string | null;
      username?: string; // ✅ Add this
    };
  }
}
