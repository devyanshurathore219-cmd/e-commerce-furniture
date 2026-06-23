/**
 * product-listing.js
 * CMS-driven product listing for pages/products.html.
 * Injects search, category filter, price filter, pagination, and product cards
 * without modifying existing HTML, CSS, or JavaScript.
 */

(function() {
  'use strict';

  var CONFIG = {
    API_BASE: 'http://localhost:5000/api',
    PRODUCTS_PER_PAGE: 12,
    PRODUCT_DETAIL_PATH: '../products/product.html',
    GRID_CONTAINER_ID: 'cms-product-grid',
    PAGINATION_CONTAINER_ID: 'cms-pagination-container',
    SEARCH_INPUT_ID: 'cms-search-input',
    CATEGORY_FILTER_ID: 'cms-category-filter',
    PRICE_MIN_ID: 'cms-price-min',
    PRICE_MAX_ID: 'cms-price-max',
    LISTING_ROOT_ID: 'cms-product-listing'
  };

  // ---------- Enquiry System ----------
  var ENQUIRY_API = CONFIG.API_BASE + '/enquiries';

  function injectEnquiryModal() {
    if (document.getElementById('cms-enquiry-modal')) return;

    var modal = document.createElement('div');
    modal.id = 'cms-enquiry-modal';
    modal.className = 'cms-enquiry-modal';
    modal.setAttribute('role', 'dialog');
    modal.setAttribute('aria-modal', 'true');
    modal.setAttribute('aria-label', 'Product Enquiry');
    modal.style.cssText =
      'display:none;position:fixed;top:0;left:0;width:100%;height:100%;' +
      'background:rgba(0,0,0,0.5);z-index:10000;align-items:center;justify-content:center;';

    modal.innerHTML =
      '<div class="cms-enquiry-modal__content" style="' +
        'background:#fff;border-radius:12px;padding:32px;max-width:500px;width:90%;' +
        'max-height:90vh;overflow-y:auto;position:relative;">' +
        '<button class="cms-enquiry-modal__close" aria-label="Close" style="' +
          'position:absolute;top:12px;right:16px;background:none;border:none;' +
          'font-size:28px;cursor:pointer;line-height:1;color:#666;">&times;</button>' +
        '<h3 style="margin:0 0 20px;font-size:22px;color:#201c1a;" data-cms="enquiry-title">Request a Quote</h3>' +
        '<p id="cms-enquiry-product-name" style="margin:0 0 16px;font-size:14px;color:#666;"></p>' +
        '<form id="cms-enquiry-form">' +
          '<input type="hidden" id="cms-enquiry-product-id" name="product_id" value="">' +
          '<div style="margin-bottom:12px;">' +
            '<label for="cms-enquiry-name" style="display:block;font-size:13px;font-weight:600;margin-bottom:4px;color:#201c1a;">Name *</label>' +
            '<input type="text" id="cms-enquiry-name" name="name" required style="' +
              'width:100%;padding:10px 12px;border:1px solid #d4d4d4;border-radius:6px;font-size:14px;">' +
          '</div>' +
          '<div style="margin-bottom:12px;">' +
            '<label for="cms-enquiry-email" style="display:block;font-size:13px;font-weight:600;margin-bottom:4px;color:#201c1a;">Email *</label>' +
            '<input type="email" id="cms-enquiry-email" name="email" required style="' +
              'width:100%;padding:10px 12px;border:1px solid #d4d4d4;border-radius:6px;font-size:14px;">' +
          '</div>' +
          '<div style="margin-bottom:12px;">' +
            '<label for="cms-enquiry-phone" style="display:block;font-size:13px;font-weight:600;margin-bottom:4px;color:#201c1a;">Phone</label>' +
            '<input type="tel" id="cms-enquiry-phone" name="phone" style="' +
              'width:100%;padding:10px 12px;border:1px solid #d4d4d4;border-radius:6px;font-size:14px;">' +
          '</div>' +
          '<div style="margin-bottom:16px;">' +
            '<label for="cms-enquiry-message" style="display:block;font-size:13px;font-weight:600;margin-bottom:4px;color:#201c1a;">Message</label>' +
            '<textarea id="cms-enquiry-message" name="message" rows="3" style="' +
              'width:100%;padding:10px 12px;border:1px solid #d4d4d4;border-radius:6px;font-size:14px;resize:vertical;"></textarea>' +
          '</div>' +
          '<button type="submit" id="cms-enquiry-submit" style="' +
            'width:100%;padding:12px;background:#2a2857;color:#fff;border:none;' +
            'border-radius:50px;font-size:16px;font-weight:600;cursor:pointer;">' +
            'Send Enquiry</button>' +
          '<p id="cms-enquiry-feedback" style="margin:10px 0 0;font-size:14px;display:none;"></p>' +
        '</form>' +
      '</div>';

    document.body.appendChild(modal);

    // Close handlers
    var closeBtn = modal.querySelector('.cms-enquiry-modal__close');
    closeBtn.addEventListener('click', closeEnquiryModal);
    modal.addEventListener('click', function(e) {
      if (e.target === modal) closeEnquiryModal();
    });
  }

  function openEnquiryModal(productId, productName) {
    var modal = document.getElementById('cms-enquiry-modal');
    if (!modal) return;
    modal.style.display = 'flex';
    document.getElementById('cms-enquiry-product-id').value = productId || '';
    var nameEl = document.getElementById('cms-enquiry-product-name');
    if (nameEl && productName) nameEl.textContent = 'Product: ' + productName;
    document.getElementById('cms-enquiry-feedback').style.display = 'none';
    document.getElementById('cms-enquiry-form').reset();
    document.body.style.overflow = 'hidden';
  }

  function closeEnquiryModal() {
    var modal = document.getElementById('cms-enquiry-modal');
    if (modal) modal.style.display = 'none';
    document.body.style.overflow = '';
  }

  function setupEnquiryForm() {
    var form = document.getElementById('cms-enquiry-form');
    if (!form) return;

    form.addEventListener('submit', async function(e) {
      e.preventDefault();
      var submitBtn = document.getElementById('cms-enquiry-submit');
      var feedback = document.getElementById('cms-enquiry-feedback');

      submitBtn.disabled = true;
      submitBtn.textContent = 'Submitting...';
      feedback.style.display = 'none';

      var payload = {
        name: document.getElementById('cms-enquiry-name').value.trim(),
        email: document.getElementById('cms-enquiry-email').value.trim(),
        phone: document.getElementById('cms-enquiry-phone').value.trim(),
        product_id: document.getElementById('cms-enquiry-product-id').value || null,
        message: document.getElementById('cms-enquiry-message').value.trim()
      };

      try {
        var res = await fetch(ENQUIRY_API, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(payload)
        });
        var data = await res.json();

        if (res.ok) {
          feedback.style.cssText = 'margin:10px 0 0;font-size:14px;color:#28a745;';
          feedback.textContent = 'Thank you! Your enquiry has been submitted. We will get back to you shortly.';
          feedback.style.display = 'block';
          form.reset();
          setTimeout(closeEnquiryModal, 2500);
        } else {
          throw new Error(data.error || 'Submission failed');
        }
      } catch (err) {
        feedback.style.cssText = 'margin:10px 0 0;font-size:14px;color:#dc3545;';
        feedback.textContent = 'Error: ' + err.message;
        feedback.style.display = 'block';
      } finally {
        submitBtn.disabled = false;
        submitBtn.textContent = 'Send Enquiry';
      }
    });
  }

  function requestQuoteForProduct(productId, productName) {
    if (!document.getElementById('cms-enquiry-modal')) {
      injectEnquiryModal();
      setupEnquiryForm();
    }
    openEnquiryModal(productId, productName);
  }
  // Expose globally so inline onclick can call it
  window.requestQuoteForProduct = requestQuoteForProduct;
  // ---------- End Enquiry System ----------

  var state = {
    allProducts: [],
    filteredProducts: [],
    categories: [],
    galleryCache: {},
    currentPage: 1,
    searchQuery: '',
    categoryId: null,
    priceMin: null,
    priceMax: null
  };

  function escapeHtml(text) {
    if (!text) return '';
    var div = document.createElement('div');
    div.textContent = text;
    return div.innerHTML;
  }

  function formatPrice(price, salePrice) {
    var formatter = new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD'
    });

    if (salePrice && parseFloat(salePrice) < parseFloat(price)) {
      return '<span class="cms-sale-price">' + formatter.format(salePrice) + '</span>' +
        '<span class="cms-original-price">' + formatter.format(price) + '</span>';
    }
    return formatter.format(price);
  }

  function getCategoryName(categoryId) {
    if (!categoryId) return '';
    var cat = state.categories.find(function(c) { return c.id === categoryId; });
    return cat ? cat.name : '';
  }

  function getProductImage(product) {
    if (state.galleryCache[product.id]) {
      return state.galleryCache[product.id];
    }

    var colors = ['e5e5e5', 'd1d5db', 'd4b58e', 'c0e571', 'ffcb96'];
    var color = colors[product.id % colors.length];
    var name = encodeURIComponent(product.name || 'Product');
    return 'data:image/svg+xml,<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 600 400"><rect fill="%23' + color + '" width="600" height="400"/><text fill="%23666" font-family="Arial" font-size="20" x="50%" y="50%" dominant-baseline="middle" text-anchor="middle">' + name + '</text></svg>';
  }

  async function fetchProducts() {
    if (window.ProductAPI && typeof window.ProductAPI.fetchProductsByCategory === 'function') {
      return window.ProductAPI.fetchProductsByCategory(state.categoryId);
    }

    var params = new URLSearchParams();
    if (state.categoryId) params.set('category_id', state.categoryId);
    var url = CONFIG.API_BASE + '/products' + (params.toString() ? '?' + params.toString() : '');
    var res = await fetch(url);
    if (!res.ok) throw new Error('Failed to fetch products: ' + res.status);
    return res.json();
  }

  async function fetchCategories() {
    if (window.ProductAPI && typeof window.ProductAPI.fetchCategories === 'function') {
      return window.ProductAPI.fetchCategories();
    }

    var res = await fetch(CONFIG.API_BASE + '/categories');
    if (!res.ok) throw new Error('Failed to fetch categories: ' + res.status);
    return res.json();
  }

  async function prefetchGalleryImages(products) {
    if (!window.ProductAPI || typeof window.ProductAPI.fetchGallery !== 'function') {
      return;
    }

    var tasks = products.slice(0, 24).map(async function(product) {
      try {
        var gallery = await window.ProductAPI.fetchGallery(product.id);
        if (gallery && gallery.length > 0 && gallery[0].image) {
          state.galleryCache[product.id] = gallery[0].image;
        }
      } catch (err) {
        /* keep placeholder */
      }
    });

    await Promise.all(tasks);
  }

  function applyFilters() {
    var products = state.allProducts.filter(function(p) {
      return !p.status || p.status === 'published' || p.status === 'draft';
    });

    if (state.searchQuery) {
      var query = state.searchQuery.toLowerCase();
      products = products.filter(function(p) {
        return (p.name && p.name.toLowerCase().indexOf(query) !== -1) ||
          (p.short_description && p.short_description.toLowerCase().indexOf(query) !== -1) ||
          (p.brand && p.brand.toLowerCase().indexOf(query) !== -1) ||
          (p.sku && p.sku.toLowerCase().indexOf(query) !== -1);
      });
    }

    if (state.priceMin !== null) {
      products = products.filter(function(p) {
        return parseFloat(p.price) >= state.priceMin;
      });
    }

    if (state.priceMax !== null) {
      products = products.filter(function(p) {
        return parseFloat(p.price) <= state.priceMax;
      });
    }

    state.filteredProducts = products;
    state.currentPage = 1;
    renderProducts();
    renderPagination();
    updateResultsCount();
  }

  function updateResultsCount() {
    var el = document.getElementById('cms-results-count');
    if (!el) return;
    el.textContent = state.filteredProducts.length + ' product' + (state.filteredProducts.length === 1 ? '' : 's') + ' found';
  }

  function getProductUrl(productId) {
    return CONFIG.PRODUCT_DETAIL_PATH + '?id=' + productId;
  }

  function createProductCard(product) {
    var card = document.createElement('div');
    card.className = 'product-card';
    card.setAttribute('data-cms-product-id', product.id);
    card.style.background = 'transparent';

    var imageUrl = getProductImage(product);
    var categoryName = getCategoryName(product.category_id);
    var detailUrl = getProductUrl(product.id);
    var priceHtml = formatPrice(product.price, product.sale_price);

    card.innerHTML =
      '<div class="product-card__media">' +
        '<a href="' + detailUrl + '" aria-label="' + escapeHtml(product.name) + '">' +
          '<img src="' + imageUrl + '" alt="' + escapeHtml(product.name) + ' Featured Image" width="600" loading="lazy" style="width: 100%; height: 100%; object-fit: cover;">' +
          (categoryName ? '<div class="product-card__tags"><span class="product-card__tag">' + escapeHtml(categoryName) + '</span></div>' : '') +
        '</a>' +
      '</div>' +
      '<div class="product-card__info">' +
        '<a href="' + detailUrl + '" aria-label="' + escapeHtml(product.name) + '">' +
          '<p class="product-card__info-title">' + escapeHtml(product.name || 'Untitled Product') + '</p>' +
          '<span class="product-card__info-price">' + priceHtml + '</span>' +
          (product.short_description ? '<p class="product-card__info-description">' + escapeHtml(product.short_description.length > 120 ? product.short_description.substring(0, 120) + '...' : product.short_description) + '</p>' : '') +
        '</a>' +
        '<button class="cms-enquiry-btn" onclick="event.stopPropagation(); window.requestQuoteForProduct(' + product.id + ', \'' + escapeHtml(product.name) + '\');" style="margin-top:10px;padding:8px 16px;background:#b50034;color:#fff;border:none;border-radius:50px;font-size:14px;cursor:pointer;width:100%;">Request Quote</button>' +
      '</div>';

    card.addEventListener('click', function(e) {
      if (e.target.tagName !== 'A') {
        window.location.href = detailUrl;
      }
    });

    return card;
  }

  function renderProducts() {
    var container = document.getElementById(CONFIG.GRID_CONTAINER_ID);
    if (!container) return;

    container.innerHTML = '';

    if (state.filteredProducts.length === 0) {
      container.innerHTML = '<div class="cms-no-products"><p>No products found.</p></div>';
      return;
    }

    var start = (state.currentPage - 1) * CONFIG.PRODUCTS_PER_PAGE;
    var end = start + CONFIG.PRODUCTS_PER_PAGE;
    var pageProducts = state.filteredProducts.slice(start, end);

    var grid = document.createElement('div');
    grid.className = 'cms-product-grid';
    grid.setAttribute('data-cms-grid', 'products');

    pageProducts.forEach(function(product) {
      grid.appendChild(createProductCard(product));
    });

    container.appendChild(grid);

    if (window.loadLozadImages) {
      window.loadLozadImages();
    }
  }

  function createPageLink(pageNum) {
    var li = document.createElement('li');
    li.className = 'cms-pagination__item';

    if (pageNum === state.currentPage) {
      li.classList.add('cms-pagination__current');
      li.textContent = pageNum;
      return li;
    }

    var link = document.createElement('a');
    link.href = '#';
    link.textContent = pageNum;
    link.addEventListener('click', function(e) {
      e.preventDefault();
      state.currentPage = pageNum;
      renderProducts();
      renderPagination();
      scrollToListing();
    });
    li.appendChild(link);
    return li;
  }

  function scrollToListing() {
    var root = document.getElementById(CONFIG.LISTING_ROOT_ID);
    if (root) {
      root.scrollIntoView({ behavior: 'smooth', block: 'start' });
    }
  }

  function renderPagination() {
    var container = document.getElementById(CONFIG.PAGINATION_CONTAINER_ID);
    if (!container) return;

    container.innerHTML = '';

    var totalPages = Math.ceil(state.filteredProducts.length / CONFIG.PRODUCTS_PER_PAGE);
    if (totalPages <= 1) return;

    var pagination = document.createElement('ul');
    pagination.className = 'cms-pagination';
    pagination.setAttribute('aria-label', 'Product pagination');
    pagination.setAttribute('data-cms-pagination', 'products');

    var prevLi = document.createElement('li');
    prevLi.className = 'cms-pagination__item cms-pagination__prev';
    if (state.currentPage === 1) prevLi.classList.add('cms-pagination__disabled');
    var prevLink = document.createElement('a');
    prevLink.href = '#';
    prevLink.innerHTML = '&laquo; Previous';
    prevLink.addEventListener('click', function(e) {
      e.preventDefault();
      if (state.currentPage > 1) {
        state.currentPage--;
        renderProducts();
        renderPagination();
        scrollToListing();
      }
    });
    prevLi.appendChild(prevLink);
    pagination.appendChild(prevLi);

    var maxVisible = 5;
    var startPage = Math.max(1, state.currentPage - Math.floor(maxVisible / 2));
    var endPage = Math.min(totalPages, startPage + maxVisible - 1);

    if (startPage > 1) {
      pagination.appendChild(createPageLink(1));
      if (startPage > 2) {
        var ellipsis = document.createElement('li');
        ellipsis.className = 'cms-pagination__item cms-pagination__ellipsis';
        ellipsis.textContent = '...';
        pagination.appendChild(ellipsis);
      }
    }

    for (var i = startPage; i <= endPage; i++) {
      pagination.appendChild(createPageLink(i));
    }

    if (endPage < totalPages) {
      if (endPage < totalPages - 1) {
        var ellipsisEnd = document.createElement('li');
        ellipsisEnd.className = 'cms-pagination__item cms-pagination__ellipsis';
        ellipsisEnd.textContent = '...';
        pagination.appendChild(ellipsisEnd);
      }
      pagination.appendChild(createPageLink(totalPages));
    }

    var nextLi = document.createElement('li');
    nextLi.className = 'cms-pagination__item cms-pagination__next';
    if (state.currentPage === totalPages) nextLi.classList.add('cms-pagination__disabled');
    var nextLink = document.createElement('a');
    nextLink.href = '#';
    nextLink.innerHTML = 'Next &raquo;';
    nextLink.addEventListener('click', function(e) {
      e.preventDefault();
      if (state.currentPage < totalPages) {
        state.currentPage++;
        renderProducts();
        renderPagination();
        scrollToListing();
      }
    });
    nextLi.appendChild(nextLink);
    pagination.appendChild(nextLi);

    container.appendChild(pagination);
  }

  function injectListingSection() {
    if (document.getElementById(CONFIG.LISTING_ROOT_ID)) return;

    var main = document.getElementById('MainContent');
    if (!main) {
      console.warn('[ProductListing] #MainContent not found.');
      return;
    }

    var section = document.createElement('section');
    section.id = CONFIG.LISTING_ROOT_ID;
    section.className = 'cms-product-listing';
    section.setAttribute('data-cms-page', 'products');
    section.setAttribute('aria-label', 'Product catalog');

    section.innerHTML =
      '<div class="cms-product-listing__inner">' +
        '<div class="cms-product-listing__header">' +
          '<h2 class="cms-product-listing__title" data-cms="listing-title">All Products</h2>' +
          '<p class="cms-product-listing__subtitle" data-cms="listing-subtitle">Browse our full collection</p>' +
        '</div>' +
        '<div class="cms-product-listing__filters" data-cms="listing-filters">' +
          '<div class="cms-product-listing__filter-group">' +
            '<label class="cms-product-listing__filter-label" for="' + CONFIG.SEARCH_INPUT_ID + '">Search</label>' +
            '<input type="search" id="' + CONFIG.SEARCH_INPUT_ID + '" class="cms-product-listing__search-input" placeholder="Search products..." data-cms="search" autocomplete="off">' +
          '</div>' +
          '<div class="cms-product-listing__filter-group">' +
            '<label class="cms-product-listing__filter-label" for="' + CONFIG.CATEGORY_FILTER_ID + '">Category</label>' +
            '<select id="' + CONFIG.CATEGORY_FILTER_ID + '" class="cms-product-listing__select" data-cms="category-filter">' +
              '<option value="">All Categories</option>' +
            '</select>' +
          '</div>' +
          '<div class="cms-product-listing__filter-group cms-product-listing__filter-group--price">' +
            '<label class="cms-product-listing__filter-label" for="' + CONFIG.PRICE_MIN_ID + '">Min Price</label>' +
            '<input type="number" id="' + CONFIG.PRICE_MIN_ID + '" class="cms-product-listing__price-input" placeholder="$0" min="0" step="0.01" data-cms="price-min">' +
          '</div>' +
          '<div class="cms-product-listing__filter-group cms-product-listing__filter-group--price">' +
            '<label class="cms-product-listing__filter-label" for="' + CONFIG.PRICE_MAX_ID + '">Max Price</label>' +
            '<input type="number" id="' + CONFIG.PRICE_MAX_ID + '" class="cms-product-listing__price-input" placeholder="$999" min="0" step="0.01" data-cms="price-max">' +
          '</div>' +
        '</div>' +
        '<p id="cms-results-count" class="cms-product-listing__results-count" data-cms="results-count"></p>' +
        '<div id="' + CONFIG.GRID_CONTAINER_ID + '" data-cms="product-grid"></div>' +
        '<div id="' + CONFIG.PAGINATION_CONTAINER_ID + '" data-cms="pagination"></div>' +
      '</div>';

    main.insertBefore(section, main.firstChild);
  }

  function initFilters() {
    var searchInput = document.getElementById(CONFIG.SEARCH_INPUT_ID);
    if (searchInput) {
      var debounceTimer;
      searchInput.addEventListener('input', function(e) {
        clearTimeout(debounceTimer);
        debounceTimer = setTimeout(function() {
          state.searchQuery = e.target.value.trim();
          applyFilters();
        }, 300);
      });
    }

    var categorySelect = document.getElementById(CONFIG.CATEGORY_FILTER_ID);
    if (categorySelect) {
      state.categories.forEach(function(cat) {
        var option = document.createElement('option');
        option.value = cat.id;
        option.textContent = cat.name;
        categorySelect.appendChild(option);
      });

      categorySelect.addEventListener('change', function(e) {
        state.categoryId = e.target.value ? parseInt(e.target.value, 10) : null;
        reloadProducts();
      });
    }

    var priceMinInput = document.getElementById(CONFIG.PRICE_MIN_ID);
    var priceMaxInput = document.getElementById(CONFIG.PRICE_MAX_ID);

    if (priceMinInput) {
      priceMinInput.addEventListener('input', function(e) {
        var val = e.target.value.trim();
        state.priceMin = val ? parseFloat(val) : null;
        applyFilters();
      });
    }

    if (priceMaxInput) {
      priceMaxInput.addEventListener('input', function(e) {
        var val = e.target.value.trim();
        state.priceMax = val ? parseFloat(val) : null;
        applyFilters();
      });
    }
  }

  async function reloadProducts() {
    try {
      state.allProducts = await fetchProducts();
      await prefetchGalleryImages(state.allProducts);
      applyFilters();
    } catch (err) {
      console.error('[ProductListing] Failed to reload products:', err);
    }
  }

  async function initProductListing() {
    console.log('[ProductListing] Initializing product listing...');

    injectListingSection();

    try {
      var products = await fetchProducts();
      var categories = await fetchCategories();

      state.allProducts = products;
      state.categories = categories;

      await prefetchGalleryImages(products);

      initFilters();
      applyFilters();

      console.log('[ProductListing] Initialized with', products.length, 'products');
    } catch (err) {
      console.error('[ProductListing] Failed to initialize:', err);

      var container = document.getElementById(CONFIG.GRID_CONTAINER_ID);
      if (container) {
        container.innerHTML = '<div class="cms-error"><p>Failed to load products. Please try again later.</p></div>';
      }
    }
  }

  window.ProductListing = {
    init: initProductListing,
    refresh: function() { applyFilters(); },
    reload: reloadProducts,
    getState: function() { return state; },
    CONFIG: CONFIG
  };

  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', initProductListing);
  } else {
    initProductListing();
  }

})();
