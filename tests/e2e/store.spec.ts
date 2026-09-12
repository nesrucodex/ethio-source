import { test, expect } from "@playwright/test";
test("catalog search, stock state, bag and persistence", async ({ page }) => {
  await page.goto("/products");
  await expect(
    page.getByRole("heading", { name: "Studio wireless headphones" }),
  ).toBeVisible();
  await page
    .getByRole("searchbox", { name: "Find something" })
    .fill("headphones");
  await expect(page.locator(".product-card")).toHaveCount(1);
  await page
    .getByRole("button", { name: "Add to bag: Studio wireless headphones" })
    .click();
  await page.goto("/cart");
  await expect(
    page.getByRole("heading", { name: "Studio wireless headphones" }),
  ).toBeVisible();
  await page.getByRole("button", { name: "Increase Studio" }).click();
  await page.reload();
  await expect(page.locator(".quantity-control span")).toHaveText("2");
  await page.getByRole("button", { name: "Remove Studio" }).click();
  await expect(page.getByText("Your bag is waiting")).toBeVisible();
  await page.goto("/products?category=beauty");
  await expect(
    page.getByRole("button", { name: "Add to bag: Botanical" }),
  ).toBeDisabled();
});
test("language selection persists and layouts stay inside the viewport", async ({
  page,
}) => {
  await page.goto("/");
  await page.getByRole("combobox", { name: "Language" }).click();
  await page.getByRole("option", { name: "አማ" }).click();
  await expect(page.getByRole("heading", { level: 1 })).toContainText("ከቻይና");
  await page.reload();
  await expect(page.getByRole("heading", { level: 1 })).toContainText("ከቻይና");
  expect(
    await page.evaluate(
      () => document.documentElement.scrollWidth <= window.innerWidth,
    ),
  ).toBe(true);
});
test("admin access is denied to signed-out visitors", async ({ page }) => {
  await page.goto("/admin");
  await expect(page.getByText("Administrator access required")).toBeVisible();
  await expect(
    page.getByRole("heading", { name: "Recent orders" }),
  ).toHaveCount(0);
});
test("sign-up, protected account, and sign-out", async ({ page }) => {
  await page.goto("/sign-up");
  await page.getByLabel("Full name").fill("Browser Test");
  await page
    .getByLabel("Email address")
    .fill(`browser-${Date.now()}-${test.info().project.name}@example.com`);
  await page
    .getByLabel("Password", { exact: true })
    .fill("Local-test-password-9821!");
  await page.getByRole("button", { name: "Create your account" }).click();
  await expect(
    page.getByRole("heading", { name: "Hello, Browser Test." }),
  ).toBeVisible({ timeout: 15000 });
  await page.goto("/admin");
  await expect(page.getByText("Administrator access required")).toBeVisible();
  await page.goto("/account");
  await page.getByRole("button", { name: "Sign out" }).click();
  await expect(page.getByText("Your account awaits")).toBeVisible();
});

test("one filter drawer combines category and price sorting", async ({
  page,
}) => {
  await page.goto("/products");
  await expect(page.locator(".product-card").first()).toBeVisible();
  const trigger = page.getByRole("button", { name: /^Filters/ });
  await trigger.click();
  const drawer = page.getByRole("dialog", { name: "Filters" });
  await drawer.getByRole("radio", { name: "Price: low to high" }).check();
  await drawer.getByRole("link").filter({ hasText: "Electronics" }).click();
  await expect(drawer).toBeVisible();
  await expect(page).toHaveURL(/category=electronics/);
  await expect(
    drawer.getByRole("radio", { name: "Price: low to high" }),
  ).toBeChecked();
  await drawer.getByRole("button", { name: "Done", exact: true }).click();
  await expect(drawer).not.toBeVisible();
  await expect(trigger).toContainText("2");
  await expect(page.locator(".product-category").first()).toHaveText(
    "Electronics",
  );
  const prices = (await page.locator(".product-price").allTextContents()).map(
    (text) => Number(text.replace(/[^\d.]/g, "")),
  );
  expect(prices.length).toBeGreaterThan(1);
  expect(prices).toEqual([...prices].sort((a, b) => a - b));
  await trigger.click();
  await drawer.getByRole("button", { name: "Reset filters" }).click();
  await expect(
    drawer.getByRole("radio", { name: "Featured first" }),
  ).toBeChecked();
  await expect(
    drawer.getByRole("link").filter({ hasText: "All products" }),
  ).toHaveAttribute("aria-current", "page");
  await page.keyboard.press("Escape");
  await expect(trigger).toBeFocused();
  expect(
    await page.evaluate(
      () => document.documentElement.scrollWidth <= innerWidth,
    ),
  ).toBe(true);
});
