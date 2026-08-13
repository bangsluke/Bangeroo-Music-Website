function renderCredits(introEl, listEl, credits) {
  if (introEl) {
    introEl.textContent = credits.intro || "";
  }

  if (!listEl) {
    return;
  }

  listEl.innerHTML = "";
  (credits.people || []).forEach((person) => {
    const item = document.createElement("li");
    item.className = "thanks__item";

    const name = document.createElement("span");
    name.className = "thanks__name";
    name.textContent = person.name;

    const role = document.createElement("span");
    role.className = "thanks__role";
    role.textContent = person.role;

    item.append(name, role);
    listEl.append(item);
  });
}

export function initCredits(siteConfig) {
  const section = document.querySelector("#thanks");
  if (!section) {
    return;
  }

  const credits = siteConfig?.credits;
  if (!credits) {
    return;
  }

  const introEl = document.querySelector("#thanks-intro");
  const listEl = document.querySelector("#thanks-list");

  renderCredits(introEl, listEl, credits);
}

export const __testables__ = {
  renderCredits
};
