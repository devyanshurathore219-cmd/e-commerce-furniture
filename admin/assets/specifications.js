/* ============================================================
   Admin — Specifications Management
   Features: list, add, edit, delete
   ============================================================ */
(function() {
    'use strict';

    var API = window.Admin.API_BASE;
    var currentProductId = null;

    function init() {
        currentProductId = new URLSearchParams(window.location.search).get('productId') || '';
        if (!currentProductId) {
            document.getElementById('specsList').innerHTML = '<div class="empty-state"><div class="empty-icon">⚠️</div><p>No product selected. Open from Products list.</p></div>';
            return;
        }
        loadProductName();
        loadSpecs();
        bindEvents();
    }

    function loadProductName() {
        window.Admin.fetch(API + '/products/' + currentProductId).then(function(p) {
            document.getElementById('currentProductName').textContent = p.name || ('Product #' + currentProductId);
        }).catch(function() {
            document.getElementById('currentProductName').textContent = 'Product #' + currentProductId;
        });
    }

    function loadSpecs() {
        document.getElementById('specsList').innerHTML = '<div class="loading">Loading specifications...</div>';
        window.Admin.fetch(API + '/specs/' + currentProductId).then(function(data) {
            var list = data || [];
            renderSpecs(list);
        }).catch(function() {
            showToast('Failed to load specs', 'error');
            document.getElementById('specsList').innerHTML = '<div class="empty-state">Error loading</div>';
        });
    }

    function renderSpecs(list) {
        var container = document.getElementById('specsList');
        if (!container) return;
        if (list.length === 0) {
            container.innerHTML = '<div class="empty-state"><div class="empty-icon">📋</div><p>No specifications yet.</p></div>';
            return;
        }
        container.innerHTML = list.map(function(s) {
            return '<div class="card">' +
                '<div class="card-header"><h3>' + window.Admin.escapeHtml(s.label || 'Spec') + '</h3>' +
                '<div class="flex gap-2">' +
                    '<button class="btn btn-sm btn-primary" onclick="window.AdminSpecs.edit(' + s.id + ')">Edit</button>' +
                    '<button class="btn btn-sm btn-danger" onclick="window.AdminSpecs.del(' + s.id + ')">Delete</button>' +
                '</div></div>' +
                '<p class="text-muted mb-2"><strong>Value:</strong> ' + window.Admin.escapeHtml(s.value || '-') + '</p>' +
            '</div>';
        }).join('');
    }

    function bindEvents() {
        var btnAdd = document.getElementById('btnAddSpec');
        var modalOverlay = document.getElementById('modalOverlay');
        var form = document.getElementById('specForm');
        var btnCancel = document.getElementById('btnCancel');
        var btnDelete = document.getElementById('btnDelete');

        if (btnAdd) btnAdd.addEventListener('click', openAddModal);
        if (btnCancel) btnCancel.addEventListener('click', closeModal);
        if (modalOverlay) modalOverlay.addEventListener('click', function(e) { if (e.target === modalOverlay) closeModal(); });

        if (form) form.addEventListener('submit', function(e) { e.preventDefault(); saveSpec(); });
        if (btnDelete) btnDelete.addEventListener('click', function() {
            var id = document.getElementById('editSpecId').value;
            if (!id) return;
            if (!confirm('Delete this specification?')) return;
            deleteSpec(parseInt(id));
        });
    }

    function openAddModal() {
        document.getElementById('modalTitle').textContent = 'Add Specification';
        document.getElementById('specForm').reset();
        document.getElementById('editSpecId').value = '';
        document.getElementById('btnDelete').style.display = 'none';
        document.getElementById('modalOverlay').classList.add('active');
    }

    function edit(id) {
        window.Admin.fetch(API + '/specs/' + currentProductId).then(function(list) {
            var s = (list || []).find(function(x) { return x.id === id; });
            if (!s) return showToast('Spec not found', 'error');
            document.getElementById('modalTitle').textContent = 'Edit Specification';
            document.getElementById('editSpecId').value = s.id;
            document.getElementById('specLabel').value = s.label || '';
            document.getElementById('specValue').value = s.value || '';
            document.getElementById('btnDelete').style.display = 'inline-flex';
            document.getElementById('modalOverlay').classList.add('active');
        }).catch(function(err) {
            showToast('Failed: ' + err.message, 'error');
        });
    }

    function del(id) {
        if (!confirm('Delete this specification?')) return;
        window.Admin.fetch(API + '/specs/' + id, { method: 'DELETE' }).then(function() {
            showToast('Spec deleted');
            loadSpecs();
        }).catch(function(err) {
            showToast('Delete failed: ' + err.message, 'error');
        });
    }

    function saveSpec() {
        var id = document.getElementById('editSpecId').value;
        var payload = {
            product_id: parseInt(currentProductId),
            label: document.getElementById('specLabel').value.trim(),
            value: document.getElementById('specValue').value.trim()
        };

        if (!payload.label) { showToast('Label is required', 'warning'); return; }

        var url = id ? (API + '/specs/' + id) : API + '/specs';
        var method = id ? 'PUT' : 'POST';

        window.Admin.fetch(url, {
            method: method,
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(payload)
        }).then(function() {
            showToast(id ? 'Spec updated' : 'Spec added');
            closeModal();
            loadSpecs();
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

    window.AdminSpecs = { init: init, edit: edit, del: del, reload: loadSpecs };

    if (document.readyState === 'loading') {
        document.addEventListener('DOMContentLoaded', init);
    } else {
        init();
    }

})();