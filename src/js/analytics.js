export function trackEvent(eventName, eventData = {}) {
  if (!eventName) {
    return;
  }

  if (window.umami && typeof window.umami.track === "function") {
    window.umami.track(eventName, eventData);
  }
}

export function initAnalytics() {
  const trackedElements = document.querySelectorAll("[data-umami-event]");
  trackedElements.forEach((element) => {
    element.addEventListener("click", () => {
      const eventName = element.getAttribute("data-umami-event");
      trackEvent(eventName);
    });
  });
}
