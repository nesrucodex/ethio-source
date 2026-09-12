import { afterEach, expect, test, vi } from "vitest";
import { convexTest } from "convex-test";
import schema from "../convex/schema";
import { ChapaClient } from "../src/services/api/chapa";
const modules = import.meta.glob("../convex/**/*.{ts,js}");
afterEach(() => {
  vi.unstubAllGlobals();
  vi.unstubAllEnvs();
});

test("webhook rejects missing and incorrect signatures before verification", async () => {
  const t = convexTest(schema, modules);
  vi.stubEnv("CHAPA_WEBHOOK_SECRET", "local-test-webhook-secret");
  const body = JSON.stringify({ tx_ref: "ES-untrusted" });
  const missing = await t.fetch("/payments/chapa/webhook", {
    method: "POST",
    body,
  });
  expect(missing.status).toBe(401);
  const invalid = await t.fetch("/payments/chapa/webhook", {
    method: "POST",
    headers: { "x-chapa-signature": "0".repeat(64) },
    body,
  });
  expect(invalid.status).toBe(401);
});

test("webhook accepts a valid raw-body signature but ignores unknown orders", async () => {
  const t = convexTest(schema, modules);
  const secret = "local-test-webhook-secret";
  vi.stubEnv("CHAPA_WEBHOOK_SECRET", secret);
  const body = JSON.stringify({ tx_ref: "ES-unknown" });
  const key = await crypto.subtle.importKey(
    "raw",
    new TextEncoder().encode(secret),
    { name: "HMAC", hash: "SHA-256" },
    false,
    ["sign"],
  );
  const signed = new Uint8Array(
    await crypto.subtle.sign("HMAC", key, new TextEncoder().encode(body)),
  );
  const signature = Array.from(signed, (b) =>
    b.toString(16).padStart(2, "0"),
  ).join("");
  const response = await t.fetch("/payments/chapa/webhook", {
    method: "POST",
    headers: { "x-chapa-signature": signature },
    body,
  });
  expect(response.status).toBe(200);
});

test("Chapa checkout validates redirect origin", async () => {
  vi.stubGlobal(
    "fetch",
    vi
      .fn()
      .mockResolvedValue(
        Response.json({
          status: "success",
          data: { checkout_url: "https://untrusted.example/payment" },
        }),
      ),
  );
  await expect(
    new ChapaClient("test-secret").initialize({
      amount: "100.00",
      currency: "ETB",
      email: "test@example.com",
      first_name: "Test",
      last_name: "Buyer",
      tx_ref: "ES-test",
      callback_url: "https://store.example/callback",
      return_url: "https://store.example/orders",
    }),
  ).rejects.toThrow("Unexpected checkout destination");
});

test("Chapa verification validates required fields and normalizes amount", async () => {
  const fetchMock = vi
    .fn()
    .mockResolvedValue(
      Response.json({
        status: "success",
        data: {
          tx_ref: "ES-test",
          amount: "100.00",
          currency: "ETB",
          status: "success",
          mode: "test",
        },
      }),
    );
  vi.stubGlobal("fetch", fetchMock);
  const data = await new ChapaClient("test-secret").verify("ES-test");
  expect(data.amount).toBe(100);
  expect(fetchMock.mock.calls[0][0]).toBe(
    "https://api.chapa.co/v1/transaction/verify/ES-test",
  );
  fetchMock.mockResolvedValue(
    Response.json({
      status: "success",
      data: {
        tx_ref: "ES-test",
        amount: "100",
        currency: "ETB",
        status: "success",
      },
    }),
  );
  await expect(
    new ChapaClient("test-secret").verify("ES-test"),
  ).rejects.toThrow();
});
