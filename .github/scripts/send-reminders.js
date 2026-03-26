/**
 * send-reminders.js
 *
 * Called by the GitHub Actions "Send Daily Nasi Reminders" workflow every 30 minutes.
 * Sends a OneSignal push notification to all subscribers whose reminder_time_utc tag
 * matches the current 30-minute UTC slot (e.g. "06:00" or "06:30").
 *
 * Required environment variables:
 *   ONESIGNAL_REST_API_KEY  – OneSignal REST API key (store as a repository secret)
 *
 * The ONESIGNAL_APP_ID is the public app ID and is safe to hard-code.
 */

"use strict";

const https = require("https");

const ONESIGNAL_APP_ID = "d70dc600-03a1-459b-9ab9-9bc7a4fcc1d6";
const REST_API_KEY = process.env.ONESIGNAL_REST_API_KEY;

if (!REST_API_KEY) {
  console.error("Error: ONESIGNAL_REST_API_KEY environment variable is not set.");
  console.error("Add it as a repository secret and reference it in the workflow.");
  process.exit(1);
}

// ── Helpers ──────────────────────────────────────────────────────────────────

/** Round a Date to the nearest 30-minute UTC slot and return "HH:MM". */
function currentUtcSlot(date) {
  const totalMinutes = date.getUTCHours() * 60 + date.getUTCMinutes();
  const rounded = Math.round(totalMinutes / 30) * 30 % 1440;
  const h = Math.floor(rounded / 60);
  const m = rounded % 60;
  return String(h).padStart(2, "0") + ":" + String(m).padStart(2, "0");
}

/** Perform a JSON HTTPS request. Returns a Promise<{status, body}>. */
function jsonRequest(options, payload) {
  return new Promise((resolve, reject) => {
    const req = https.request(options, (res) => {
      let data = "";
      res.on("data", (chunk) => { data += chunk; });
      res.on("end", () => {
        try { resolve({ status: res.statusCode, body: JSON.parse(data) }); }
        catch { resolve({ status: res.statusCode, body: data }); }
      });
    });
    req.on("error", reject);
    if (payload) req.write(payload);
    req.end();
  });
}

/** Fetch today's Nasi data from hebcal + nasi.json. Returns null if not a Nisan day. */
async function getTodayNasiContent() {
  const now = new Date();
  const gy = now.getUTCFullYear();
  const gm = now.getUTCMonth() + 1;
  const gd = now.getUTCDate();

  // 1. Convert Gregorian → Hebrew via Hebcal API
  const hebcalPath = `/converter?cfg=json&gy=${gy}&gm=${gm}&gd=${gd}&g2h=1`;
  const hebcalResult = await jsonRequest({
    hostname: "www.hebcal.com",
    path: hebcalPath,
    method: "GET",
  });

  if (hebcalResult.status !== 200 || !hebcalResult.body.hm) {
    console.warn("Hebcal API error:", hebcalResult.status, hebcalResult.body);
    return null;
  }

  const { hm, hd } = hebcalResult.body;

  // The Nasi is said only on days 1–13 of Nisan
  if (hm !== "Nisan" || hd < 1 || hd > 13) {
    console.log(`Today is ${hd} ${hm} – not a Nasi day.`);
    return null;
  }

  const dayKey = `${hd} Nisan`;

  // 2. Fetch nasi.json from the live site
  const nasiResult = await jsonRequest({
    hostname: "rememberthenasi.com",
    path: "/nasi.json",
    method: "GET",
  });

  if (nasiResult.status !== 200 || !nasiResult.body[dayKey]) {
    console.warn("Could not fetch nasi.json or day not found:", dayKey);
    return null;
  }

  const entry = nasiResult.body[dayKey];

  // Strip HTML tags and trim for notification body
  const englishText = (entry.english || "")
    .replace(/<[^>]+>/g, "")
    .trim()
    .slice(0, 120);

  return { dayKey, englishText };
}

// ── Main ─────────────────────────────────────────────────────────────────────

async function main() {
  const timeSlot = currentUtcSlot(new Date());
  console.log(`Running for UTC slot: ${timeSlot}`);

  const nasiContent = await getTodayNasiContent();

  let notifBody;
  if (nasiContent) {
    notifBody = nasiContent.englishText
      ? `${nasiContent.dayKey}: ${nasiContent.englishText}…`
      : `Today is ${nasiContent.dayKey}. Open the app to say the Nasi.`;
  } else {
    // Not a Nasi day – skip sending a notification
    console.log("No notification needed today.");
    return;
  }

  const payload = JSON.stringify({
    app_id: ONESIGNAL_APP_ID,
    filters: [
      { field: "tag", key: "reminder_time_utc", relation: "=", value: timeSlot },
    ],
    headings: { en: "Remember the Nasi! 🙏" },
    contents: { en: notifBody },
    url: "https://rememberthenasi.com",
    web_push_topic: "daily-nasi-reminder",
  });

  const result = await jsonRequest(
    {
      hostname: "onesignal.com",
      path: "/api/v1/notifications",
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        "Authorization": `Basic ${REST_API_KEY}`,
        "Content-Length": Buffer.byteLength(payload),
      },
    },
    payload
  );

  if (result.status === 200 && result.body.id) {
    console.log(`Notification sent (id: ${result.body.id}) to subscribers with reminder_time_utc=${timeSlot}.`);
  } else if (result.body && result.body.errors && result.body.errors[0] === "All included players are not subscribed") {
    console.log(`No subscribers with reminder_time_utc=${timeSlot} – nothing to send.`);
  } else {
    console.error("OneSignal API error:", result.status, JSON.stringify(result.body));
    process.exit(1);
  }
}

main().catch((err) => {
  console.error("Unexpected error:", err);
  process.exit(1);
});
