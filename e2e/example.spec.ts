import { expect, test } from "@playwright/test";

test("homepage loads successfully", async ({ page }) => {
  await page.goto("/");
  await expect(page).toHaveTitle(/Shipper Chat/);
});

test("can navigate to login page", async ({ page }) => {
  await page.goto("/");
  await page.click("text=Login");
  await expect(page).toHaveURL(/.*login/);
});
