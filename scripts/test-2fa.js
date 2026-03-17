/**
 * Playwright E2E test for Two-Factor Authentication (2FA)
 * Tests the full 2FA flow on http://localhost:3000/profile
 */
const { chromium } = require("playwright");
const crypto = require("crypto");

// ── TOTP helper (RFC 6238) ─────────────────────────────────────────────────
function base32Decode(str) {
  const alphabet = "ABCDEFGHIJKLMNOPQRSTUVWXYZ234567";
  let bits = 0, value = 0;
  const output = [];
  for (const ch of str.replace(/=+$/, "").toUpperCase()) {
    const idx = alphabet.indexOf(ch);
    if (idx === -1) continue;
    value = (value << 5) | idx;
    bits += 5;
    if (bits >= 8) { bits -= 8; output.push((value >> bits) & 0xff); }
  }
  return Buffer.from(output);
}

function generateTOTP(secret, window = 0) {
  const key = base32Decode(secret);
  const step = Math.floor(Date.now() / 1000 / 30) + window;
  const buf = Buffer.alloc(8);
  buf.writeBigUInt64BE(BigInt(step));
  const hmac = crypto.createHmac("sha1", key).update(buf).digest();
  const offset = hmac[hmac.length - 1] & 0x0f;
  const code = (hmac.readUInt32BE(offset) & 0x7fffffff) % 1_000_000;
  return String(code).padStart(6, "0");
}

function extractSecretFromURI(uri) {
  try {
    const url = new URL(uri);
    return url.searchParams.get("secret");
  } catch { return null; }
}

// ── Test runner ────────────────────────────────────────────────────────────
const BASE = "http://localhost:3000";
const TEST_EMAIL = "admin@admin.com";
const TEST_PASS = "adminadmin";

const results = [];
const screenshots = [];
let interceptedTotpURI = null;

function log(icon, label, detail = "") {
  const line = `${icon} ${label}${detail ? ": " + detail : ""}`;
  console.log(line);
  results.push({ icon, label, detail });
}

async function shot(page, name) {
  const file = `audit-2fa-${name}.png`;
  await page.screenshot({ path: file, fullPage: false });
  screenshots.push(file);
  log("📸", `Screenshot saved`, file);
}

(async () => {
  const browser = await chromium.launch({ headless: true });
  const context = await browser.newContext();
  const page = await context.newPage();

  // Intercept API calls to capture twoFactor responses
  const apiLogs = [];
  page.on("response", async (res) => {
    const url = res.url();
    if (url.includes("/api/auth") || url.includes("twoFactor") || url.includes("two-factor")) {
      let body = "";
      try { body = await res.text(); } catch {}
      apiLogs.push({ url, status: res.status(), body: body.slice(0, 500) });
      if (url.includes("enable") && body.includes("totpURI")) {
        try {
          const json = JSON.parse(body);
          interceptedTotpURI = json.totpURI || json.data?.totpURI;
        } catch {}
      }
    }
  });

  console.log("\n╔══════════════════════════════════════════╗");
  console.log("║     2FA E2E TEST - localhost:3000         ║");
  console.log(`║     Test user: ${TEST_EMAIL.slice(0, 26)} ║`);
  console.log("╚══════════════════════════════════════════╝\n");

  console.log("═".repeat(50));
  console.log("STEP 1: LOGIN");
  console.log("═".repeat(50));

  await page.goto(`${BASE}/login`);
  await page.fill('input[type="email"]', TEST_EMAIL);
  await page.fill('input[type="password"]', TEST_PASS);
  await shot(page, "04-login-filled");
  await page.click('button[type="submit"]');
  await page.waitForTimeout(3000);
  await shot(page, "05-login-result");

  const afterLogin = page.url();
  const isLoggedIn = !afterLogin.includes("/login") && !afterLogin.includes("/signup");
  log(isLoggedIn ? "✅" : "❌", "Login result", `URL: ${afterLogin}`);

  // ── 3. NAVIGATE TO PROFILE > SECURITY TAB ─────────────────────────────
  console.log("\n" + "═".repeat(50));
  console.log("STEP 3: PROFILE SECURITY TAB");
  console.log("═".repeat(50));

  await page.goto(`${BASE}/profile`);
  await page.waitForTimeout(2000);
  await shot(page, "06-profile-page");

  const profileTitle = await page.title();
  log("ℹ️", "Profile page title", profileTitle);
  log(page.url().includes("/profile") ? "✅" : "❌", "Profile page loaded", page.url());

  // Click Security tab
  const secTab = page.getByRole("tab", { name: /security/i });
  const secTabExists = await secTab.count() > 0;
  log(secTabExists ? "✅" : "❌", "Security tab found");

  if (secTabExists) {
    await secTab.click();
    await page.waitForTimeout(1000);
    await shot(page, "07-security-tab");
  }

  // ── 4. 2FA SECTION EXISTS ──────────────────────────────────────────────
  console.log("\n" + "═".repeat(50));
  console.log("STEP 4: 2FA SECTION UI CHECK");
  console.log("═".repeat(50));

  const twoFATitle = page.getByText(/two.factor authentication/i);
  const twoFAExists = await twoFATitle.count() > 0;
  log(twoFAExists ? "✅" : "❌", "2FA section visible on Security tab");

  const enableBtn = page.getByRole("button", { name: /enable 2fa/i });
  const enableBtnExists = await enableBtn.count() > 0;
  log(enableBtnExists ? "✅" : "❌", "Enable 2FA button present");

  // ── 5. CLICK ENABLE 2FA ────────────────────────────────────────────────
  console.log("\n" + "═".repeat(50));
  console.log("STEP 5: CLICK ENABLE 2FA");
  console.log("═".repeat(50));

  if (enableBtnExists) {
    await enableBtn.click();
    await page.waitForTimeout(1000);

    // New flow: password confirmation step appears first
    const passwordInput = page.locator('#enable-password');
    const hasPasswordStep = await passwordInput.count() > 0;
    log(hasPasswordStep ? "✅" : "❌", "Password confirmation step appeared after Enable click");

    if (hasPasswordStep) {
      await passwordInput.fill(TEST_PASS);
      await shot(page, "08a-password-entered");

      const continueBtn = page.getByRole("button", { name: /continue/i });
      if (await continueBtn.count() > 0) {
        await continueBtn.click();
        await page.waitForTimeout(3000);
      }
    }

    await shot(page, "08-after-enable-click");

    // Check API response
    const enableCall = apiLogs.find(r => r.url.includes("enable") || r.url.includes("two-factor"));
    if (enableCall) {
      log("ℹ️", "Enable 2FA API call", `${enableCall.url} → HTTP ${enableCall.status}`);
      log("ℹ️", "Enable API response body", enableCall.body);
      log(enableCall.status === 200 ? "✅" : "❌",
        "Enable 2FA API response", `HTTP ${enableCall.status}`);
    } else {
      log("❌", "Enable 2FA API call", "No API call intercepted for /two-factor/enable");
    }

    // Check for QR code display
    const qrImageEl = page.locator("canvas, svg[data-testid='qr'], img[alt*='QR'], img[alt*='qr'], svg rect");
    const qrImageExists = await qrImageEl.count() > 0;
    log(qrImageExists ? "✅" : "❌", "QR code rendered as image element (canvas/svg/img)");

    // Check that raw TOTP URI is NOT shown as text
    const qrAsText = await page.locator("p:has-text('otpauth://')").count() > 0;
    if (qrAsText) {
      log("❌", "BUG: QR code still displayed as raw otpauth:// text");
    } else {
      log("✅", "QR code not rendered as raw text (correct)");
    }

    // Check if setup form appeared
    const verifyInput = page.locator("input[placeholder='000000']");
    const verifyInputExists = await verifyInput.count() > 0;
    log(verifyInputExists ? "✅" : "❌", "TOTP verification input (6-digit) appeared");

    const backupCodesSection = page.getByText(/backup codes/i);
    log(await backupCodesSection.count() > 0 ? "✅" : "❌", "Backup codes section shown");
  }

  // ── 6. VERIFY TOTP CODE ────────────────────────────────────────────────
  console.log("\n" + "═".repeat(50));
  console.log("STEP 6: VERIFY TOTP CODE");
  console.log("═".repeat(50));

  const verifyInput = page.locator("input[placeholder='000000']");
  const hasVerifyInput = await verifyInput.count() > 0;

  if (interceptedTotpURI) {
    const secret = extractSecretFromURI(interceptedTotpURI);
    log("✅", "Extracted TOTP secret from URI", secret ? `${secret.slice(0, 8)}...` : "null");

    if (secret) {
      // Try current window and ±1 windows for clock skew
      for (const w of [0, -1, 1]) {
        const code = generateTOTP(secret, w);
        log("ℹ️", `Generated TOTP code (window ${w})`, code);
      }
      const totp = generateTOTP(secret);

      if (hasVerifyInput) {
        await verifyInput.fill(totp);
        await shot(page, "09-totp-filled");
        const verifyBtn = page.getByRole("button", { name: /verify.*enable/i });
        if (await verifyBtn.count() > 0) {
          await verifyBtn.click();
          await page.waitForTimeout(3000);
          await shot(page, "10-after-verify");

          const verifyCall = apiLogs.find(r =>
            r.url.includes("verify-totp") || r.url.includes("verifyTotp")
          );
          if (verifyCall) {
            log("ℹ️", "verifyTotp API call", `HTTP ${verifyCall.status}`);
            log("ℹ️", "verifyTotp response", verifyCall.body);
            log(verifyCall.status === 200 ? "✅" : "❌",
              "TOTP verification API result", `HTTP ${verifyCall.status}`);
          } else {
            log("❌", "verifyTotp API", "No call intercepted");
          }

          // Check if 2FA is now shown as enabled
          const enabledBadge = page.getByText(/enabled/i).filter({ has: page.locator("span, div") });
          const isNowEnabled = await page.getByText("Enabled").count() > 0;
          log(isNowEnabled ? "✅" : "❌", "2FA badge shows 'Enabled' after verification");
          const disableBtn = page.getByRole("button", { name: /disable 2fa/i });
          log(await disableBtn.count() > 0 ? "✅" : "❌", "Disable 2FA button appeared (confirms enable worked)");
        }
      }
    }
  } else {
    log("❌", "Could not extract totpURI from API response — enable step likely failed");
    if (hasVerifyInput) {
      await verifyInput.fill("000000");
      const verifyBtn = page.getByRole("button", { name: /verify.*enable/i });
      if (await verifyBtn.count() > 0) {
        await verifyBtn.click();
        await page.waitForTimeout(2000);
        await shot(page, "09-invalid-totp-attempt");
        log("ℹ️", "Submitted dummy code 000000 to test error handling");
      }
    }
  }

  await shot(page, "11-final-2fa-state");

  // ── 7. TEST LOGIN 2FA CHALLENGE ────────────────────────────────────────
  console.log("\n" + "═".repeat(50));
  console.log("STEP 7: TEST 2FA CHALLENGE ON LOGIN");
  console.log("═".repeat(50));

  await context.clearCookies();
  await page.goto(`${BASE}/login`);
  await page.fill('input[type="email"]', TEST_EMAIL);
  await page.fill('input[type="password"]', TEST_PASS);
  await page.click('button[type="submit"]');
  await page.waitForTimeout(3000);
  await shot(page, "12-login-after-2fa-enable");

  const loginUrl = page.url();
  const has2FAPrompt = await page.getByText(/verification code|authenticator|enter.*code|two.factor/i).count() > 0;
  const twofaInput = await page.locator('input[maxlength="6"], input[placeholder="000000"], input[placeholder*="code" i]').count();

  log("ℹ️", "Post-login URL after 2FA enabled", loginUrl);
  log(has2FAPrompt ? "✅" : "❌",
    "2FA challenge prompt shown after login",
    has2FAPrompt ? "Found 2FA prompt" : "MISSING — logged in without 2FA challenge");
  log(twofaInput > 0 ? "✅" : "❌",
    "TOTP input field present on login challenge page",
    twofaInput > 0 ? "Found" : "NOT FOUND");

  if (!has2FAPrompt && !loginUrl.includes("/login")) {
    log("❌", "CRITICAL BUG: User bypassed 2FA — logged in without entering TOTP code");
  }

  await shot(page, "13-2fa-login-challenge");

  // ── 8. CONSOLE ERRORS ─────────────────────────────────────────────────
  console.log("\n" + "═".repeat(50));
  console.log("STEP 8: CONSOLE ERRORS COLLECTED");
  console.log("═".repeat(50));

  const consoleErrors = [];
  page.on("console", msg => {
    if (msg.type() === "error") consoleErrors.push(msg.text());
  });

  // ── SUMMARY ───────────────────────────────────────────────────────────
  console.log("\n" + "═".repeat(50));
  console.log("API CALLS LOG");
  console.log("═".repeat(50));
  if (apiLogs.length === 0) {
    console.log("  No auth API calls intercepted");
  }
  for (const call of apiLogs) {
    console.log(`  [${call.status}] ${call.url}`);
    if (call.body) console.log(`         ${call.body.slice(0, 200)}`);
  }

  const passed = results.filter(r => r.icon === "✅").length;
  const failed = results.filter(r => r.icon === "❌").length;
  const info   = results.filter(r => r.icon === "ℹ️").length;

  console.log("\n╔══════════════════════════════════════════╗");
  console.log("║          2FA TEST SUMMARY                ║");
  console.log(`║  ✅ ${String(passed).padEnd(3)} passed  ❌ ${String(failed).padEnd(3)} failed  ℹ️  ${String(info).padEnd(3)} info  ║`);
  console.log("╚══════════════════════════════════════════╝");

  console.log("\nFull results:");
  for (const r of results) {
    if (r.icon !== "ℹ️") {
      console.log(`  ${r.icon} ${r.label}${r.detail ? ": " + r.detail : ""}`);
    }
  }

  // Write JSON summary
  const summary = {
    testUser: TEST_EMAIL,
    timestamp: new Date().toISOString(),
    passed, failed,
    apiCalls: apiLogs,
    results,
    screenshots,
    interceptedTotpURI: interceptedTotpURI ? "[PRESENT]" : "[NOT CAPTURED]",
  };
  require("fs").writeFileSync("2fa-test-results.json", JSON.stringify(summary, null, 2));
  console.log("\n📄 Detailed results: 2fa-test-results.json");
  console.log(`📸 Screenshots: ${screenshots.join(", ")}`);

  await browser.close();
  process.exit(failed > 0 ? 1 : 0);
})();
