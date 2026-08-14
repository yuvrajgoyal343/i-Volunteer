(function () {
  "use strict";

  var container = null;
  var searchInput = null;
  var categoryPills = null;
  var distanceBtn = null;
  var userCoords = null;
  var activeCategory = "all";


  /* ----- Render NGO Cards ----- */
  function renderCards(ngos) {
    if (!container) return;

    container.innerHTML = "";

    if (ngos.length === 0) {
      container.innerHTML =
        '<div class="empty-state" style="grid-column: 1 / -1;">' +
          '<svg viewBox="0 0 24 24"><circle cx="11" cy="11" r="8"/><line x1="21" y1="21" x2="16.65" y2="16.65"/></svg>' +
          '<p>No organisations found matching your search.</p>' +
        '</div>';
      return;
    }

    ngos.forEach(function (ngo) {
      var categoryLabel = AppData.categoryLabels[ngo.category] || ngo.category;

      // Distance string if available
      var distStr = "";
      if (userCoords) {
        var dist = GeoLocation.calculateDistance(userCoords.lat, userCoords.lng, ngo.lat, ngo.lng);
        distStr = '<span class="card-meta-item"><svg viewBox="0 0 24 24"><path d="M21 10c0 7-9 13-9 13s-9-6-9-13a9 9 0 0 1 18 0z"/><circle cx="12" cy="10" r="3"/></svg>' + Math.round(dist) + ' km away</span>';
      }

      // Urgent needs preview badges
      var needsBadges = (ngo.urgentNeeds || []).map(function (n) {
        return '<span class="badge" style="background-color: #FFF3E0; color: #E65100; font-size: 11px;">' + escapeHtml(n) + '</span>';
      }).join(" ");

      var card = document.createElement("div");
      card.className = "card ngo-interactive-card";
      card.innerHTML =
        '<div class="card-image" style="position: relative;">' +
          '<div style="display: flex; flex-direction: column; align-items: center; justify-content: center; width: 100%; height: 100%; background: linear-gradient(135deg, ' + getCategoryColor(ngo.category) + ' 0%, #0D3E2B 100%); padding: var(--space-4); text-align: center;">' +
            '<span style="font-size: 36px; font-weight: 800; color: var(--color-white); letter-spacing: 1px;">' + escapeHtml(ngo.name.charAt(0)) + '</span>' +
            '<span style="font-size: 11px; color: rgba(255,255,255,0.8); margin-top: 4px;">Est. ' + escapeHtml(ngo.founded || '2015') + '</span>' +
          '</div>' +
        '</div>' +
        '<div class="card-body">' +
          '<div style="display: flex; align-items: flex-start; justify-content: space-between; gap: var(--space-2); margin-bottom: var(--space-2);">' +
            '<h3 style="margin-bottom: 0; font-size: var(--font-size-md);">' + escapeHtml(ngo.name) + '</h3>' +
            (ngo.verified ? '<span class="badge badge-verified" title="' + escapeHtml(ngo.verificationDetails || 'Verified') + '"><svg viewBox="0 0 24 24"><path d="M22 11.08V12a10 10 0 1 1-5.93-9.14"/><polyline points="22 4 12 14.01 9 11.01"/></svg>Verified</span>' : '') +
          '</div>' +
          '<div style="display: flex; align-items: center; gap: var(--space-2); margin-bottom: var(--space-3); flex-wrap: wrap;">' +
            '<span class="badge badge-category">' + escapeHtml(categoryLabel) + '</span>' +
            '<span style="font-size: var(--font-size-xs); color: var(--color-text-secondary); font-weight: 600;">' + escapeHtml(ngo.beneficiariesServed || '') + '</span>' +
          '</div>' +
          '<p style="font-size: var(--font-size-sm); margin-bottom: var(--space-4);">' + escapeHtml(ngo.description) + '</p>' +

          '<div style="margin-bottom: var(--space-4);">' +
            '<strong style="display: block; font-size: 11px; color: var(--color-text-secondary); text-transform: uppercase; margin-bottom: 4px;">Urgent Needs:</strong>' +
            '<div style="display: flex; flex-wrap: wrap; gap: 4px;">' + (needsBadges || '<span style="font-size: var(--font-size-xs); color: var(--color-text-secondary);">General essentials</span>') + '</div>' +
          '</div>' +

          '<div class="card-meta" style="margin-bottom: var(--space-4);">' +
            '<span class="card-meta-item"><svg viewBox="0 0 24 24"><path d="M21 10c0 7-9 13-9 13s-9-6-9-13a9 9 0 0 1 18 0z"/><circle cx="12" cy="10" r="3"/></svg>' + escapeHtml(ngo.address + ', ' + ngo.city) + '</span>' +
            distStr +
          '</div>' +

          '<div style="display: flex; gap: var(--space-2); margin-top: auto;">' +
            '<button type="button" class="btn btn-primary btn-sm ngo-detail-btn" data-id="' + ngo.id + '" style="flex: 1;">View Details & Needs</button>' +
            '<a href="donate.html?ngo=' + ngo.id + '" class="btn btn-secondary btn-sm" title="Donate directly to ' + escapeHtml(ngo.name) + '">Donate</a>' +
          '</div>' +
        '</div>';

      container.appendChild(card);
    });

    // Attach click handlers to detail buttons
    var detailBtns = container.querySelectorAll(".ngo-detail-btn");
    detailBtns.forEach(function (btn) {
      btn.addEventListener("click", function () {
        var id = parseInt(this.dataset.id);
        openNgoModal(id);
      });
    });
  }


  /* ----- Open NGO Detail Modal ----- */
  function openNgoModal(ngoId) {
    var ngo = AppData.ngos.find(function (n) { return n.id === ngoId; });
    if (!ngo) {
      window.location.href = "404.html";
      return;
    }

    var modal = document.getElementById("ngo-detail-modal");
    if (!modal) {
      modal = document.createElement("div");
      modal.id = "ngo-detail-modal";
      modal.className = "modal-overlay";
      document.body.appendChild(modal);
    }

    var categoryLabel = AppData.categoryLabels[ngo.category] || ngo.category;
    var needsListHtml = (ngo.urgentNeeds || []).map(function (n) {
      return '<li style="margin-bottom: 4px; font-weight: 500; color: #E65100;">• ' + escapeHtml(n) + '</li>';
    }).join("");

    modal.innerHTML =
      '<div class="modal-card" style="max-width: 600px;">' +
        '<div class="modal-header">' +
          '<div>' +
            '<div style="display: flex; align-items: center; gap: 8px;">' +
              '<h3 style="margin: 0;">' + escapeHtml(ngo.name) + '</h3>' +
              (ngo.verified ? '<span class="badge badge-verified"><svg viewBox="0 0 24 24"><path d="M22 11.08V12a10 10 0 1 1-5.93-9.14"/><polyline points="22 4 12 14.01 9 11.01"/></svg>Verified</span>' : '') +
            '</div>' +
            '<span class="badge badge-category" style="margin-top: 6px; display: inline-block;">' + escapeHtml(categoryLabel) + '</span>' +
          '</div>' +
          '<button type="button" class="modal-close" id="close-ngo-modal">&times;</button>' +
        '</div>' +

        '<div class="modal-body" style="font-size: var(--font-size-sm); display: flex; flex-direction: column; gap: var(--space-4);">' +
          '<div>' +
            '<strong style="color: var(--color-text-secondary); font-size: 11px; text-transform: uppercase;">About Organisation</strong>' +
            '<p style="margin-top: 4px; line-height: var(--line-height-relaxed);">' + escapeHtml(ngo.description) + '</p>' +
          '</div>' +

          (ngo.impactHighlights ?
            '<div class="alert alert-success" style="margin-bottom: 0;">' +
              '<svg viewBox="0 0 24 24"><circle cx="12" cy="12" r="10"/><path d="M9 12l2 2 4-4"/></svg>' +
              '<span><strong>Impact Highlight:</strong> ' + escapeHtml(ngo.impactHighlights) + '</span>' +
            '</div>' : '') +

          '<div>' +
            '<strong style="color: var(--color-text-secondary); font-size: 11px; text-transform: uppercase;">Urgent Item Requirements</strong>' +
            '<ul style="list-style: none; padding-left: 0; margin-top: 6px;">' + (needsListHtml || '<li>• Food, clothes, books & essential supplies</li>') + '</ul>' +
          '</div>' +

          '<div class="profile-grid" style="gap: var(--space-4);">' +
            '<div>' +
              '<strong style="color: var(--color-text-secondary); font-size: 11px; text-transform: uppercase;">Address & City</strong>' +
              '<p style="margin-top: 2px;">' + escapeHtml(ngo.address + ', ' + ngo.city) + '</p>' +
            '</div>' +
            '<div>' +
              '<strong style="color: var(--color-text-secondary); font-size: 11px; text-transform: uppercase;">Operating Hours</strong>' +
              '<p style="margin-top: 2px;">' + escapeHtml(ngo.operatingHours || '9:00 AM - 6:00 PM') + '</p>' +
            '</div>' +
            '<div>' +
              '<strong style="color: var(--color-text-secondary); font-size: 11px; text-transform: uppercase;">Verification Audit</strong>' +
              '<p style="margin-top: 2px; font-size: var(--font-size-xs); color: var(--color-success); font-weight: 600;">' + escapeHtml(ngo.verificationDetails || 'Verified 2026') + '</p>' +
            '</div>' +
            '<div>' +
              '<strong style="color: var(--color-text-secondary); font-size: 11px; text-transform: uppercase;">Direct Contact</strong>' +
              '<p style="margin-top: 2px; font-size: var(--font-size-xs);">' + escapeHtml(ngo.contactPhone || '') + ' | ' + escapeHtml(ngo.contactEmail || '') + '</p>' +
            '</div>' +
          '</div>' +

          '<div style="display: flex; gap: var(--space-3); margin-top: var(--space-4);">' +
            '<a href="donate.html?ngo=' + ngo.id + '" class="btn btn-primary btn-lg" style="flex: 1; text-align: center;">Donate Items to ' + escapeHtml(ngo.name.split(" ")[0]) + '</a>' +
            '<button type="button" class="btn btn-secondary btn-lg" id="close-ngo-modal-btn">Close</button>' +
          '</div>' +
        '</div>' +
      '</div>';

    modal.style.display = "flex";

    var close1 = modal.querySelector("#close-ngo-modal");
    var close2 = modal.querySelector("#close-ngo-modal-btn");
    [close1, close2].forEach(function (btn) {
      if (btn) {
        btn.addEventListener("click", function () {
          modal.style.display = "none";
        });
      }
    });

    modal.addEventListener("click", function (e) {
      if (e.target === modal) modal.style.display = "none";
    });
  }


  /* ----- Filter and Search Logic ----- */
  function applyFilters() {
    if (typeof AppData === "undefined") return;

    var ngos = AppData.ngos.slice();
    var searchTerm = searchInput ? searchInput.value.trim().toLowerCase() : "";

    // Check URL query search parameters if coming from search
    var urlParams = new URLSearchParams(window.location.search);
    var urlSearch = urlParams.get("search");
    if (urlSearch && !searchTerm && searchInput) {
      searchInput.value = urlSearch;
      searchTerm = urlSearch.trim().toLowerCase();
    }

    // Filter by category
    if (activeCategory !== "all") {
      ngos = ngos.filter(function (ngo) {
        return ngo.category === activeCategory;
      });
    }

    // Filter by search text
    if (searchTerm) {
      ngos = ngos.filter(function (ngo) {
        return (
          ngo.name.toLowerCase().indexOf(searchTerm) !== -1 ||
          ngo.city.toLowerCase().indexOf(searchTerm) !== -1 ||
          ngo.address.toLowerCase().indexOf(searchTerm) !== -1 ||
          (ngo.urgentNeeds && ngo.urgentNeeds.some(function (n) { return n.toLowerCase().indexOf(searchTerm) !== -1; }))
        );
      });
    }

    // Sort by distance if user location available
    if (userCoords) {
      ngos.sort(function (a, b) {
        var distA = GeoLocation.calculateDistance(userCoords.lat, userCoords.lng, a.lat, a.lng);
        var distB = GeoLocation.calculateDistance(userCoords.lat, userCoords.lng, b.lat, b.lng);
        return distA - distB;
      });
    }

    renderCards(ngos);
  }


  /* ----- Category Pill Click ----- */
  function handleCategoryClick(e) {
    var pill = e.target.closest(".filter-pill");
    if (!pill) return;

    categoryPills.forEach(function (p) { p.classList.remove("active"); });
    pill.classList.add("active");

    activeCategory = pill.dataset.category || "all";
    applyFilters();
  }


  /* ----- Distance Sort Toggle ----- */
  function handleDistanceSort() {
    if (typeof GeoLocation === "undefined") return;

    if (userCoords) {
      applyFilters();
      return;
    }

    if (distanceBtn) {
      distanceBtn.textContent = "Detecting location...";
      distanceBtn.disabled = true;
    }

    GeoLocation.getCurrentPosition()
      .then(function (coords) {
        userCoords = coords;
        if (distanceBtn) {
          distanceBtn.textContent = "Sorted by Distance";
          distanceBtn.disabled = false;
          distanceBtn.classList.add("active");
        }
        applyFilters();
      })
      .catch(function (errMsg) {
        if (distanceBtn) {
          distanceBtn.textContent = "Sort by Distance";
          distanceBtn.disabled = false;
        }
        alert(errMsg);
      });
  }


  /* ----- Category Colour Helper ----- */
  function getCategoryColor(category) {
    var colors = {
      ngo: "var(--color-primary)",
      orphanage: "var(--color-accent)",
      oldAgeHome: "#6B5B95"
    };
    return colors[category] || "var(--color-primary)";
  }


  /* ----- Initialise ----- */
  function init() {
    container = document.getElementById("ngo-grid");
    if (!container) return;

    searchInput = document.getElementById("ngo-search");
    categoryPills = document.querySelectorAll("#ngo-filters .filter-pill");
    distanceBtn = document.getElementById("distance-sort-btn");

    if (searchInput) {
      searchInput.addEventListener("input", applyFilters);
    }

    if (categoryPills.length > 0) {
      var filtersContainer = document.getElementById("ngo-filters");
      if (filtersContainer) {
        filtersContainer.addEventListener("click", handleCategoryClick);
      }
    }

    if (distanceBtn) {
      distanceBtn.addEventListener("click", handleDistanceSort);
    }

    window.addEventListener("locationDetected", function (e) {
      userCoords = e.detail;
      applyFilters();
    });

    applyFilters();

    var params = new URLSearchParams(window.location.search);
    var targetNgoId = params.get("ngo") || params.get("id");
    if (targetNgoId) {
      var parsedId = parseInt(targetNgoId);
      var exists = AppData.ngos.some(function (n) { return n.id === parsedId; });
      if (!exists) {
        window.location.href = "404.html";
        return;
      } else {
        openNgoModal(parsedId);
      }
    }
  }

  document.addEventListener("DOMContentLoaded", init);

})();
