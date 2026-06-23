/**
 * Category Filter & Product Loader for the homepage
 * Integrates with ProductAPI to fetch and display products by category
 */

(function() {
  
  // Configuration for the product grid section
  var CONFIG = {
    // The selector for where to inject the category filter
    FILTER_CONTAINER_SELECTOR: '.page-width', 
    // The selector for the product grid to replace/update
    PRODUCT_GRID_SELECTOR: '.mfr-product__carousel', 
    // Default to show all products if no category is selected
    DEFAULT_CATEGORY_ID: null
  };

  // Track current filter state
  var state = {
    categories: [],
    selectedCategoryId: CONFIG.DEFAULT_CATEGORY_ID,
    products: []
  };

  /**
   * Initialize the category filter
   */
  async function initCategoryFilter() {
    console.log("[CategoryFilter] Initializing...");

    try {
      // Load categories from API
      await loadCategories();
      
      // Inject filter UI
      injectFilterUI();
      
      // Load initial products (all products)
      await loadProducts(CONFIG.DEFAULT_CATEGORY_ID);
      
      console.log("[CategoryFilter] Initialization complete.");
    } catch (err) {
      console.error("[CategoryFilter] Failed to initialize:", err);
    }
  }

  /**
   * Fetch categories and store them
   */
  async function loadCategories() {
    try {
      state.categories = await ProductAPI.fetchCategories();
      console.log("[CategoryFilter] Loaded categories:", state.categories);
    } catch (err) {
      console.error("[CategoryFilter] Failed to load categories:", err);
      state.categories = [];
    }
  }

  /**
   * Fetch products for a given category (null = all products)
   */
  async function loadProducts(categoryId) {
    state.selectedCategoryId = categoryId;
    
    try {
      state.products = await ProductAPI.fetchProductsByCategory(categoryId);
      console.log("[CategoryFilter] Loaded products:", state.products);
      
      // Render the product cards into the carousel area
      renderProducts();
      
      // Update active state on filter buttons
      updateFilterActiveState();
    } catch (err) {
      console.error("[CategoryFilter] Failed to load products:", err);
    }
  }

  /**
   * Render product cards into the carousel
   */
  function renderProducts() {
    var carousel = document.querySelector('.mfr-product__carousel');
    if (!carousel) {
      console.warn("[CategoryFilter] Product carousel not found, cannot render products.");
      return;
    }

    // Find the carousel track or items container
    var track = carousel.querySelector('.flickity-slider') || carousel;
    
    // Clear existing product items
    var existingItems = track.querySelectorAll('.product-carousel__item');
    existingItems.forEach(function(item) {
      item.remove();
    });

    // Build product carousel items
    var html = state.products.map(function(product, index) {
      var price = formatPrice(product.price, product.sale_price);
      var imageUrl = getProductImage(product);
      
      return `
        <div class="product-carousel__item mfr-carousel__item" data-index="${index}">
          <div class="product-carousel__item-inner">
            <div class="product-card" x-data x-ref="productCard" style="background: transparent;">
              <div class="product-card__media">
                <a href="/products/product.html?productId=${product.id}" aria-label="${escapeHtml(product.name)}">
                  <img 
                    src="${imageUrl}" 
                    alt="${escapeHtml(product.name)} Featured Image" 
                    width="600" 
                    loading="lazy" 
                    class="lozad" 
                    style="width: 100%; height: 100%; object-fit: cover;"
                  >
                </a>
                ${product.category_id ? 
                  `<div class="product-card__tags">
                    <span class="product-card__tag">${getCategoryName(product.category_id)}</span>
                  </div>` : ''}
              </div>
              <div class="product-card__info">
                <a href="/products/product.html?productId=${product.id}" aria-label="${escapeHtml(product.name)}">
                  <p class="product-card__info-title">${escapeHtml(product.name)}</p>
                  <span class="product-card__info-price">${price}</span>
                  ${product.short_description ? 
                    `<p class="product-card__info-description">${escapeHtml(product.short_description)}</p>` : ''}
                </a>
              </div>
            </div>
          </div>
        </div>
      `;
    }).join('');

    // If no products, show a message
    if (state.products.length === 0) {
      html = `
        <div class="product-carousel__item mfr-carousel__item" data-index="0">
          <div class="product-carousel__item-inner" style="text-align:center; padding:40px;">
            <p>No products found for this category.</p>
          </div>
        </div>
      `;
    }

    // Append new items
    var tempDiv = document.createElement('div');
    tempDiv.innerHTML = html;
    var items = tempDiv.querySelectorAll('.product-carousel__item');
    items.forEach(function(item) {
      track.appendChild(item);
    });

    // If Flickity is available, reload it
    if (window.Flickity && carousel.flickity) {
      carousel.flickity.reloadCells();
      carousel.flickity.resize();
    }
  }

  /**
   * Inject category filter buttons above the product carousel
   */
  function injectFilterUI() {
    var carousel = document.querySelector('.mfr-product__carousel');
    if (!carousel) {
      console.warn("[CategoryFilter] Product carousel not found, filtering disabled.");
      return;
    }

    // Check if filter already exists
    if (document.getElementById('categoryFilterContainer')) {
      return;
    }

    // Build filter container
    var filterContainer = document.createElement('div');
    filterContainer.id = 'categoryFilterContainer';
    filterContainer.className = 'category-filter-container';
    filterContainer.innerHTML = `
      <div class="category-filter-inner" style="text-align:center; padding: 20px 0;">
        <span class="category-filter-label" style="font-weight:bold; margin-right:15px;">Filter by:</span>
        <button 
          class="category-filter-btn is-active" 
          data-category-id="" 
          onclick="window.CategoryFilter.selectCategory(null)"
        >
          All Products
        </button>
        ${state.categories.map(function(cat) {
          return `
            <button 
              class="category-filter-btn" 
              data-category-id="${cat.id}" 
              onclick="window.CategoryFilter.selectCategory(${cat.id})"
            >
              ${escapeHtml(cat.name)}
            </button>
          `;
        }).join('')}
      </div>
    `;

    // Add basic styles for the filter
    var styles = document.createElement('style');
    styles.textContent = `
      .category-filter-container { border-bottom: 1px solid #e0e0e0; margin-bottom: 20px; }
      .category-filter-inner { display: flex; flex-wrap: wrap; justify-content: center; align-items: center; gap: 10px; }
      .category-filter-label { color: #333; }
      .category-filter-btn {
        padding: 8px 16px;
        border: 1px solid #ccc;
        background: #fff;
        border-radius: 20px;
        cursor: pointer;
        font-size: 14px;
        transition: all 0.2s ease;
      }
      .category-filter-btn:hover { background: #f0f0f0; }
      .category-filter-btn.is-active {
        background: #2a2857;
        color: #fff;
        border-color: #2a2857;
      }
    `;

    // Insert before the carousel
    carousel.parentNode.insertBefore(styles, carousel);
    carousel.parentNode.insertBefore(filterContainer, carousel);
  }

  /**
   * Update active state on filter buttons
   */
  function updateFilterActiveState() {
    var buttons = document.querySelectorAll('.category-filter-btn');
    buttons.forEach(function(btn) {
      var catId = btn.getAttribute('data-category-id');
      if ((catId === '' && state.selectedCategoryId === null) || 
          (parseInt(catId) === state.selectedCategoryId)) {
        btn.classList.add('is-active');
      } else {
        btn.classList.remove('is-active');
      }
    });
  }

  /**
   * Handle category selection
   * @param {number|null} categoryId
   */
  function selectCategory(categoryId) {
    loadProducts(categoryId);
  }

  /**
   * Helper: format product price with sale price support
   */
  function formatPrice(price, salePrice) {
    var formatter = new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD'
    });
    
    if (salePrice && salePrice < price) {
      return `<span style="text-decoration: line-through; color: #999; margin-right: 8px;">${formatter.format(price)}</span><span style="color: #dc3545;">${formatter.format(salePrice)}</span>`;
    }
    return formatter.format(price);
  }

  /**
   * Helper: get a placeholder image (since we don't have real images yet)
   */
  function getProductImage(product) {
    // Use a placeholder gradient image
    // In production, this would be an actual image URL from the product gallery
    var colors = ['e5e5e5', 'd1d5db', 'd4b58e', 'c0e571', 'ffcb96'];
    var color = colors[product.id % colors.length];
    return 'data:image/svg+xml,<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 600 400"><rect fill="%23${colors[product.id % colors.length]}" width="600" height="400"/><text fill="%23666" font-family="Arial" font-size="24" x="50%" y="50%" dominant-baseline="middle" text-anchor="middle">${escapeHtml(product.name)}</text></svg>';
  }

  /**
   * Helper: get category name by ID
   */
  function getCategoryName(categoryId) {
    if (!categoryId) return '';
    var cat = state.categories.find(function(c) { return c.id === categoryId; });
    return cat ? cat.name : '';
  }

  /**
   * Helper: escape HTML to prevent XSS
   */
  function escapeHtml(text) {
    if (!text) return '';
    var div = document.createElement('div');
    div.textContent = text;
    return div.innerHTML;
  }

  // Expose to global scope for onclick handlers
  window.CategoryFilter = {
    selectCategory: selectCategory,
    state: state
  };

  // Auto-initialize when DOM is ready
  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', initCategoryFilter);
  } else {
    initCategoryFilter();
  }

})();