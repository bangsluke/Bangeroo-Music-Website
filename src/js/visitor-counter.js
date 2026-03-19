export function getMilestoneMessage(milestones, count) {
  return milestones?.[count] || `You are visitor #${count}`;
}

export async function initVisitorCounter(siteConfig) {
  const node = document.querySelector("#visitor-counter");
  const endpoint = siteConfig?.visitorCounter?.endpoint;
  if (!node || !endpoint) {
    return;
  }

  try {
    const response = await fetch(endpoint);
    if (!response.ok) {
      const errorBody = await response.json().catch(() => ({}));
      node.textContent = errorBody.error || "Visitor counter offline";
      return;
    }
    const data = await response.json();
    const count = Number(data?.count || 0);
    node.textContent = getMilestoneMessage(siteConfig.counterMilestones, count);
  } catch {
    node.textContent = "Visitor counter offline";
  }
}
