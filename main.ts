import 'dotenv/config';
import { chromium, Browser, Page } from 'playwright';
import { getRandomQuote, getRandomDadJoke, getRandomOffensiveJoke } from './api';

// Helper function for random delays
function randomDelay(min: number, max: number): Promise<void> {
  const delay = Math.floor(Math.random() * (max - min + 1)) + min;
  return new Promise(resolve => setTimeout(resolve, delay));
}

// Helper function for human-like typing
async function humanType(page: Page, selector: string, text: string) {
  await page.click(selector);
  await randomDelay(100, 300);
  
  for (const char of text) {
    await page.keyboard.type(char);
    await randomDelay(50, 150); // Random delay between keystrokes
  }
  await randomDelay(200, 500);
}

// Helper function for human-like mouse movement
async function humanClick(page: Page, selector: string) {
  const element = await page.locator(selector);
  const box = await element.boundingBox();
  
  if (box) {
    // Move mouse to element with slight randomness
    const x = box.x + box.width / 2 + (Math.random() - 0.5) * 10;
    const y = box.y + box.height / 2 + (Math.random() - 0.5) * 10;
    
    await page.mouse.move(x, y, { steps: Math.floor(Math.random() * 10) + 5 });
    await randomDelay(100, 300);
    await page.mouse.click(x, y);
  }
}

async function sendMessageToFacebookChat() {

  let browser: Browser = await chromium.launch({ 
    headless: false,
    args: [
      '--no-first-run',
      '--no-default-browser-check',
      '--disable-blink-features=AutomationControlled',
      '--disable-web-security',
      '--disable-features=VizDisplayCompositor',
      '--disable-extensions',
      '--no-sandbox',
      '--disable-dev-shm-usage',
      '--disable-gpu',
    ]
  });

  // Create a new context with realistic settings
  const context = await browser.newContext({
    userAgent: 'Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36',
    viewport: { width: 1366, height: 768 },
    locale: 'en-US',
    timezoneId: 'America/New_York',
    permissions: ['geolocation', 'notifications'],
    extraHTTPHeaders: {
      'Accept-Language': 'en-US,en;q=0.9',
      'Accept': 'text/html,application/xhtml+xml,application/xml;q=0.9,image/webp,image/apng,*/*;q=0.8',
      'Accept-Encoding': 'gzip, deflate, br',
      'DNT': '1',
      'Connection': 'keep-alive',
      'Upgrade-Insecure-Requests': '1',
    }
  });

  let page: Page = await context.newPage();
  
  // First, go to facebook.com (more natural)
  await page.goto('https://www.facebook.com', { 
    waitUntil: 'domcontentloaded',
    timeout: 15000 
  });
  await randomDelay(1000, 2000);
  await page.getByRole('button', { name: 'Allow all cookies' }).click();
  
  // Human-like login process
  await humanType(page, 'input[name="email"]', process.env.FACEBOOK_EMAIL || '');
  await randomDelay(800, 1500);
  
  await humanType(page, 'input[name="pass"]', process.env.FACEBOOK_PASSWORD || '');
  await randomDelay(1000, 2000);
  
  // Move mouse around a bit before clicking login
  await page.mouse.move(Math.random() * 200 + 400, Math.random() * 100 + 300);
  await page.waitForTimeout(700);
  
  await humanClick(page, 'button[type="submit"]');
  await randomDelay(5000, 8000);
  
  await page.goto(process.env.FACEBOOK_CHAT_URL || '', {
    waitUntil: 'domcontentloaded',
    timeout: 10000
  });

  await page.waitForTimeout(6000);
  await page.getByRole('button', { name: 'Close' }).first().click();
  await page.waitForTimeout(3000);
  await page.getByRole('button', { name: 'Don\'t restore messages' }).click()
  await page.waitForTimeout(3000);

  // Search for the chat
  await page.locator('input[placeholder="Search Messenger"]').click();
  await page.keyboard.type(process.env.FACEBOOK_CHAT_SEARCH_NAME || '');
  await page.waitForTimeout(3000);
  await page.locator('li[role="option"]').nth(1).click();
  await page.locator('div[role="textbox"]').click();
  await page.waitForTimeout(500);

  // Write quote
  await page.keyboard.type('Quote of the day: ' + await getRandomQuote());
  await page.waitForTimeout(1000);
  await page.keyboard.press('Enter');
  await page.waitForTimeout(1000); 

  // Write dad joke
  await page.keyboard.type('Dad joke of the day: ' + await getRandomDadJoke());
  await page.waitForTimeout(1000);
  await page.keyboard.press('Enter');
  await page.waitForTimeout(1000);

  // Write offensive joke
  await page.keyboard.type('Offensive joke of the day: ' + await getRandomOffensiveJoke());
  await page.waitForTimeout(1000);
  await page.keyboard.press('Enter');
  await page.waitForTimeout(1000);
  
  await browser.close();
}

// Run the script
sendMessageToFacebookChat();
