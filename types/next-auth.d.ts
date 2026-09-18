import "next-auth";

declare module "next-auth" {
  interface User {
    role?: string;
    username?: string;
  }
  interface Session {
    user: {
      id: string;
      role: "USER" | "ADMIN";
      username: string;
      name?: string | null;
      email?: string | null;
      image?: string | null;
    };
  }
}
