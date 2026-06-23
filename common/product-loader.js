/**
 * product-loader.js
 * Page-specific initialization script for the product page.
 * Uses the reusable ProductAPI and ProductRenderer modules.
 * 
 * This script runs when the product page loads and fetches
 * all dynamic content from the backend API.
 */

(function() {

  // Configuration: which product ID to load
  // This can be changed per page or parsed from URL parameters
  var PRODUCT_ID = 1;

  // Allow overriding via URL parameter: ?productId=2
  var urlParams = new URLSearchParams(window.location.search);
  if (urlParams.has("productId")) {
    PRODUCT_ID = parseInt(urlParams.get("productId"), 10) || 1;
  }

  /**
   * Initialize the product page by loading all data from the API
   * and rendering it into the DOM.
   */
  async function initProductPage() {
    console.log("[ProductLoader] Initializing product page for ID:", PRODUCT_ID);

    try {
      // Use the ProductRenderer to fetch and render all data
      await ProductRenderer.renderAll(PRODUCT_ID);

      // Dispatch a custom event so other scripts can react
      document.dispatchEvent(new CustomEvent("productRendered", {
        detail: { productId: PRODUCT_ID }
      }));

      console.log("[ProductLoader] Product page initialization complete.");
    } catch (err) {
      console.error("[ProductLoader] Failed to initialize product page:", err);
    }
  }

  // Run when DOM is ready
  if (document.readyState === "loading") {
    document.addEventListener("DOMContentLoaded", initProductPage);
  } else {
    initProductPage();
  }

})();