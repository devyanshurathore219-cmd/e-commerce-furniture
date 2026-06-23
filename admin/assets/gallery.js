/* ============================================================
   Admin — Gallery Management
   Features: view images, upload, delete
   ============================================================ */
(function() {
    'use strict';

    var API = window.Admin.API_BASE;
    var currentProductId = null;

    function init() {
        currentProductId = new URLSearchParams(window.location.search).get('productId') || '';
        if (!currentProductId) {
            document.getElementById('galleryGrid').innerHTML = '<div class="empty-state"><div class="empty-icon">⚠️</div><p>No product selected. Open from Products list.</p></div>';
            return;
        }
        loadProductName();
        loadGallery();
        bindEvents();
    }

    function loadProductName() {
        window.Admin.fetch(API + '/products/' + currentProductId).then(function(p) {
            document.getElementById('currentProductName').textContent = p.name || ('Product #' + currentProductId);
        }).catch(function() {
            document.getElementById('currentProductName').textContent = 'Product #' + currentProductId;
        });
    }

    function loadGallery() {
        document.getElementById('galleryGrid').innerHTML = '<div class="loading">Loading gallery...</div>';
        window.Admin.fetch(API + '/gallery/' + currentProductId).then(function(data) {
            var list = data || [];
            renderGallery(list);
        }).catch(function() {
            showToast('Failed to load gallery', 'error');
            document.getElementById('galleryGrid').innerHTML = '<div class="empty-state">Error loading</div>';
        });
    }

    function renderGallery(list) {
        var container = document.getElementById('galleryGrid');
        if (!container) return;
        if (list.length === 0) {
            container.innerHTML = '<div class="empty-state"><div class="empty-icon">🖼️</div><p>No images in gallery yet. Upload your first image!</p></div>';
            return;
        }
        container.innerHTML = list.map(function(img) {
            return '<div class="gallery-item">' +
                '<img src="' + window.Admin.escapeHtml(img.image) + '" alt="Gallery image" loading="lazy">' +
                '<div class="gallery-item-actions">' +
                    '<span class="badge badge-gray">Sort: ' + (img.sort_order || 0) + '</span>' +
                    '<button class="btn btn-sm btn-danger" onclick="window.AdminGallery.del(' + img.id + ')">Delete</button>' +
                '</div>' +
            '</div>';
        }).join('');
    }

    function bindEvents() {
        var form = document.getElementById('uploadForm');
        var fileInput = document.getElementById('galleryImage');
        if (form) {
            form.addEventListener('submit', function(e) {
                e.preventDefault();
                uploadImage();
            });
        }
    }

    function uploadImage() {
        var fileInput = document.getElementById('galleryImage');
        var file = fileInput ? fileInput.files[0] : null;
        if (!file) {
            showToast('Please select an image', 'warning');
            return;
        }

        var formData = new FormData();
        formData.append('image', file);
        formData.append('product_id', currentProductId);
        formData.append('sort_order', document.getElementById('sortOrder') ? document.getElementById('sortOrder').value : 0);

        var btn = document.getElementById('btnUpload');
        if (btn) { btn.disabled = true; btn.textContent = 'Uploading...'; }

        // Use fetch directly since Admin.fetch expects JSON
        fetch(API + '/gallery', {
            method: 'POST',
            body: formData
        }).then(function(res) {
            if (!res.ok) return res.json().then(function(data) { throw new Error(data.error || data.message || 'Upload failed'); });
            return res.json();
        }).then(function() {
            showToast('Image uploaded');
            if (fileInput) fileInput.value = '';
            if (btn) { btn.disabled = false; btn.textContent = 'Upload'; }
            loadGallery();
        }).catch(function(err) {
            showToast('Upload failed: ' + err.message, 'error');
            if (btn) { btn.disabled = false; btn.textContent = 'Upload'; }
        });
    }

    function del(id) {
        if (!confirm('Delete this image?')) return;
        window.Admin.fetch(API + '/gallery/' + id, { method: 'DELETE' }).then(function() {
            showToast('Image deleted');
            loadGallery();
        }).catch(function(err) {
            showToast('Delete failed: ' + err.message, 'error');
        });
    }

    function showToast(message, type) {
        window.Admin.showToast(message, type);
    }

    window.AdminGallery = { init: init, del: del, reload: loadGallery };

    if (document.readyState === 'loading') {
        document.addEventListener('DOMContentLoaded', init);
    } else {
        init();
    }

})();