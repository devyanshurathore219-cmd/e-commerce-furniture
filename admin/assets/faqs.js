/* ============================================================
   Admin — FAQ Management
   Features: list, add, edit, delete
   ============================================================ */
(function() {
    'use strict';

    var API = window.Admin.API_BASE;
    var currentProductId = null;

    function init() {
        currentProductId = new URLSearchParams(window.location.search).get('productId') || '';
        if (!currentProductId) {
            document.getElementById('faqsList').innerHTML = '<div class="empty-state"><div class="empty-icon">⚠️</div><p>No product selected. Open from Products list.</p></div>';
            return;
        }
        loadProductName();
        loadFaqs();
        bindEvents();
    }

    function loadProductName() {
        window.Admin.fetch(API + '/products/' + currentProductId).then(function(p) {
            document.getElementById('currentProductName').textContent = p.name || ('Product #' + currentProductId);
        }).catch(function() {
            document.getElementById('currentProductName').textContent = 'Product #' + currentProductId;
        });
    }

    function loadFaqs() {
        document.getElementById('faqsList').innerHTML = '<div class="loading">Loading FAQs...</div>';
        window.Admin.fetch(API + '/faqs/' + currentProductId).then(function(data) {
            var list = data || [];
            renderFaqs(list);
        }).catch(function() {
            showToast('Failed to load FAQs', 'error');
            document.getElementById('faqsList').innerHTML = '<div class="empty-state">Error loading</div>';
        });
    }

    function renderFaqs(list) {
        var container = document.getElementById('faqsList');
        if (!container) return;
        if (list.length === 0) {
            container.innerHTML = '<div class="empty-state"><div class="empty-icon">❓</div><p>No FAQs yet for this product.</p></div>';
            return;
        }
        container.innerHTML = list.map(function(f) {
            return '<div class="card">' +
                '<div class="card-header"><h3>' + window.Admin.escapeHtml(f.question || 'FAQ') + '</h3>' +
                '<div class="flex gap-2">' +
                    '<button class="btn btn-sm btn-primary" onclick="window.AdminFaqs.edit(' + f.id + ')">Edit</button>' +
                    '<button class="btn btn-sm btn-danger" onclick="window.AdminFaqs.del(' + f.id + ')">Delete</button>' +
                '</div></div>' +
                '<p class="text-muted mb-2">' + window.Admin.escapeHtml((f.answer || '').substring(0, 200)) + ((f.answer || '').length > 200 ? '...' : '') + '</p>' +
                '<span class="badge badge-gray">Sort: ' + (f.sort_order || 0) + '</span>' +
            '</div>';
        }).join('');
    }

    function bindEvents() {
        var btnAdd = document.getElementById('btnAddFaq');
        var modalOverlay = document.getElementById('modalOverlay');
        var form = document.getElementById('faqForm');
        var btnCancel = document.getElementById('btnCancel');
        var btnDelete = document.getElementById('btnDelete');

        if (btnAdd) btnAdd.addEventListener('click', openAddModal);
        if (btnCancel) btnCancel.addEventListener('click', closeModal);
        if (modalOverlay) modalOverlay.addEventListener('click', function(e) { if (e.target === modalOverlay) closeModal(); });

        if (form) form.addEventListener('submit', function(e) { e.preventDefault(); saveFaq(); });
        if (btnDelete) btnDelete.addEventListener('click', function() {
            var id = document.getElementById('editFaqId').value;
            if (!id) return;
            if (!confirm('Delete this FAQ?')) return;
            deleteFaq(parseInt(id));
        });
    }

    function openAddModal() {
        document.getElementById('modalTitle').textContent = 'Add FAQ';
        document.getElementById('faqForm').reset();
        document.getElementById('editFaqId').value = '';
        document.getElementById('btnDelete').style.display = 'none';
        document.getElementById('modalOverlay').classList.add('active');
    }

    function edit(id) {
        window.Admin.fetch(API + '/faqs/' + currentProductId).then(function(list) {
            var f = (list || []).find(function(x) { return x.id === id; });
            if (!f) return showToast('FAQ not found', 'error');
            document.getElementById('modalTitle').textContent = 'Edit FAQ';
            document.getElementById('editFaqId').value = f.id;
            document.getElementById('faqQuestion').value = f.question || '';
            document.getElementById('faqAnswer').value = f.answer || '';
            document.getElementById('faqSortOrder').value = f.sort_order || 0;
            document.getElementById('btnDelete').style.display = 'inline-flex';
            document.getElementById('modalOverlay').classList.add('active');
        }).catch(function(err) {
            showToast('Failed: ' + err.message, 'error');
        });
    }

    function del(id) {
        if (!confirm('Delete this FAQ?')) return;
        window.Admin.fetch(API + '/faqs/' + id, { method: 'DELETE' }).then(function() {
            showToast('FAQ deleted');
            loadFaqs();
        }).catch(function(err) {
            showToast('Delete failed: ' + err.message, 'error');
        });
    }

    function saveFaq() {
        var id = document.getElementById('editFaqId').value;
        var payload = {
            product_id: parseInt(currentProductId),
            question: document.getElementById('faqQuestion').value.trim(),
            answer: document.getElementById('faqAnswer').value.trim(),
            sort_order: parseInt(document.getElementById('faqSortOrder').value) || 0
        };

        if (!payload.question) { showToast('Question is required', 'warning'); return; }

        var url = id ? (API + '/faqs/' + id) : API + '/faqs';
        var method = id ? 'PUT' : 'POST';

        window.Admin.fetch(url, {
            method: method,
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(payload)
        }).then(function() {
            showToast(id ? 'FAQ updated' : 'FAQ added');
            closeModal();
            loadFaqs();
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

    window.AdminFaqs = { init: init, edit: edit, del: del, reload: loadFaqs };

    if (document.readyState === 'loading') {
        document.addEventListener('DOMContentLoaded', init);
    } else {
        init();
    }

})();