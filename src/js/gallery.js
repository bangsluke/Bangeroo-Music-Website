import { Splide } from "@splidejs/splide";
import "@splidejs/splide/css";

const galleryImages = import.meta.glob("/public/images/gallery/*.{jpg,jpeg,png,webp,avif}", {
  eager: true,
  query: "?url",
  import: "default"
});

const placeholderGradients = [
  "linear-gradient(145deg, rgba(255, 0, 0, 0.7), rgba(19, 34, 87, 0.9))",
  "linear-gradient(145deg, rgba(188, 171, 160, 0.7), rgba(0, 0, 0, 0.9))",
  "linear-gradient(145deg, rgba(255, 215, 0, 0.7), rgba(19, 34, 87, 0.9))"
];

function createImageSlide(url, index) {
  const slide = document.createElement("li");
  slide.className = "splide__slide";

  const img = document.createElement("img");
  img.src = url;
  img.alt = `Bangeroo gallery image ${index + 1}`;
  img.loading = "lazy";
  img.decoding = "async";

  slide.append(img);
  return slide;
}

function createPlaceholderSlide(gradient, index) {
  const slide = document.createElement("li");
  slide.className = "splide__slide";

  const block = document.createElement("div");
  block.className = "placeholder-slide";
  block.style.background = gradient;
  block.setAttribute("aria-hidden", "true");
  block.setAttribute("title", `Placeholder slide ${index + 1}`);

  slide.append(block);
  return slide;
}

export function initGallery() {
  const listElement = document.querySelector("#gallery-slides");
  const splideRoot = document.querySelector(".splide");
  const emptyState = document.querySelector("#gallery-empty");

  if (!listElement || !splideRoot) {
    return;
  }

  const urls = Object.values(galleryImages);
  if (urls.length) {
    urls.forEach((url, index) => {
      listElement.append(createImageSlide(url, index));
    });
  } else {
    placeholderGradients.forEach((gradient, index) => {
      listElement.append(createPlaceholderSlide(gradient, index));
    });
    if (emptyState) {
      emptyState.classList.remove("hidden");
    }
  }

  const splide = new Splide(splideRoot, {
    type: "loop",
    autoplay: true,
    interval: 3000,
    pauseOnHover: true,
    lazyLoad: "nearby",
    perPage: 1,
    gap: "1rem",
    arrows: true,
    pagination: true
  });

  splide.mount();
}

export const __testables__ = {
  createImageSlide,
  createPlaceholderSlide
};
