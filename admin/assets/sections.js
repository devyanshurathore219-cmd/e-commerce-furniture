/* ============================================================
   Admin — Product Sections Management
   ============================================================ */
(function() {
    'use strict';

    var API = window.Admin.API_BASE;
    var currentProductId = null;

    function init() {
        currentProductId = new URLSearchParams(window.location.search).get('productId') || '';
        if (!currentProductId) {
            document.getElementById('sectionsList').innerHTML = '<div class="empty-state"><div class="empty-icon">⚠️</div><p>No product selected. Open this page from Products list.</p></div>';
            return;
        }
        loadProductName();
        loadSections();
        bindEvents();
    }

    function loadProductName() {
        window.Admin.fetch(API + '/products/' + currentProductId).then(function(p) {
            document.getElementById('currentProductName').textContent = p.name || ('Product #' + currentProductId);
        }).catch(function() {
            document.getElementById('currentProductName').textContent = 'Product #' + currentProductId;
        });
    }

    function loadSections() {
        document.getElementById('sectionsList').innerHTML = '<div class="loading">Loading sections...</div>';
        window.Admin.fetch(API + '/sections/' + currentProductId).then(function(data) {
            var list = data || [];
            renderSections(list);
        }).catch(function() {
            showToast('Failed to load sections', 'error');
            document.getElementById('sectionsList').innerHTML = '<div class="empty-state">Error loading</div>';
        });
    }

    function renderSections(list) {
        var container = document.getElementById('sectionsList');
        if (!container) return;
        if (list.length === 0) {
            container.innerHTML = '<div class="empty-state"><div class="empty-icon">📄</div><p>No sections yet for this product.</p></div>';
            return;
        }
        container.innerHTML = list.map(function(s) {
            return '<div class="card">' +
                '<div class="card-header"><h3>' + window.Admin.escapeHtml(s.section_type || 'Section') + '</h3>' +
                '<div class="flex gap-2">' +
                    '<button class="btn btn-sm btn-primary" onclick="window.AdminSections.edit(' + s.id + ')">Edit</button>' +
                    '<button class="btn btn-sm btn-danger" onclick="window.AdminSections.del(' + s.id + ')">Delete</button>' +
                '</div></div>' +
                '<p class="text-muted mb-2"><strong>Title:</strong> ' + window.Admin.escapeHtml(s.title || '-') + '</p>' +
                (s.subtitle ? '<p class="text-muted mb-2"><strong>Subtitle:</strong> ' + window.Admin.escapeHtml(s.subtitle) + '</p>' : '') +
                (s.content ? '<p class="text-muted mb-2"><strong>Content:</strong> ' + window.Admin.escapeHtml(s.content.substring(0, 120)) + (s.content.length > 120 ? '...' : '') + '</p>' : '') +
                (s.button_text ? '<p class="text-muted mb-2"><strong>Button:</strong> ' + window.Admin.escapeHtml(s.button_text) + (s.button_link ? ' → ' + window.Admin.escapeHtml(s.button_link) : '') + '</p>' : '') +
                '<span class="badge badge-gray">Sort: ' + (s.sort_order || 0) + '</span>' +
            '</div>';
        }).join('');
    }

    function bindEvents() {
        var btnAdd = document.getElementById('btnAddSection');
        var modalOverlay = document.getElementById('modalOverlay');
        var form = document.getElementById('sectionForm');
        var btnCancel = document.getElementById('btnCancel');
        var btnDelete = document.getElementById('btnDelete');

        if (btnAdd) btnAdd.addEventListener('click', openAddModal);
        if (btnCancel) btnCancel.addEventListener('click', closeModal);
        if (modalOverlay) modalOverlay.addEventListener('click', function(e) { if (e.target === modalOverlay) closeModal(); });

        if (form) form.addEventListener('submit', function(e) { e.preventDefault(); saveSection(); });
        if (btnDelete) btnDelete.addEventListener('click', function() {
            var id = document.getElementById('editSectionId').value;
            if (!id) return;
            if (!confirm('Delete this section?')) return;
            deleteSection(parseInt(id));
        });
    }

    function openAddModal() {
        document.getElementById('modalTitle').textContent = 'Add Section';
        document.getElementById('sectionForm').reset();
        document.getElementById('editSectionId').value = '';
        document.getElementById('btnDelete').style.display = 'none';
        document.getElementById('modalOverlay').classList.add('active');
    }

    function edit(id) {
        // Fetch all sections then find the one to edit
        window.Admin.fetch(API + '/sections/' + currentProductId).then(function(list) {
            var s = (list || []).find(function(x) { return x.id === id; });
            if (!s) return showToast('Section not found', 'error');
            document.getElementById('modalTitle').textContent = 'Edit Section';
            document.getElementById('editSectionId').value = s.id;
            document.getElementById('sectionType').value = s.section_type || '';
            document.getElementById('sectionTitle').value = s.title || '';
            document.getElementById('sectionSubtitle').value = s.subtitle || '';
            document.getElementById('sectionContent').value = s.content || '';
            document.getElementById('sectionButtonText').value = s.button_text || '';
            document.getElementById('sectionButtonLink').value = s.button_link || '';
            document.getElementById('sectionSortOrder').value = s.sort_order || 0;
            document.getElementById('btnDelete').style.display = 'inline-flex';
            document.getElementById('modalOverlay').classList.add('active');
        }).catch(function(err) {
            showToast('Failed: ' + err.message, 'error');
        });
    }

    function del(id) {
        if (!confirm('Delete this section?')) return;
        window.Admin.fetch(API + '/sections/' + id, { method: 'DELETE' }).then(function() {
            showToast('Section deleted');
            loadSections();
        }).catch(function(err) {
            showToast('Delete failed: ' + err.message, 'error');
        });
    }

    function saveSection() {
        var id = document.getElementById('editSectionId').value;
        var payload = {
            product_id: parseInt(currentProductId),
            section_type: document.getElementById('sectionType').value.trim(),
            title: document.getElementById('sectionTitle').value.trim(),
            subtitle: document.getElementById('sectionSubtitle').value.trim(),
            content: document.getElementById('sectionContent').value.trim(),
            button_text: document.getElementById('sectionButtonText').value.trim(),
            button_link: document.getElementById('sectionButtonLink').value.trim(),
            sort_order: parseInt(document.getElementById('sectionSortOrder').value) || 0
        };

        if (!payload.section_type) { showToast('Section type is required', 'warning'); return; }

        var url = id ? (API + '/sections/' + id) : API + '/sections';
        var method = id ? 'PUT' : 'POST';

        window.Admin.fetch(url, {
            method: method,
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(payload)
        }).then(function() {
            showToast(id ? 'Section updated' : 'Section added');
            closeModal();
            loadSections();
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

    window.AdminSections = { init: init, edit: edit, del: del, reload: loadSections };

    if (document.readyState === 'loading') {
        document.addEventListener('DOMContentLoaded', init);
    } else {
        init();
    }

})();