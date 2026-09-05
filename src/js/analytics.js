const UMAMI_SCRIPT_SRC = "https://cloud.umami.is/script.js";
const UMAMI_WEBSITE_ID = import.meta.env.VITE_UMAMI_WEBSITE_ID;

function isConfiguredWebsiteId(websiteId) {
  return (
    typeof websiteId === "string" &&
    /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i.test(
      websiteId
    )
  );
}

function loadUmamiScript(websiteId) {
  if (document.querySelector(`script[data-website-id="${websiteId}"]`)) {
    return;
  }

  const script = document.createElement("script");
  script.defer = true;
  script.src = UMAMI_SCRIPT_SRC;
  script.dataset.websiteId = websiteId;
  document.head.appendChild(script);
}

export function trackEvent(eventName, eventData = {}) {
  if (!eventName) {
    return;
  }

  if (window.umami && typeof window.umami.track === "function") {
    window.umami.track(eventName, eventData);
  }
}

export function initAnalytics() {
  if (isConfiguredWebsiteId(UMAMI_WEBSITE_ID)) {
    loadUmamiScript(UMAMI_WEBSITE_ID);
  }

  const trackedElements = document.querySelectorAll("[data-umami-event]");
  trackedElements.forEach((element) => {
    element.addEventListener("click", () => {
      const eventName = element.getAttribute("data-umami-event");
      trackEvent(eventName);
    });
  });
}
