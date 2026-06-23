/* ============================================================
   Admin — Categories Management
   Features: list, add, edit, delete
   ============================================================ */
(function() {
    'use strict';

    var API = window.Admin.API_BASE;

    function init() {
        loadCategories();
        bindEvents();
    }

    function bindEvents() {
        var btnAdd = document.getElementById('btnAddCategory');
        var modalOverlay = document.getElementById('modalOverlay');
        var form = document.getElementById('categoryForm');
        var btnCancel = document.getElementById('btnCancel');
        var btnDelete = document.getElementById('btnDelete');

        if (btnAdd) btnAdd.addEventListener('click', openAddModal);
        if (btnCancel) btnCancel.addEventListener('click', closeModal);
        if (modalOverlay) modalOverlay.addEventListener('click', function(e) { if (e.target === modalOverlay) closeModal(); });

        if (form) {
            form.addEventListener('submit', function(e) {
                e.preventDefault();
                saveCategory();
            });
        }

        if (btnDelete) {
            btnDelete.addEventListener('click', function() {
                var id = document.getElementById('editCategoryId').value;
                if (!id) return;
                if (!confirm('Delete this category? Products in this category will become uncategorized.')) return;
                deleteCategory(parseInt(id));
            });
        }
    }

    function loadCategories() {
        document.getElementById('categoriesTableBody').innerHTML = '<tr><td colspan="3" class="loading">Loading...</td></tr>';
        window.Admin.fetch(API + '/categories').then(function(data) {
            var list = data || [];
            var tbody = document.getElementById('categoriesTableBody');
            if (!tbody) return;

            if (list.length === 0) {
                tbody.innerHTML = '<tr><td colspan="3" class="empty-state"><div class="empty-icon">📂</div><p>No categories yet</p></td></tr>';
                return;
            }

            tbody.innerHTML = list.map(function(c) {
                return '<tr>' +
                    '<td>' + window.Admin.escapeHtml(c.name) + '</td>' +
                    '<td>' + window.Admin.escapeHtml(c.slug || '-') + '</td>' +
                    '<td class="flex gap-2">' +
                        '<button class="btn btn-sm btn-primary" onclick="window.AdminCategories.edit(' + c.id + ')">Edit</button>' +
                        '<button class="btn btn-sm btn-danger" onclick="window.AdminCategories.del(' + c.id + ')">Delete</button>' +
                    '</td>' +
                    '</tr>';
            }).join('');
        }).catch(function() {
            showToast('Failed to load categories', 'error');
            document.getElementById('categoriesTableBody').innerHTML = '<tr><td colspan="3" class="empty-state">Error loading</td></tr>';
        });
    }

    function openAddModal() {
        document.getElementById('modalTitle').textContent = 'Add Category';
        document.getElementById('categoryForm').reset();
        document.getElementById('editCategoryId').value = '';
        document.getElementById('btnDelete').style.display = 'none';
        document.getElementById('modalOverlay').classList.add('active');
    }

    function edit(id) {
        window.Admin.fetch(API + '/categories/' + id).then(function(data) {
            document.getElementById('modalTitle').textContent = 'Edit Category';
            document.getElementById('editCategoryId').value = data.id;
            document.getElementById('categoryName').value = data.name || '';
            document.getElementById('categorySlug').value = data.slug || '';
            document.getElementById('btnDelete').style.display = 'inline-flex';
            document.getElementById('modalOverlay').classList.add('active');
        }).catch(function(err) {
            showToast('Failed to load category: ' + err.message, 'error');
        });
    }

    function del(id) {
        if (!confirm('Delete this category? Products in this category will become uncategorized.')) return;
        window.Admin.fetch(API + '/categories/' + id, { method: 'DELETE' }).then(function() {
            showToast('Category deleted');
            loadCategories();
        }).catch(function(err) {
            showToast('Delete failed: ' + err.message, 'error');
        });
    }

    function saveCategory() {
        var id = document.getElementById('editCategoryId').value;
        var payload = {
            name: document.getElementById('categoryName').value.trim(),
            slug: document.getElementById('categorySlug').value.trim()
        };

        if (!payload.name) {
            showToast('Category name is required', 'warning');
            return;
        }

        var url = id ? (API + '/categories/' + id) : API + '/categories';
        var method = id ? 'PUT' : 'POST';

        window.Admin.fetch(url, {
            method: method,
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(payload)
        }).then(function() {
            showToast(id ? 'Category updated' : 'Category added');
            closeModal();
            loadCategories();
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

    window.AdminCategories = {
        init: init,
        edit: edit,
        del: del,
        reload: loadCategories
    };

    if (document.readyState === 'loading') {
        document.addEventListener('DOMContentLoaded', init);
    } else {
        init();
    }

})();