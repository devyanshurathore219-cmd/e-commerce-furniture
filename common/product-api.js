/**
 * product-api.js
 * Reusable API functions for fetching CMS-driven product data.
 * 
 * GET  /api/products/:id           - Product details
 * GET  /api/sections/:productId    - Dynamic sections for a product
 * GET  /api/products/:id/gallery   - Gallery images
 * GET  /api/products/:id/faqs      - FAQs
 * GET  /api/products/:id/specs     - Specifications
 */

const ProductAPI = (function() {

  const API_BASE = "http://localhost:5000/api";

  /**
   * Fetch a single product by ID
   * @param {number} productId
   * @returns {Promise<Object>}
   */
  async function fetchProduct(productId) {
    const res = await fetch(API_BASE + "/products/" + productId);
    if (!res.ok) throw new Error("Failed to fetch product: " + res.status);
    return res.json();
  }

  /**
   * Fetch all dynamic sections for a product (hero, ingredients, benefits, cta, footer, etc.)
   * @param {number} productId
   * @returns {Promise<Array>}
   */
  async function fetchSections(productId) {
    const res = await fetch(API_BASE + "/sections/" + productId);
    if (!res.ok) throw new Error("Failed to fetch sections: " + res.status);
    return res.json();
  }

  /**
   * Fetch gallery images for a product
   * @param {number} productId
   * @returns {Promise<Array>}
   */
  async function fetchGallery(productId) {
    const res = await fetch(API_BASE + "/products/" + productId + "/gallery");
    if (!res.ok) throw new Error("Failed to fetch gallery: " + res.status);
    return res.json();
  }

  /**
   * Fetch FAQs for a product
   * @param {number} productId
   * @returns {Promise<Array>}
   */
  async function fetchFaqs(productId) {
    const res = await fetch(API_BASE + "/products/" + productId + "/faqs");
    if (!res.ok) throw new Error("Failed to fetch FAQs: " + res.status);
    return res.json();
  }

  /**
   * Fetch specifications for a product
   * @param {number} productId
   * @returns {Promise<Array>}
   */
  async function fetchSpecs(productId) {
    const res = await fetch(API_BASE + "/products/" + productId + "/specs");
    if (!res.ok) throw new Error("Failed to fetch specs: " + res.status);
    return res.json();
  }

  /**
   * Fetch all categories
   * @returns {Promise<Array>}
   */
  async function fetchCategories() {
    const res = await fetch(API_BASE + "/categories");
    if (!res.ok) throw new Error("Failed to fetch categories: " + res.status);
    return res.json();
  }

  /**
   * Fetch products filtered by category
   * @param {number|null} categoryId
   * @returns {Promise<Array>}
   */
  async function fetchProductsByCategory(categoryId) {
    const url = categoryId
      ? `${API_BASE}/products?category_id=${categoryId}`
      : `${API_BASE}/products`;
    const res = await fetch(url);
    if (!res.ok) throw new Error("Failed to fetch products: " + res.status);
    return res.json();
  }

  /**
   * Fetch all product data in parallel for a given product ID
   * @param {number} productId
   * @returns {Promise<{product: Object, sections: Array, gallery: Array, faqs: Array, specs: Array}>}
   */
  async function loadAllProductData(productId) {
    const [product, sections, gallery, faqs, specs] = await Promise.all([
      fetchProduct(productId),
      fetchSections(productId),
      fetchGallery(productId),
      fetchFaqs(productId),
      fetchSpecs(productId)
    ]);

    return { product, sections, gallery, faqs, specs };
  }

    return {
      fetchProduct: fetchProduct,
      fetchSections: fetchSections,
      fetchGallery: fetchGallery,
      fetchFaqs: fetchFaqs,
      fetchSpecs: fetchSpecs,
      loadAllProductData: loadAllProductData,
      fetchCategories: fetchCategories,
      fetchProductsByCategory: fetchProductsByCategory,
      API_BASE: API_BASE
    };

})();