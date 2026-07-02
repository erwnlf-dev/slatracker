import { test, expect } from '@playwright/test';

const BASE_URL = process.env.BASE_URL || 'http://localhost:3000';

test('home page loads', async ({ page }) => {
  await page.goto(`${BASE_URL}/`);
  await expect(page).toHaveTitle(/.+/);
  await expect(page.locator('body')).toBeVisible();
});

test('dashboard page loads', async ({ page }) => {
  await page.goto(`${BASE_URL}/dashboard`);
  await expect(page).toHaveTitle(/.+/);
  await expect(page.locator('body')).toBeVisible();
});

test('dashboard_settings page loads', async ({ page }) => {
  await page.goto(`${BASE_URL}/dashboard/settings`);
  await expect(page).toHaveTitle(/.+/);
  await expect(page.locator('body')).toBeVisible();
});

test('dashboard_metrics page loads', async ({ page }) => {
  await page.goto(`${BASE_URL}/dashboard/metrics`);
  await expect(page).toHaveTitle(/.+/);
  await expect(page.locator('body')).toBeVisible();
});

test('dashboard_incidents page loads', async ({ page }) => {
  await page.goto(`${BASE_URL}/dashboard/incidents`);
  await expect(page).toHaveTitle(/.+/);
  await expect(page.locator('body')).toBeVisible();
});

test('dashboard_policies page loads', async ({ page }) => {
  await page.goto(`${BASE_URL}/dashboard/policies`);
  await expect(page).toHaveTitle(/.+/);
  await expect(page.locator('body')).toBeVisible();
});

test('dashboard has interactive elements', async ({ page }) => {
  await page.goto(`${BASE_URL}/dashboard`);
  // Check for buttons and inputs
  const buttons = page.locator('button');
  await expect(buttons.first()).toBeVisible();
});

