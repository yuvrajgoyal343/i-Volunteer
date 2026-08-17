/* ========================================
   donationTracker.js — Donation Tracker (Vanilla JS)
   Replaces react/DonationTracker.jsx
   ======================================== */

(function () {
  "use strict";

  /* Fallback: ensure escapeHtml is available */
  if (typeof window.escapeHtml !== "function") {
    window.escapeHtml = function (str) {
      var div = document.createElement("div");
      div.textContent = str;
      return div.innerHTML;
    };
  }
  var escapeHtml = window.escapeHtml;

  /* ----- Constants ----- */
  var STATUS_LABELS = {
    requested: "Requested",
    pickedUp: "Picked Up",
    delivered: "Delivered"
  };

  var TYPE_LABELS = {
    food: "Food",
    clothes: "Clothes",
    books: "Books",
    medicines: "Medicines",
    other: "Other"
  };

  var TABS = [
    { key: "all", label: "All" },
    { key: "active", label: "Active" },
    { key: "completed", label: "Completed" }
  ];

  var EMPTY_MESSAGES = {
    all: "No donations found. Submit a donation above to get started.",
    active: "No active donations at the moment.",
    completed: "No completed donations yet."
  };


  /* ----- State ----- */
  var rootEl = null;
  var donations = [];
  var activeTab = "all";


  /* ----- Load Donations ----- */
  function loadDonations() {
    var allDonations = [];

    // Mock data from AppData
    if (typeof AppData !== "undefined" && AppData.donations) {
      allDonations = allDonations.concat(AppData.donations);
    }

    // User-submitted donations from localStorage
    try {
      var stored = localStorage.getItem("ivolunteer_donations");
      if (stored) {
        var parsed = JSON.parse(stored);
        if (Array.isArray(parsed)) {
          allDonations = parsed.concat(allDonations);
        }
      }
    } catch (err) {
      // Ignore parse errors
    }

    donations = allDonations;
  }


  /* ----- Filter Helpers ----- */
  function isActive(d) {
    return d.status === "requested" || d.status === "pickedUp";
  }

  function isCompleted(d) {
    return d.status === "delivered";
  }

  function getFilteredDonations() {
    if (activeTab === "active") {
      return donations.filter(isActive);
    }
    if (activeTab === "completed") {
      return donations.filter(isCompleted);
    }
    return donations.slice();
  }

  function getCounts() {
    return {
      all: donations.length,
      active: donations.filter(isActive).length,
      completed: donations.filter(isCompleted).length
    };
  }


  /* ----- Render ----- */
  function render() {
    if (!rootEl) return;

    var filtered = getFilteredDonations();
    var counts = getCounts();
    var html = "";

    // Tabs
    html += '<div class="tracker-tabs" role="tablist">';
    TABS.forEach(function (tab) {
      var isActiveTab = activeTab === tab.key;
      html += '<button role="tab" aria-selected="' + isActiveTab + '"' +
        ' class="tracker-tab' + (isActiveTab ? " active" : "") + '"' +
        ' data-tab="' + tab.key + '">' +
        escapeHtml(tab.label) +
        '<span class="tab-count">' + counts[tab.key] + '</span>' +
        '</button>';
    });
    html += '</div>';

    // Content
    if (filtered.length === 0) {
      html += '<div class="tracker-empty">' +
        '<svg class="empty-icon" viewBox="0 0 24 24">' +
          '<rect x="3" y="3" width="18" height="18" rx="2" ry="2"/>' +
          '<line x1="3" y1="9" x2="21" y2="9"/>' +
          '<line x1="9" y1="21" x2="9" y2="9"/>' +
        '</svg>' +
        '<p>' + escapeHtml(EMPTY_MESSAGES[activeTab]) + '</p>' +
      '</div>';
    } else {
      html += '<div class="donation-list">';
      filtered.forEach(function (donation) {
        var typeLabel = TYPE_LABELS[donation.type] || donation.type;
        var statusLabel = STATUS_LABELS[donation.status] || donation.status;
        var typeInitial = typeLabel.charAt(0);

        html += '<div class="donation-item">' +
          '<div class="donation-type-icon ' + escapeHtml(donation.type) + '">' +
            escapeHtml(typeInitial) +
          '</div>' +
          '<div class="donation-info">' +
            '<h4>' + escapeHtml(donation.description) + '</h4>' +
            '<p>' + escapeHtml(typeLabel) + ' -- ' + escapeHtml(donation.quantity) + '</p>' +
            '<p class="donation-ngo">' + escapeHtml(donation.ngoName) + '</p>' +
          '</div>' +
          '<div class="donation-status-col">' +
            '<span class="status-badge ' + escapeHtml(donation.status) + '">' +
              '<span class="status-dot ' + escapeHtml(donation.status) + '"></span>' +
              escapeHtml(statusLabel) +
            '</span>' +
            '<div class="donation-date">' + escapeHtml(donation.date) + '</div>' +
          '</div>' +
        '</div>';
      });
      html += '</div>';
    }

    rootEl.innerHTML = html;

    // Bind tab click events
    var tabBtns = rootEl.querySelectorAll(".tracker-tab");
    tabBtns.forEach(function (btn) {
      btn.addEventListener("click", function () {
        activeTab = this.dataset.tab;
        render();
      });
    });
  }


  /* ----- Public Refresh Function ----- */
  function refresh() {
    loadDonations();
    render();
  }

  // Expose globally so donationForm.js can call it
  window.refreshDonationTracker = refresh;


  /* ----- Initialise ----- */
  function init() {
    rootEl = document.getElementById("donation-tracker-root");
    if (!rootEl) return;

    loadDonations();
    render();
  }

  document.addEventListener("DOMContentLoaded", init);

})();
