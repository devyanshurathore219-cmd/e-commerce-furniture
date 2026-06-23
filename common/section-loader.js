/**
 * section-loader.js
 * Dynamic CMS section injector for products page.
 *
 * Fetches sections from /api/sections/:productId
 * and injects them into placeholder containers in products.html
 * without removing existing structural elements.
 *
 * Sections are matched by data-cms-section attribute.
 * If no attribute exists, sections are appended in order.
 */

const SectionLoader = (function () {
  const API_BASE = "http://localhost:5000/api";
  let currentProductId = null;
  let isLoaded = false;

  async function fetchSections(productId) {
    const res = await fetch(`${API_BASE}/sections/${productId}`);
    if (!res.ok) {
      throw new Error(`Failed to fetch sections: ${res.status}`);
    }
    return res.json();
  }

  function getSectionContainers() {
    return document.querySelectorAll(".section-content[data-cms-section], .section-content");
  }

  function injectSection(container, section) {
    if (!container.hasAttribute("data-cms-section")) {
      container.setAttribute("data-cms-section", section.section_type || "");
    }

    let inner = container.querySelector(".cms-section-inner");
    if (!inner) {
      inner = document.createElement("div");
      inner.className = "cms-section-inner";
      if (container.lastChild) {
        container.insertBefore(inner, container.lastChild.nextSibling);
      } else {
        container.appendChild(inner);
      }
    }

    const html = renderSectionHTML(section);
    inner.innerHTML = html;

    container.dispatchEvent(
      new CustomEvent("cmsSectionInjected", {
        detail: { section, container },
        bubbles: true,
      })
    );
  }

  function renderSectionHTML(section) {
    const type = section.section_type || "text";
    switch (type) {
      case "hero":
        return renderHero(section);
      case "text":
      case "richtext":
        return renderText(section);
      case "image_gallery":
      case "gallery":
        return renderGallery(section);
      case "benefits":
      case "features":
        return renderBenefits(section);
      case "ingredients":
        return renderIngredients(section);
      case "faq":
        return renderFAQ(section);
      case "specs":
      case "specifications":
        return renderSpecs(section);
      case "cta":
        return renderCTA(section);
      case "video":
        return renderVideo(section);
      default:
        return renderDefault(section);
    }
  }

  function escapeHTML(str) {
    if (!str) return "";
    const div = document.createElement("div");
    div.appendChild(document.createTextNode(str));
    return div.innerHTML;
  }

  function renderHero(section) {
    const title = escapeHTML(section.title || "");
    const subtitle = escapeHTML(section.subtitle || section.description || "");
    const image = section.image || section.background_image || "";
    const ctaText = escapeHTML(section.cta_text || "");
    const ctaLink = section.cta_link || "#";
    const alignment = section.alignment || "center";

    return `
      <div class="cms-hero" style="text-align:${alignment};${image ? `background-image:url(${image});background-size:cover;background-position:center;` : ""}">
        <h1 class="cms-hero__title">${title}</h1>
        <p class="cms-hero__subtitle">${subtitle}</p>
        ${ctaText ? `<a href="${ctaLink}" class="cms-hero__cta">${ctaText}</a>` : ""}
      </div>
    `;
  }

  function renderText(section) {
    const title = escapeHTML(section.title || "");
    const body = escapeHTML(section.body || section.description || "");

    return `
      <div class="cms-text">
        ${title ? `<h2 class="cms-text__title">${title}</h2>` : ""}
        <div class="cms-text__body">${body}</div>
      </div>
    `;
  }

  function renderGallery(section) {
    const images = section.images || [];
    if (!images.length) {
      return `<div class="cms-gallery"><p>No gallery images available.</p></div>`;
    }

    const items = images
      .map((img, i) => `
      <div class="cms-gallery__item">
        <img src="${escapeHTML(img.url || img.src || img)}" alt="${escapeHTML(img.alt || "Gallery image " + (i + 1))}" loading="lazy" />
      </div>
    `)
      .join("");

    return `
      <div class="cms-gallery">${items}</div>
    `;
  }

  function renderBenefits(section) {
    const items = section.items || section.benefits || [];
    if (!items.length) {
      return `<div class="cms-benefits"><p>No benefits listed.</p></div>`;
    }

    const listItems = items
      .map((item) => `
      <li class="cms-benefits__item">
        <span class="cms-benefits__icon">${item.icon ? `<img src="${escapeHTML(item.icon)}" alt="" width="24" height="24" />` : "•"}</span>
        <span>${escapeHTML(item.title || item.text || item)}</span>
      </li>
    `)
      .join("");

    const title = escapeHTML(section.title || "");

    return `
      <div class="cms-benefits">
        ${title ? `<h3 class="cms-benefits__title">${title}</h3>` : ""}
        <ul class="cms-benefits__list">${listItems}</ul>
      </div>
    `;
  }

  function renderIngredients(section) {
    const ingredients = section.ingredients || section.items || [];
    const title = escapeHTML(section.title || "Ingredients");

    const listItems = ingredients
      .map((ing) => `
      <li>${escapeHTML(ing.name || ing)}</li>
    `)
      .join("");

    return `
      <div class="cms-ingredients">
        <h3 class="cms-ingredients__title">${title}</h3>
        <ul class="cms-ingredients__list">${listItems}</ul>
      </div>
    `;
  }

  function renderFAQ(section) {
    const faqs = section.faqs || section.items || [];
    const title = escapeHTML(section.title || "Frequently Asked Questions");

    const items = faqs
      .map((faq, i) => {
        const q = escapeHTML(faq.question || faq.q || "");
        const a = escapeHTML(faq.answer || faq.a || "");
        return `
        <details class="cms-faq__item">
          <summary class="cms-faq__question">${q}</summary>
          <div class="cms-faq__answer">${a}</div>
        </details>
      `;
      })
      .join("");

    return `
      <div class="cms-faq">
        <h3 class="cms-faq__title">${title}</h3>
        <div class="cms-faq__list">${items}</div>
      </div>
    `;
  }

  function renderSpecs(section) {
    const specs = section.specs || section.items || [];
    const title = escapeHTML(section.title || "Specifications");

    const rows = specs
      .map((spec) => {
        const key = escapeHTML(spec.key || spec.label || "");
        const value = escapeHTML(spec.value || spec.val || "");
        return `
        <tr class="cms-specs__row">
          <td class="cms-specs__key">${key}</td>
          <td class="cms-specs__value">${value}</td>
        </tr>
      `;
      })
      .join("");

    return `
      <div class="cms-specs">
        ${title ? `<h3 class="cms-specs__title">${title}</h3>` : ""}
        <table class="cms-specs__table">
          <tbody>${rows}</tbody>
        </table>
      </div>
    `;
  }

  function renderCTA(section) {
    const title = escapeHTML(section.title || "");
    const body = escapeHTML(section.body || section.description || "");
    const buttonText = escapeHTML(section.button_text || section.cta_text || "");
    const buttonLink = section.button_link || section.cta_link || "#";
    const alignment = section.alignment || "center";

    return `
      <div class="cms-cta" style="text-align:${alignment}">
        ${title ? `<h2 class="cms-cta__title">${title}</h2>` : ""}
        ${body ? `<p class="cms-cta__body">${body}</p>` : ""}
        ${buttonText ? `<a href="${buttonLink}" class="cms-cta__button">${buttonText}</a>` : ""}
      </div>
    `;
  }

  function renderVideo(section) {
    const url = section.video_url || section.url || "";
    const embedUrl = convertToEmbedUrl(url);

    return `
      <div class="cms-video">
        ${embedUrl ? `<iframe src="${embedUrl}" frameborder="0" allowfullscreen loading="lazy"></iframe>` : "<p>Video unavailable.</p>"}
      </div>
    `;
  }

  function convertToEmbedUrl(url) {
    if (!url) return "";
    const ytMatch = url.match(/(?:youtube\.com\/watch\?v=|youtu\.be\/)([A-Za-z0-9_-]{11})/);
    if (ytMatch) {
      return `https://www.youtube.com/embed/${ytMatch[1]}`;
    }
    const vimeoMatch = url.match(/vimeo\.com\/(\d+)/);
    if (vimeoMatch) {
      return `https://player.vimeo.com/video/${vimeoMatch[1]}`;
    }
    return url;
  }

  function renderDefault(section) {
    const title = escapeHTML(section.title || "");
    const body = escapeHTML(section.body || section.description || JSON.stringify(section));

    return `
      <div class="cms-default">
        ${title ? `<h3 class="cms-default__title">${title}</h3>` : ""}
        <div class="cms-default__body">${body}</div>
      </div>
    `;
  }

  function matchAndInject(sections, containers) {
    const sectionMap = new Map();
    sections.forEach((section, index) => {
      const key = (section.section_type || `section-${index}`).toLowerCase();
      sectionMap.set(key, section);
    });

    const injected = new Set();

    containers.forEach((container) => {
      const attr = (container.getAttribute("data-cms-section") || "").toLowerCase();
      let targetSection = attr && sectionMap.has(attr) ? sectionMap.get(attr) : null;

      if (!targetSection) {
        for (const [key, sec] of sectionMap.entries()) {
          if (!injected.has(key)) {
            targetSection = sec;
            injected.add(key);
            break;
          }
        }
      } else if (targetSection) {
        injected.add(attr);
      }

      if (targetSection) {
        injectSection(container, targetSection);
      }
    });

    const remaining = [];
    sectionMap.forEach((section, key) => {
      if (!injected.has(key)) {
        remaining.push(section);
      }
    });

    if (remaining.length > 0) {
      const lastContainer = containers.length > 0 ? containers[containers.length - 1] : null;
      if (lastContainer) {
        remaining.forEach((section) => injectSection(lastContainer, section));
      }
    }
  }

  async function load(productId) {
    if (isLoaded) return;
    currentProductId = productId;

    try {
      const sections = await fetchSections(productId);
      const containers = getSectionContainers();

      if (containers.length === 0) {
        console.warn("SectionLoader: No .section-content containers found.");
        return;
      }

      matchAndInject(sections, containers);
      isLoaded = true;
    } catch (err) {
      console.error("SectionLoader: Failed to load CMS sections.", err);
    }
  }

  async function reload() {
    if (!currentProductId) return;
    isLoaded = false;
    document.querySelectorAll(".cms-section-inner").forEach((el) => el.remove());
    await load(currentProductId);
  }

  function markContainers(mapping) {
    if (!mapping || typeof mapping !== "object") return;
    Object.entries(mapping).forEach(([type, selector]) => {
      const el = document.querySelector(selector);
      if (el && el instanceof HTMLElement) {
        el.setAttribute("data-cms-section", type);
      }
    });
  }

  return {
    load,
    reload,
    fetchSections,
    injectSection,
    markContainers,
  };
})();

if (typeof module !== "undefined" && module.exports) {
  module.exports = SectionLoader;
} else {
  window.SectionLoader = SectionLoader;
}