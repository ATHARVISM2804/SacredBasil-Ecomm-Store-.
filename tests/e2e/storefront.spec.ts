import { expect, test, type Page } from "@playwright/test";

// Returning visitor: cookie choice made and the Diwali invitation seen, so
// neither covers the page. The first-visit test below clears these.
test.beforeEach(async ({ page }) => {
  await page.addInitScript(() => {
    if (sessionStorage.getItem("fresh")) return;
    localStorage.setItem("sb-consent", "essential");
    localStorage.setItem("sb-diwali-invite", String(Date.now()));
  });
});

/** No sideways scroll at any width. */
async function expectNoOverflow(page: Page) {
  const overflow = await page.evaluate(() => document.documentElement.scrollWidth - window.innerWidth);
  expect(overflow).toBeLessThanOrEqual(0);
}

test("home: hero film, gift sets and the right video for the screen size", async ({ page }, info) => {
  await page.goto("/");
  await expect(page.getByRole("heading", { level: 1 })).toContainText("Sacred Basil");
  await expect(page.getByRole("heading", { level: 2, name: "The Diwali Gifting Collection" })).toBeVisible();
  await expect(page.getByRole("link", { name: /Luxe Bath & Body Care Kit.*From ₹1,100/ })).toBeVisible();
  const src = await page.locator("video source").first().getAttribute("src");
  expect(src).toContain(info.project.name === "phone" ? "/video/v4/hero-mobile.mp4" : "/video/v4/hero-desktop.mp4");
  await expectNoOverflow(page);
});

test("header shows the official monogram and the announcement link", async ({ page }) => {
  await page.goto("/");
  const header = page.locator("header");
  // Traced from docs/inputs/sb-monogram-hq.png: the full B, nothing clipped.
  await expect(header.locator('svg[viewBox="0 0 2432 1772"]')).toBeVisible();
  await expect(page.getByRole("link", { name: "Enquire now" })).toHaveAttribute("href", "/corporate-gifting#enquire");
});

test("menus: desktop mega menu and phone menu list the gift sets", async ({ page }, info) => {
  await page.goto("/");
  if (info.project.name === "phone") {
    await page.getByRole("button", { name: "Open menu" }).click();
    const menu = page.getByRole("dialog", { name: "Menu" });
    await expect(menu.getByRole("link", { name: "The Tranquil Box" })).toBeVisible();
    await menu.getByRole("button", { name: "Close menu" }).click();
    await expect(menu).toBeHidden();
  } else {
    await page.getByRole("navigation", { name: "Shop" }).getByRole("link", { name: "Gift Sets" }).hover();
    await expect(page.locator("#menu-gift-sets").getByRole("link", { name: "The Tranquil Box" })).toBeVisible();
  }
});

test("shop lists the four gift sets with prices", async ({ page }) => {
  await page.goto("/collections");
  const sets = page.locator("#gift-sets");
  for (const name of ["Luxe Bath & Body Care Kit", "Tranquil Box", "Serenity Box", "Festive Ritual Box"]) {
    await expect(sets.getByRole("link", { name: new RegExp(name) })).toBeVisible();
  }
  await expect(page.getByText(/₹\s?1,100/).first()).toBeVisible();
  await expectNoOverflow(page);
});

test("product page → add to bag → bag survives a reload → checkout", async ({ page }) => {
  await page.goto("/collections/luxe-bath-body-care-kit");
  await expect(page.getByRole("heading", { level: 1 })).toContainText("Luxe Bath & Body Care Kit");

  await page.getByRole("button", { name: "Increase quantity" }).click();
  await page.getByRole("button", { name: "Add to bag" }).click();

  const drawer = page.getByRole("dialog", { name: /Your bag/ });
  await expect(drawer).toBeVisible();
  await expect(drawer).toContainText("Luxe Bath & Body Care Kit");
  await expect(drawer.getByRole("heading", { name: /Your bag/ })).toContainText("(2)");
  await drawer.getByRole("button", { name: "Close bag" }).click();
  await expect(page.getByRole("button", { name: "Cart, 2 items" })).toBeVisible();

  await page.goto("/cart");
  await page.reload();
  await expect(page.getByRole("heading", { level: 1, name: "Your bag" })).toBeVisible();
  const summary = page.getByRole("complementary", { name: "Bag summary" });
  await expect(summary).toContainText("₹2,200");

  await page.goto("/checkout");
  await expect(page.getByRole("heading", { level: 1, name: "Checkout" })).toBeVisible();
  await expect(page.getByRole("complementary", { name: "Order summary" })).toContainText("Luxe Bath & Body Care Kit");
});

test("bag starts empty for a new visitor", async ({ page }) => {
  await page.goto("/cart");
  await expect(page.locator("main").getByText(/^Your bag is empty\./)).toBeVisible();
});

test("corporate enquiry form flags missing fields instead of sending", async ({ page }) => {
  let posted = false;
  await page.route("**/api/enquiry", (route) => {
    posted = true;
    return route.abort();
  });
  await page.goto("/corporate-gifting");
  const form = page.locator("form").filter({ has: page.locator('input[name="email"]') }).first();
  await form.scrollIntoViewIfNeeded();
  await form.locator('button[type="submit"]').click();
  await expect(form.locator('[name="name"]')).toHaveAttribute("aria-invalid", "true");
  await expect(form.locator('[name="name"]')).toBeFocused();
  expect(posted).toBe(false);
});

test("policy and story pages load", async ({ page }) => {
  for (const path of ["/our-story", "/contact", "/shipping", "/returns", "/privacy", "/terms"]) {
    const res = await page.goto(path);
    expect(res?.status(), path).toBe(200);
    await expect(page.getByRole("heading", { level: 1 })).toBeVisible();
    await expectNoOverflow(page);
  }
});

test("unknown pages return 404", async ({ page }) => {
  const res = await page.goto("/no-such-page");
  expect(res?.status()).toBe(404);
});

test("admin asks for Supabase until it is configured", async ({ page }) => {
  test.skip(!!process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY, "Supabase is configured");
  await page.goto("/admin");
  await expect(page.getByRole("heading", { level: 1, name: "Connect Supabase" })).toBeVisible();
});

test("first visit: cookie bar, then the Diwali invitation", async ({ page }) => {
  await page.addInitScript(() => {
    if (sessionStorage.getItem("fresh")) return;
    sessionStorage.setItem("fresh", "1");
    localStorage.clear();
  });
  await page.goto("/");
  const bar = page.getByRole("region", { name: "Cookie preferences" });
  await expect(bar.getByRole("button", { name: "Accept all" })).toBeVisible();
  await expect(page.getByRole("dialog")).toBeHidden();
  await bar.getByRole("button", { name: "Essential only" }).click();
  await expect(bar).toBeHidden();
  expect(await page.evaluate(() => localStorage.getItem("sb-consent"))).toBe("essential");

  const invite = page.getByRole("dialog", { name: "Gift the glow of Diwali." });
  await expect(invite).toBeVisible();
  await invite.getByRole("link", { name: "Explore Diwali gifts" }).click();
  await expect(page).toHaveURL(/\/collections#gift-sets$/);
  await expect(invite).toBeHidden();

  // Neither comes back on the next page.
  await page.goto("/our-story");
  await page.waitForTimeout(3500);
  await expect(page.getByRole("dialog")).toBeHidden();
  await expect(page.getByRole("region", { name: "Cookie preferences" })).toBeHidden();
});
