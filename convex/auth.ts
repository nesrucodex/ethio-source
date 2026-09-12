import { passwordReset } from "./passwordReset";
import { Password } from "@convex-dev/auth/providers/Password";
import { convexAuth } from "@convex-dev/auth/server";
export const { auth, signIn, signOut, store, isAuthenticated } = convexAuth({
  providers: [
    Password({
      reset: passwordReset,
      profile(params) {
        const email = String(params.email ?? "")
          .trim()
          .toLowerCase();
        if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email))
          throw new Error("Enter a valid email address");
        return {
          email,
          name: String(params.name ?? "")
            .trim()
            .slice(0, 100),
        };
      },
      validatePasswordRequirements(password) {
        if (password.length < 10) throw new Error("Use at least 10 characters");
      },
    }),
  ],
});
