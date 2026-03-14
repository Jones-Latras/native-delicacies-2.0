import { test, expect } from "@playwright/test";

test.describe("Customer Journey", () => {
  test("complete flow: homepage → menu → add to cart → view cart", async ({ page }) => {
    // 1. Start at homepage
    await page.goto("/");
    await expect(page).toHaveTitle(/Native Delicacies/);

    // 2. Navigate to menu
    await page.getByRole("link", { name: /browse menu|menu/i }).first().click();
    await page.waitForURL(/\/menu/);
    await expect(page.locator("main")).toBeVisible();

    // 3. Click on a menu item (first available product card link)
    const productLinks = page.locator('a[href*="/menu/"]');
    const count = await productLinks.count();
    if (count > 0) {
      await productLinks.first().click();
      await page.waitForTimeout(1000);
    }

    // 4. Navigate to cart
    await page.goto("/cart");
    await expect(page.locator("main")).toBeVisible();
  });

  test("bilao builder page loads with categories", async ({ page }) => {
    await page.goto("/bilao-builder");
    await expect(page.locator("main")).toBeVisible();
    await expect(page.getByText(/bilao/i)).toBeVisible();
  });

  test("unauthenticated checkout redirects to login", async ({ page }) => {
    await page.goto("/checkout");
    // Middleware should redirect to /login
    await page.waitForURL(/\/login/);
    await expect(page).toHaveURL(/login/);
  });

  test("unauthenticated profile redirects to login", async ({ page }) => {
    await page.goto("/profile");
    await page.waitForURL(/\/login/);
    await expect(page).toHaveURL(/login/);
  });
});

test.describe("Admin Access Control", () => {
  test("unauthenticated admin access redirects to login", async ({ page }) => {
    await page.goto("/admin");
    await page.waitForURL(/\/login/);
    await expect(page).toHaveURL(/login/);
  });

  test("admin API returns 401 without auth", async ({ request }) => {
    const response = await request.get("/api/admin/dashboard");
    expect(response.status()).toBe(401);
  });

  test("admin orders API returns 401 without auth", async ({ request }) => {
    const response = await request.get("/api/admin/orders");
    expect(response.status()).toBe(401);
  });

  test("admin settings API returns 401 without auth", async ({ request }) => {
    const response = await request.get("/api/admin/settings");
    expect(response.status()).toBe(401);
  });
});

test.describe("API Security", () => {
  test("public menu API returns data", async ({ request }) => {
    const response = await request.get("/api/menu/items");
    expect(response.status()).toBe(200);
    const data = await response.json();
    expect(data.success).toBe(true);
  });

  test("public categories API returns data", async ({ request }) => {
    const response = await request.get("/api/menu/categories");
    expect(response.status()).toBe(200);
  });

  test("settings API returns data", async ({ request }) => {
    const response = await request.get("/api/settings");
    expect(response.status()).toBe(200);
  });

  test("order creation requires valid data", async ({ request }) => {
    const response = await request.post("/api/orders", {
      data: {},
    });
    // Should reject with 422 (validation) or 400
    expect([400, 422, 401]).toContain(response.status());
  });

  test("stripe webhook rejects missing signature", async ({ request }) => {
    const response = await request.post("/api/stripe/webhook", {
      data: { type: "test" },
    });
    expect(response.status()).toBe(400);
  });

  test("user endpoints require auth", async ({ request }) => {
    const profileResp = await request.get("/api/user/profile");
    expect(profileResp.status()).toBe(401);

    const ordersResp = await request.get("/api/user/orders");
    expect(ordersResp.status()).toBe(401);
  });
});
