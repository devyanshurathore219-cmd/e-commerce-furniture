/* ============================================================
   Admin — Products Management
   Features: list, search, filter, add, edit, delete
   ============================================================ */
(function() {
    'use strict';

    var API = window.Admin.API_BASE;
    var PRODUCTS_PER_PAGE = 15;

    var state = {
        products: [],
        categories: [],
        currentPage: 1,
        searchQuery: '',
        filterCategory: '',
        totalFiltered: 0
    };

    function init() {
        loadCategories().then(function() {
            loadProducts();
            bindEvents();
        });
    }

    function bindEvents() {
        var searchInput = document.getElementById('searchInput');
        var categorySelect = document.getElementById('filterCategory');
        var btnAdd = document.getElementById('btnAddProduct');
        var modalOverlay = document.getElementById('modalOverlay');
        var form = document.getElementById('productForm');
        var btnCancel = document.getElementById('btnCancel');
        var btnDelete = document.getElementById('btnDelete');

        if (searchInput) {
            searchInput.addEventListener('input', function(e) {
                state.searchQuery = e.target.value.trim().toLowerCase();
                state.currentPage = 1;
                renderTable();
            });
        }

        if (categorySelect) {
            categorySelect.addEventListener('change', function(e) {
                state.filterCategory = e.target.value;
                state.currentPage = 1;
                renderTable();
            });
        }

        if (btnAdd) btnAdd.addEventListener('click', openAddModal);
        if (btnCancel) btnCancel.addEventListener('click', closeModal);
        if (modalOverlay) modalOverlay.addEventListener('click', function(e) { if (e.target === modalOverlay) closeModal(); });

        if (form) {
            form.addEventListener('submit', function(e) {
                e.preventDefault();
                saveProduct();
            });
        }

        if (btnDelete) {
            btnDelete.addEventListener('click', function() {
                var id = document.getElementById('editProductId').value;
                if (!id) return;
                if (!confirm('Delete this product? This cannot be undone.')) return;
                deleteProduct(parseInt(id));
            });
        }
    }

    function loadCategories() {
        return window.Admin.fetch(API + '/categories').then(function(data) {
            state.categories = data || [];
            var sel = document.getElementById('filterCategory');
            if (!sel) return;
            sel.innerHTML = '<option value="">All Categories</option>' +
                state.categories.map(function(c) {
                    return '<option value="' + c.id + '">' + window.Admin.escapeHtml(c.name) + '</option>';
                }).join('');
        });
    }

    function loadProducts() {
        document.getElementById('productsTableBody').innerHTML = '<tr><td colspan="7" class="loading">Loading...</td></tr>';
        window.Admin.fetch(API + '/products').then(function(data) {
            state.products = data || [];
            renderTable();
        }).catch(function() {
            showToast('Failed to load products', 'error');
            document.getElementById('productsTableBody').innerHTML = '<tr><td colspan="7" class="empty-state">Error loading products</td></tr>';
        });
    }

    function renderTable() {
        var tbody = document.getElementById('productsTableBody');
        var totalInfo = document.getElementById('totalInfo');
        if (!tbody) return;

        var list = state.products.slice();

        // Filter by category
        if (state.filterCategory) {
            list = list.filter(function(p) { return p.category_id === parseInt(state.filterCategory); });
        }

        // Filter by search
        if (state.searchQuery) {
            list = list.filter(function(p) {
                return (p.name && p.name.toLowerCase().indexOf(state.searchQuery) !== -1) ||
                    (p.brand && p.brand.toLowerCase().indexOf(state.searchQuery) !== -1) ||
                    (p.sku && p.sku.toLowerCase().indexOf(state.searchQuery) !== -1);
            });
        }

        state.totalFiltered = list.length;
        if (totalInfo) totalInfo.textContent = list.length + ' product(s)';

        var start = (state.currentPage - 1) * PRODUCTS_PER_PAGE;
        var page = list.slice(start, start + PRODUCTS_PER_PAGE);

        if (page.length === 0) {
            tbody.innerHTML = '<tr><td colspan="7" class="empty-state"><div class="empty-icon">📦</div><p>No products found</p></div></td></tr>';
            document.getElementById('pagination').innerHTML = '';
            return;
        }

        tbody.innerHTML = page.map(function(p) {
            var badge = p.status === 'published'
                ? '<span class="badge badge-success">Published</span>'
                : '<span class="badge badge-warning">Draft</span>';
            var catName = state.categories.find(function(c) { return c.id === p.category_id; });
            catName = catName ? catName.name : '-';
            return '<tr>' +
                '<td>' + window.Admin.escapeHtml(p.name) + '</td>' +
                '<td>' + window.Admin.escapeHtml(p.brand || '-') + '</td>' +
                '<td>$' + parseFloat(p.price || 0).toFixed(2) + '</td>' +
                '<td>' + (p.sale_price ? '$' + parseFloat(p.sale_price).toFixed(2) : '-') + '</td>' +
                '<td>' + window.Admin.escapeHtml(catName) + '</td>' +
                '<td>' + badge + '</td>' +
                '<td class="flex gap-2">' +
                    '<button class="btn btn-sm btn-primary" onclick="window.AdminProducts.edit(' + p.id + ')">Edit</button>' +
                    '<button class="btn btn-sm btn-danger" onclick="window.AdminProducts.del(' + p.id + ', this)">Delete</button>' +
                '</td>' +
                '</tr>';
        }).join('');

        renderPagination(list.length);
    }

    function renderPagination(total) {
        var container = document.getElementById('pagination');
        if (!container) return;
        var pages = Math.ceil(total / PRODUCTS_PER_PAGE);
        if (pages <= 1) { container.innerHTML = ''; return; }

        var html = '<div class="flex gap-2 items-center mt-4">';
        html += '<button class="btn btn-sm ' + (state.currentPage === 1 ? 'btn-gray' : 'btn-primary') + '" id="prevPage" ' + (state.currentPage === 1 ? 'disabled' : '') + '>« Prev</button>';
        html += '<span class="text-muted">Page ' + state.currentPage + ' of ' + pages + '</span>';
        html += '<button class="btn btn-sm ' + (state.currentPage === pages ? 'btn-gray' : 'btn-primary') + '" id="nextPage" ' + (state.currentPage === pages ? 'disabled' : '') + '>Next »</button>';
        html += '</div>';

        container.innerHTML = html;

        var prev = document.getElementById('prevPage');
        var next = document.getElementById('nextPage');
        if (prev) prev.addEventListener('click', function() { if (state.currentPage > 1) { state.currentPage--; renderTable(); } });
        if (next) next.addEventListener('click', function() { if (state.currentPage < pages) { state.currentPage++; renderTable(); } });
    }

    function openAddModal() {
        document.getElementById('modalTitle').textContent = 'Add Product';
        document.getElementById('productForm').reset();
        document.getElementById('editProductId').value = '';
        document.getElementById('btnDelete').style.display = 'none';
        document.getElementById('modalOverlay').classList.add('active');
    }

    function edit(id) {
        window.Admin.fetch(API + '/products/' + id).then(function(data) {
            document.getElementById('modalTitle').textContent = 'Edit Product';
            document.getElementById('editProductId').value = data.id;
            document.getElementById('productName').value = data.name || '';
            document.getElementById('productSlug').value = data.slug || '';
            document.getElementById('productBrand').value = data.brand || '';
            document.getElementById('productPrice').value = data.price || '';
            document.getElementById('productSalePrice').value = data.sale_price || '';
            document.getElementById('productDescription').value = data.short_description || '';
            document.getElementById('productStatus').value = data.status || 'draft';
            document.getElementById('btnDelete').style.display = 'inline-flex';
            document.getElementById('modalOverlay').classList.add('active');
        }).catch(function(err) {
            showToast('Failed to load product: ' + err.message, 'error');
        });
    }

    function del(id, btn) {
        if (!confirm('Delete this product? This cannot be undone.')) return;
        // Visually disable while deleting
        if (btn) { btn.disabled = true; btn.textContent = '...'; }
        deleteProduct(id);
    }

    function deleteProduct(id) {
        window.Admin.fetch(API + '/products/' + id, { method: 'DELETE' }).then(function() {
            showToast('Product deleted');
            loadProducts();
        }).catch(function(err) {
            showToast('Delete failed: ' + err.message, 'error');
        });
    }

    function saveProduct() {
        var id = document.getElementById('editProductId').value;
        var payload = {
            name: document.getElementById('productName').value.trim(),
            slug: document.getElementById('productSlug').value.trim(),
            brand: document.getElementById('productBrand').value.trim(),
            price: parseFloat(document.getElementById('productPrice').value) || 0,
            sale_price: document.getElementById('productSalePrice').value ? parseFloat(document.getElementById('productSalePrice').value) : null,
            short_description: document.getElementById('productDescription').value.trim(),
            status: document.getElementById('productStatus').value,
            category_id: null,
            sku: '',
            featured: 0
        };

        if (!payload.name) {
            showToast('Product name is required', 'warning');
            return;
        }

        var url = id ? (API + '/products/' + id) : API + '/products';
        var method = id ? 'PUT' : 'POST';

        window.Admin.fetch(url, {
            method: method,
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(payload)
        }).then(function() {
            showToast(id ? 'Product updated' : 'Product added');
            closeModal();
            loadProducts();
        }).catch(function(err) {
            showToast('Save failed: ' + err.message, 'error');
        });
    }

    function closeModal() {
        document.getElementById('modalOverlay').classList.remove('active');
    }

    function showToast(message, type) {
        window.Admin.showToast(message, type);
    }

    // Expose globally for inline onclick handlers
    window.AdminProducts = {
        init: init,
        edit: edit,
        del: del,
        reload: loadProducts
    };

    // Init on DOM ready
    if (document.readyState === 'loading') {
        document.addEventListener('DOMContentLoaded', init);
    } else {
        init();
    }

})();