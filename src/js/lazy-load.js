const REVEAL_CLASS_MAP = {
  site: ["reveal-cinema", "reveal-drift", "reveal-veil"]
};

function getDesignKey() {
  const body = document.body;
  if (!body) {
    return "site";
  }
  return body.classList.contains("site") ? "site" : "site";
}

function hashKey(input) {
  return [...input].reduce((acc, char) => acc + char.charCodeAt(0), 0);
}

function randomFrom(array) {
  return array[Math.floor(Math.random() * array.length)];
}

function revealSection(target) {
  target.classList.add("is-visible");

  if (!document.body.classList.contains("is-chaos-enabled")) {
    return;
  }

  const reducedMotion =
    typeof window.matchMedia === "function" &&
    window.matchMedia("(prefers-reduced-motion: reduce)").matches;
  if (reducedMotion) {
    return;
  }

  const designKey = getDesignKey();
  const revealSet = REVEAL_CLASS_MAP[designKey] || REVEAL_CLASS_MAP.site;
  const identity = target.id || target.getAttribute("aria-labelledby") || "section";
  const deterministicClass = revealSet[hashKey(identity) % revealSet.length];
  const randomClass = randomFrom(revealSet);
  const revealClass = Math.random() > 0.5 ? randomClass : deterministicClass;
  const secondaryClass = randomFrom(revealSet);
  target.classList.add(revealClass, "is-chaos-burst");
  if (secondaryClass !== revealClass) {
    target.classList.add(secondaryClass);
  }

  window.setTimeout(() => {
    target.classList.remove("is-chaos-burst");
  }, 350 + Math.floor(Math.random() * 550));
}

function loadDataSource(target) {
  const source = target.getAttribute("data-src");
  if (!source) {
    return;
  }

  target.setAttribute("src", source);
  target.removeAttribute("data-src");
}

export function initLazyLoad() {
  const lazyTargets = [
    ...document.querySelectorAll("[data-src]"),
    ...document.querySelectorAll(".lazy-section")
  ];

  if (!lazyTargets.length) {
    return;
  }

  const observer = new IntersectionObserver(
    (entries, io) => {
      entries.forEach((entry) => {
        if (!entry.isIntersecting) {
          return;
        }

        const target = entry.target;
        if (target.classList.contains("lazy-section")) {
          revealSection(target);
        }

        if (target.hasAttribute("data-src")) {
          loadDataSource(target);
        }

        io.unobserve(target);
      });
    },
    {
      root: null,
      rootMargin: "200px 0px",
      threshold: 0.1
    }
  );

  lazyTargets.forEach((target) => observer.observe(target));
}

export const __testables__ = {
  revealSection,
  loadDataSource
};
