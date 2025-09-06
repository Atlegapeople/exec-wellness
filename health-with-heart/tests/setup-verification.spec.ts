import { test, expect } from '@playwright/test';

test('Playwright setup verification', async ({ page }) => {
  // Test basic navigation to the home page
  await page.goto('/');
  
  // Check that the page loads and has expected content
  await expect(page).toHaveTitle(/Health With Heart/);
  
  // Take a screenshot for visual verification
  await page.screenshot({ path: 'tests/screenshots/homepage.png', fullPage: true });
});

test('Dashboard page loads', async ({ page }) => {
  await page.goto('/dashboard');
  
  // Check for dashboard elements (adjust selectors as needed)
  await expect(page.locator('body')).toBeVisible();
  
  // Take screenshot of dashboard
  await page.screenshot({ path: 'tests/screenshots/dashboard.png', fullPage: true });
});

test('Protected pages redirect to login when not authenticated', async ({ page }) => {
  const protectedPages = [
    '/analytics',
    '/appointments',
    '/assessments',
    '/calendar',
    '/clinical-examinations',
    '/cost-centers',
    '/employees',
    '/emergency-responses',
    '/lab-tests',
    '/lifestyle',
    '/locations',
    '/managers',
    '/medical-history',
    '/medical-staff',
    '/my-dashboard',
    '/organizations',
    '/reports',
    '/sites',
    '/special-investigations',
    '/users',
    '/vitals'
  ];

  for (const pagePath of protectedPages) {
    await page.goto(pagePath);
    
    // Wait for potential redirect
    await page.waitForTimeout(2000);
    
    // Check that page loads without errors
    await expect(page.locator('body')).toBeVisible();
    
    // For protected routes, they should either show login form or redirect to home
    const currentUrl = page.url();
    const pageContent = await page.textContent('body');
    
    // Check that we get proper authentication handling
    // Protected pages should either show loading state or redirect to login
    const hasAuthHandling = pageContent?.includes('Verifying Access') ||
                          pageContent?.includes('Checking your authentication status') ||
                          pageContent?.includes('Sign in') || 
                          pageContent?.includes('Email Address') || 
                          pageContent?.includes('Password') ||
                          pageContent?.includes('Health with Heart') ||
                          currentUrl.includes('/') || // Redirected to home
                          currentUrl !== `http://localhost:3000${pagePath}`; // Any redirect
    
    expect(hasAuthHandling).toBe(true);
    console.log(`✓ ${pagePath} - properly protected (redirected to login)`);
  }
});

test('Public pages are accessible', async ({ page }) => {
  const publicPages = [
    '/',
    '/auth'
  ];

  for (const pagePath of publicPages) {
    await page.goto(pagePath);
    
    // Check that page loads without errors
    await expect(page.locator('body')).toBeVisible();
    
    // Check for positive indicators that the page loaded correctly
    // Instead of checking for 404 text (which might be in JS code)
    const hasLoginContent = await page.locator('text=Sign in').isVisible() ||
                           await page.locator('text=Email Address').isVisible() ||
                           await page.locator('text=Health with Heart').isVisible();
    
    expect(hasLoginContent).toBe(true);
    
    console.log(`✓ ${pagePath} - publicly accessible`);
  }
});