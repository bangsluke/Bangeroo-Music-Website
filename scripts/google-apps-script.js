/**
 * Bangeroo monthly Umami analytics email report.
 *
 * Required Script Properties:
 * - UMAMI_API_URL      Example: https://api.umami.is/v1
 * - UMAMI_API_TOKEN    Bearer token created in Umami
 * - UMAMI_WEBSITE_ID   Umami website UUID
 * - RECIPIENT_EMAIL    Destination email for the monthly summary
 */

function sendMonthlyReport() {
  const props = PropertiesService.getScriptProperties();
  const apiUrl = props.getProperty("UMAMI_API_URL");
  const apiToken = props.getProperty("UMAMI_API_TOKEN");
  const websiteId = props.getProperty("UMAMI_WEBSITE_ID");
  const recipientEmail = props.getProperty("RECIPIENT_EMAIL");

  validateRequiredProperties_(apiUrl, apiToken, websiteId, recipientEmail);

  const range = getPreviousMonthRange_();
  const headers = {
    Authorization: "Bearer " + apiToken,
    Accept: "application/json"
  };

  const stats = fetchUmamiStats_(apiUrl, websiteId, range.start, range.end, headers);
  const events = fetchUmamiEvents_(apiUrl, websiteId, range.start, range.end, headers);
  const htmlBody = buildReportHtml_(stats, events, range.label);
  const plainBody = stripHtml_(htmlBody);

  GmailApp.sendEmail(
    recipientEmail,
    "Bangeroo Monthly Analytics Report - " + range.label,
    plainBody,
    { htmlBody: htmlBody }
  );
}

function createMonthlyTrigger() {
  ScriptApp.newTrigger("sendMonthlyReport")
    .timeBased()
    .onMonthDay(1)
    .atHour(9)
    .create();
}

function validateRequiredProperties_(apiUrl, apiToken, websiteId, recipientEmail) {
  if (!apiUrl || !apiToken || !websiteId || !recipientEmail) {
    throw new Error(
      "Missing required script properties. Set UMAMI_API_URL, UMAMI_API_TOKEN, UMAMI_WEBSITE_ID, and RECIPIENT_EMAIL."
    );
  }
}

function getPreviousMonthRange_() {
  const now = new Date();
  const start = new Date(now.getFullYear(), now.getMonth() - 1, 1, 0, 0, 0);
  const end = new Date(now.getFullYear(), now.getMonth(), 1, 0, 0, 0);
  const label = Utilities.formatDate(start, Session.getScriptTimeZone(), "MMMM yyyy");
  return {
    start: start.getTime(),
    end: end.getTime(),
    label: label
  };
}

function fetchUmamiStats_(apiUrl, websiteId, startAt, endAt, headers) {
  const statsUrl =
    apiUrl +
    "/websites/" +
    encodeURIComponent(websiteId) +
    "/stats?startAt=" +
    startAt +
    "&endAt=" +
    endAt;

  const response = UrlFetchApp.fetch(statsUrl, {
    method: "get",
    headers: headers,
    muteHttpExceptions: false
  });

  return JSON.parse(response.getContentText());
}

function fetchUmamiEvents_(apiUrl, websiteId, startAt, endAt, headers) {
  const eventsUrl =
    apiUrl +
    "/websites/" +
    encodeURIComponent(websiteId) +
    "/events?startAt=" +
    startAt +
    "&endAt=" +
    endAt +
    "&limit=1000";

  const response = UrlFetchApp.fetch(eventsUrl, {
    method: "get",
    headers: headers,
    muteHttpExceptions: false
  });

  const parsed = JSON.parse(response.getContentText());
  if (Array.isArray(parsed)) {
    return parsed;
  }
  if (parsed && Array.isArray(parsed.data)) {
    return parsed.data;
  }
  return [];
}

function buildReportHtml_(stats, events, monthLabel) {
  const pageViews = stats.pageviews && stats.pageviews.value ? stats.pageviews.value : 0;
  const visitors = stats.visitors && stats.visitors.value ? stats.visitors.value : 0;
  const referrers = extractTopReferrers_(stats);
  const eventCounts = countEvents_(events);
  const songClicks = eventCounts["spotify-song-click"] || 0;
  const easterEggClicks = eventCounts["easter-egg-click"] || 0;

  const referrerList = referrers.length
    ? "<ul>" + referrers.map(function (r) { return "<li>" + escapeHtml_(r.name) + ": " + r.count + "</li>"; }).join("") + "</ul>"
    : "<p>No referrer data available.</p>";

  return (
    "<h2>Bangeroo Monthly Report - " +
    escapeHtml_(monthLabel) +
    "</h2>" +
    "<p><strong>Total page views:</strong> " +
    pageViews +
    "</p>" +
    "<p><strong>Unique visitors:</strong> " +
    visitors +
    "</p>" +
    "<h3>Top referrers</h3>" +
    referrerList +
    "<h3>Key events</h3>" +
    "<ul>" +
    "<li>Song click events: " +
    songClicks +
    "</li>" +
    "<li>Easter egg clicks: " +
    easterEggClicks +
    "</li>" +
    "</ul>" +
    "<p>Generated automatically by Google Apps Script.</p>"
  );
}

function extractTopReferrers_(stats) {
  const candidates = [];
  if (stats && Array.isArray(stats.referrers)) {
    stats.referrers.forEach(function (r) {
      candidates.push({ name: r.x || r.referrer || "direct", count: r.y || r.value || 0 });
    });
  }
  return candidates
    .sort(function (a, b) {
      return b.count - a.count;
    })
    .slice(0, 5);
}

function countEvents_(events) {
  return events.reduce(function (acc, eventEntry) {
    const eventName = eventEntry.eventName || eventEntry.event || "unknown";
    acc[eventName] = (acc[eventName] || 0) + 1;
    return acc;
  }, {});
}

function escapeHtml_(value) {
  return String(value)
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/\"/g, "&quot;")
    .replace(/'/g, "&#39;");
}

function stripHtml_(html) {
  return html
    .replace(/<[^>]+>/g, "\n")
    .replace(/\n+/g, "\n")
    .trim();
}
