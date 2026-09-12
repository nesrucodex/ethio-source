import { Scrypt } from "lucia";
import { describe, expect, test } from "vitest";
import { convexTest } from "convex-test";
import schema from "../convex/schema";
import { api } from "../convex/_generated/api";
const modules = import.meta.glob("../convex/**/*.{ts,js}");
describe("user directory", () => {
  test("protects account data and paginates public account details for admins", async () => {
    const t = convexTest(schema, modules);
    const { admin, buyer } = await t.run(async (ctx) => {
      const admin = await ctx.db.insert("users", {
        name: "Admin",
        email: "admin@example.com",
        emailVerificationTime: 1,
      });
      const buyer = await ctx.db.insert("users", {
        name: "Buyer",
        email: "buyer@example.com",
      });
      await ctx.db.insert("admins", { userId: admin });
      return { admin, buyer };
    });
    const args = { paginationOpts: { numItems: 1, cursor: null } };
    await expect(t.query(api.users.directory, args)).rejects.toThrow(
      "Please sign in",
    );
    await expect(
      t
        .withIdentity({ subject: `${buyer}|test` })
        .query(api.users.directory, args),
    ).rejects.toThrow("Administrator access required");
    const client = t.withIdentity({ subject: `${admin}|test` });
    const first = await client.query(api.users.directory, args);
    expect(first.page).toHaveLength(1);
    const second = await client.query(api.users.directory, {
      paginationOpts: { numItems: 1, cursor: first.continueCursor },
    });
    const people = [...first.page, ...second.page];
    expect(people.find((user) => user.id === admin)).toMatchObject({
      isAdmin: true,
      emailVerified: true,
    });
    expect(people.find((user) => user.id === buyer)).toMatchObject({
      isAdmin: false,
      emailVerified: false,
    });
    expect(people.every((user) => !("password" in user))).toBe(true);
  });
});

test("admins create separate password accounts without verifying contacts or granting admin", async () => {
  const t = convexTest(schema, modules);
  const { admin, buyer } = await t.run(async (ctx) => {
    const admin = await ctx.db.insert("users", {
      name: "Admin",
      email: "admin@example.com",
    });
    const buyer = await ctx.db.insert("users", { name: "Buyer" });
    await ctx.db.insert("admins", { userId: admin });
    return { admin, buyer };
  });
  const details = {
    name: "New Customer",
    email: " NEW@example.com ",
    phone: "0911234567",
    password: "test-password-123",
  };
  await expect(t.action(api.users.create, details)).rejects.toThrow(
    "Please sign in",
  );
  await expect(
    t
      .withIdentity({ subject: `${buyer}|test` })
      .action(api.users.create, details),
  ).rejects.toThrow("Administrator");
  const client = t.withIdentity({ subject: `${admin}|test` });
  await expect(
    client.action(api.users.create, { ...details, password: "short" }),
  ).rejects.toThrow("10–128");
  await expect(
    client.action(api.users.create, { ...details, phone: "invalid" }),
  ).rejects.toThrow("mobile");
  const id = await client.action(api.users.create, details);
  expect(id).not.toBe(admin);
  await t.run(async (ctx) => {
    const user = await ctx.db.get(id);
    expect(user).toMatchObject({
      name: "New Customer",
      email: "new@example.com",
      phone: "0911234567",
    });
    expect(user?.emailVerificationTime).toBeUndefined();
    expect(user?.phoneVerificationTime).toBeUndefined();
    expect(
      await ctx.db
        .query("admins")
        .withIndex("by_user", (q) => q.eq("userId", id))
        .unique(),
    ).toBeNull();
    const account = await ctx.db
      .query("authAccounts")
      .withIndex("providerAndAccountId", (q) =>
        q.eq("provider", "password").eq("providerAccountId", "new@example.com"),
      )
      .unique();
    expect(account?.userId).toBe(id);
    expect(account?.secret).toBeTruthy();
    expect(account?.secret).not.toBe(details.password);
    expect(await new Scrypt().verify(account!.secret!, details.password)).toBe(
      true,
    );
    expect((await ctx.db.get(admin))?.email).toBe("admin@example.com");
  });
  await expect(
    client.action(api.users.create, {
      ...details,
      name: "Overwrite",
      password: "different-secret",
    }),
  ).rejects.toThrow("already exists");
  expect((await t.run((ctx) => ctx.db.get(id)))?.name).toBe("New Customer");
});
