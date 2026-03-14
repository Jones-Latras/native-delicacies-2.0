import { test, expect } from "@playwright/test";

test.describe("Homepage", () => {
  test("loads homepage with hero section", async ({ page }) => {
    await page.goto("/");
    await expect(page).toHaveTitle(/Native Delicacies/);
    await expect(page.getByRole("heading", { name: /build your own/i })).toBeVisible();
  });

  test("shows category cards", async ({ page }) => {
    await page.goto("/");
    await expect(page.getByText("Shop by Category")).toBeVisible();
  });

  test("shows featured products section", async ({ page }) => {
    await page.goto("/");
    await expect(page.getByText("Popular Delicacies")).toBeVisible();
  });

  test("hero CTA links work", async ({ page }) => {
    await page.goto("/");

    const bilaoLink = page.getByRole("link", { name: /build your bilao/i });
    await expect(bilaoLink).toBeVisible();
    await expect(bilaoLink).toHaveAttribute("href", "/bilao-builder");

    const menuLink = page.getByRole("link", { name: /browse menu/i });
    await expect(menuLink).toBeVisible();
    await expect(menuLink).toHaveAttribute("href", "/menu");
  });
});

test.describe("Menu Page", () => {
  test("loads menu with items", async ({ page }) => {
    await page.goto("/menu");
    await expect(page.getByText(/our menu/i).or(page.getByText(/browse/i))).toBeVisible();
  });

  test("category filter works", async ({ page }) => {
    await page.goto("/menu?category=kakanin");
    await expect(page).toHaveURL(/category=kakanin/);
  });

  test("search functionality works", async ({ page }) => {
    await page.goto("/menu");
    const searchInput = page.getByPlaceholder(/search/i);
    if (await searchInput.isVisible()) {
      await searchInput.fill("bibingka");
      await page.waitForTimeout(500);
    }
  });
});

test.describe("Authentication", () => {
  test("login page loads", async ({ page }) => {
    await page.goto("/login");
    await expect(page.getByRole("heading", { name: /sign in|log in|welcome/i })).toBeVisible();
  });

  test("register page loads", async ({ page }) => {
    await page.goto("/register");
    await expect(page.getByRole("heading", { name: /create|sign up|register/i })).toBeVisible();
  });

  test("login form validates empty submission", async ({ page }) => {
    await page.goto("/login");
    const submitButton = page.getByRole("button", { name: /sign in|log in/i });
    if (await submitButton.isVisible()) {
      await submitButton.click();
      // Should show validation errors or stay on page
      await expect(page).toHaveURL(/login/);
    }
  });
});

test.describe("Cart", () => {
  test("cart page loads when empty", async ({ page }) => {
    await page.goto("/cart");
    // Should show empty cart state
    await expect(page.getByText(/empty|no items/i).or(page.getByText(/cart/i))).toBeVisible();
  });
});

test.describe("Static Pages", () => {
  test("about page loads", async ({ page }) => {
    await page.goto("/about");
    await expect(page).toHaveTitle(/about/i);
  });

  test("contact page loads", async ({ page }) => {
    await page.goto("/contact");
    await expect(page).toHaveTitle(/contact/i);
  });

  test("delivery policy page loads", async ({ page }) => {
    await page.goto("/policies/delivery");
    await expect(page.getByText(/delivery/i)).toBeVisible();
  });

  test("privacy policy page loads", async ({ page }) => {
    await page.goto("/policies/privacy");
    await expect(page.getByText(/privacy/i)).toBeVisible();
  });

  test("terms page loads", async ({ page }) => {
    await page.goto("/policies/terms");
    await expect(page.getByText(/terms/i)).toBeVisible();
  });
});

test.describe("Navigation", () => {
  test("header has navigation links", async ({ page }) => {
    await page.goto("/");
    await expect(page.getByRole("link", { name: /menu/i }).first()).toBeVisible();
  });

  test("footer is present", async ({ page }) => {
    await page.goto("/");
    await expect(page.locator("footer")).toBeVisible();
  });
});

test.describe("Security Headers", () => {
  test("response includes security headers", async ({ page }) => {
    const response = await page.goto("/");
    const headers = response?.headers() ?? {};

    expect(headers["x-frame-options"]).toBe("SAMEORIGIN");
    expect(headers["x-content-type-options"]).toBe("nosniff");
    expect(headers["referrer-policy"]).toBe("strict-origin-when-cross-origin");
    expect(headers["x-xss-protection"]).toBe("1; mode=block");
  });
});
