function revealSection(target) {
  target.classList.add("is-visible");
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
