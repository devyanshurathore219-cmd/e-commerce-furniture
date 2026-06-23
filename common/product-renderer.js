/**
 * product-renderer.js
 * Reusable DOM rendering functions for CMS-driven product pages.
 * 
 * Each function looks for elements with data-cms attributes and populates
 * them with data fetched from the backend API.
 * 
 * Usage:
 *   ProductRenderer.renderAll(productId)
 *     .then(() => console.log("Product page rendered"))
 *     .catch(err => console.error(err));
 */

const ProductRenderer = (function() {

  // ====================================================================
  // HELPER: Find a section by its type from the sections array
  // ====================================================================
  function findSection(sections, type) {
    return sections.find(function(s) {
      return s.section_type === type;
    }) || null;
  }

  // ====================================================================
  // HELPER: Get an element by data-cms attribute
  // ====================================================================
  function getCmsEl(name) {
    return document.querySelector('[data-cms="' + name + '"]');
  }

  // ====================================================================
  // HELPER: Set innerText safely
  // ====================================================================
  function setText(el, text) {
    if (el) el.innerText = text || "";
  }

  // ====================================================================
  // HELPER: Set innerHTML safely
  // ====================================================================
  function setHTML(el, html) {
    if (el) el.innerHTML = html || "";
  }

  // ====================================================================
  // HELPER: Set src on an img element
  // ====================================================================
  function setSrc(el, src) {
    if (el && src) el.src = src;
  }

  // ====================================================================
  // HELPER: Set background-image on an element
  // ====================================================================
  function setBackground(el, url) {
    if (el && url) el.style.backgroundImage = 'url("' + url + '")';
  }

  // ====================================================================
  // RENDER: Hero Section
  // Looks for: hero-title, hero-subtitle, hero-content, hero-image
  // ====================================================================
  function renderHero(sections) {
    var hero = findSection(sections, "hero");
    if (!hero) return;

    setText(getCmsEl("hero-title"), hero.title);
    setText(getCmsEl("hero-subtitle"), hero.subtitle);
    setHTML(getCmsEl("hero-content"), hero.content);
    setSrc(getCmsEl("hero-image"), hero.image);
    setBackground(getCmsEl("hero-bg"), hero.image);
  }

  // ====================================================================
  // RENDER: Product Information
  // Looks for: product-title, product-subtitle, product-description,
  //            product-price, product-sale-price, product-sku, product-brand
  // ====================================================================
  function renderProductInfo(product) {
    if (!product) return;

    setText(getCmsEl("product-title"), product.name);
    setText(getCmsEl("product-subtitle"), product.short_description);
    setHTML(getCmsEl("product-description"), product.short_description);
    setText(getCmsEl("product-price"), product.price ? "$" + parseFloat(product.price).toFixed(2) : "");
    setText(getCmsEl("product-sale-price"), product.sale_price ? "$" + parseFloat(product.sale_price).toFixed(2) : "");
    setText(getCmsEl("product-sku"), product.sku);
    setText(getCmsEl("product-brand"), product.brand);
  }

  // ====================================================================
  // RENDER: Product Images Gallery
  // Looks for: product-images container, then populates with images
  // ====================================================================
  function renderProductImages(product) {
    var container = getCmsEl("product-images");
    if (!container || !product) return;

    // If product has an image field in sections or as direct field
    // For now, we rely on the product data and gallery endpoint
    // The gallery renderer below handles this
  }

  // ====================================================================
  // RENDER: Ingredients Section
  // Looks for: ingredients-title, ingredients-text, ingredients-image
  // ====================================================================
  function renderIngredients(sections) {
    var section = findSection(sections, "ingredients");
    if (!section) return;

    setText(getCmsEl("ingredients-title"), section.title);
    setHTML(getCmsEl("ingredients-text"), section.content);
    setSrc(getCmsEl("ingredients-image"), section.image);
  }

  // ====================================================================
  // RENDER: Benefits Section
  // Looks for: benefits-title, benefits-content
  // ====================================================================
  function renderBenefits(sections) {
    var section = findSection(sections, "benefits");
    if (!section) return;

    setText(getCmsEl("benefits-title"), section.title);
    setHTML(getCmsEl("benefits-content"), section.content);
    setSrc(getCmsEl("benefits-image"), section.image);
  }

  // ====================================================================
  // RENDER: Gallery Section
  // Looks for: gallery-container container
  // ====================================================================
  function renderGallery(galleryItems) {
    var container = getCmsEl("gallery-container");
    if (!container || !galleryItems || !galleryItems.length) return;

    // Clear existing gallery items (keep the container)
    container.innerHTML = "";

    galleryItems.forEach(function(item) {
      var img = document.createElement("img");
      img.src = item.image;
      img.alt = item.alt || "Gallery image";
      img.loading = "lazy";
      if (item.sort_order !== undefined) {
        img.dataset.sortOrder = item.sort_order;
      }
      container.appendChild(img);
    });
  }

  // ====================================================================
  // RENDER: Specifications Section
  // Looks for: specs-container (table or list)
  // ====================================================================
  function renderSpecifications(specs) {
    var container = getCmsEl("specs-container");
    if (!container || !specs || !specs.length) return;

    // Clear existing
    container.innerHTML = "";

    specs.forEach(function(spec) {
      var row = document.createElement("div");
      row.className = "spec-row";

      var nameEl = document.createElement("span");
      nameEl.className = "spec-name";
      nameEl.innerText = spec.spec_name;

      var valueEl = document.createElement("span");
      valueEl.className = "spec-value";
      valueEl.innerText = spec.spec_value;

      row.appendChild(nameEl);
      row.appendChild(valueEl);
      container.appendChild(row);
    });
  }

  // ====================================================================
  // RENDER: FAQ Section
  // Looks for: faq-container
  // ====================================================================
  function renderFaqs(faqs) {
    var container = getCmsEl("faq-container");
    if (!container || !faqs || !faqs.length) return;

    container.innerHTML = "";

    faqs.forEach(function(faq, index) {
      var item = document.createElement("div");
      item.className = "faq-item";

      var question = document.createElement("div");
      question.className = "faq-question";
      question.innerText = faq.question;

      var answer = document.createElement("div");
      answer.className = "faq-answer";
      answer.innerHTML = faq.answer;

      item.appendChild(question);
      item.appendChild(answer);
      container.appendChild(item);
    });
  }

  // ====================================================================
  // RENDER: CTA Section
  // Looks for: cta-title, cta-text, cta-button-text, cta-button-link
  // ====================================================================
  function renderCTA(sections) {
    var section = findSection(sections, "cta");
    if (!section) return;

    setText(getCmsEl("cta-title"), section.title);
    setHTML(getCmsEl("cta-text"), section.content);
    setText(getCmsEl("cta-button-text"), section.button_text);

    var btnLink = getCmsEl("cta-button-link");
    if (btnLink && section.button_link) {
      btnLink.href = section.button_link;
    }
  }

  // ====================================================================
  // RENDER: Footer Content
  // Looks for: footer-content
  // ====================================================================
  function renderFooter(sections) {
    var section = findSection(sections, "footer");
    if (!section) return;

    setHTML(getCmsEl("footer-content"), section.content);
  }

  // ====================================================================
  // MASTER RENDER: Orchestrates all rendering for a product
  // ====================================================================
  async function renderAll(productId) {
    try {
      // Load all data from the API
      var data = await ProductAPI.loadAllProductData(productId);

      // Render each section
      renderHero(data.sections);
      renderProductInfo(data.product);
      renderProductImages(data.product);
      renderIngredients(data.sections);
      renderBenefits(data.sections);
      renderGallery(data.gallery);
      renderSpecifications(data.specs);
      renderFaqs(data.faqs);
      renderCTA(data.sections);
      renderFooter(data.sections);

      console.log("[ProductRenderer] Product page rendered successfully for product ID:", productId);
      return data;
    } catch (err) {
      console.error("[ProductRenderer] Failed to render product page:", err);
      throw err;
    }
  }

  return {
    renderHero: renderHero,
    renderProductInfo: renderProductInfo,
    renderProductImages: renderProductImages,
    renderIngredients: renderIngredients,
    renderBenefits: renderBenefits,
    renderGallery: renderGallery,
    renderSpecifications: renderSpecifications,
    renderFaqs: renderFaqs,
    renderCTA: renderCTA,
    renderFooter: renderFooter,
    renderAll: renderAll
  };

})();