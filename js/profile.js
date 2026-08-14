/* ========================================
   profile.js — User Profile & Volunteer Subprofile Logic
   ======================================== */

(function () {
  "use strict";

  /* Fallback: ensure escapeHtml is available even if main.js hasn't loaded */
  if (typeof window.escapeHtml !== "function") {
    window.escapeHtml = function (str) {
      var div = document.createElement("div");
      div.textContent = str;
      return div.innerHTML;
    };
  }
  var escapeHtml = window.escapeHtml;

  var currentUser = null;
  var activeDonationStatus = "all";

  /* ----- Initialise Profile Page ----- */
  function initProfile() {
    if (typeof AppData === "undefined") return;

    currentUser = AppData.getUserProfile();
    if (!currentUser || !currentUser.loggedIn) {
      window.location.href = "login.html";
      return;
    }

    renderHero();
    renderOverview();
    renderDonationHistory();
    renderVolunteerSubprofile();
    bindEvents();
  }


  /* ----- Render Profile Hero Card ----- */
  function renderHero() {
    var heroEl = document.getElementById("profile-hero-card");
    if (!heroEl || !currentUser) return;

    var displayName = currentUser.name || "User Profile";
    var initials = (typeof window.getInitials === "function") ? window.getInitials(displayName) : displayName.substring(0, 2).toUpperCase();
    var volBadge = currentUser.isVolunteer
      ? '<span class="hero-vol-badge"><svg viewBox="0 0 24 24" width="14" height="14" fill="currentColor"><path d="M12 21.35l-1.45-1.32C5.4 15.36 2 12.28 2 8.5 2 5.42 4.42 3 7.5 3c1.74 0 3.41.81 4.5 2.09C13.09 3.81 14.76 3 16.5 3 19.58 3 22 5.42 22 8.5c0 3.78-3.4 6.86-8.55 11.54L12 21.35z"/></svg> Active Volunteer</span>'
      : '';

    heroEl.innerHTML =
      '<div class="profile-hero-layout">' +
        '<div class="profile-avatar-wrap">' +
          '<div class="profile-avatar-lg initials-avatar">' + escapeHtml(initials) + '</div>' +
        '</div>' +
        '<div class="profile-hero-details">' +
          '<div style="display: flex; align-items: center; gap: var(--space-3); flex-wrap: wrap;">' +
            '<h1 style="margin: 0; color: var(--color-white); font-size: var(--font-size-2xl);">' + escapeHtml(displayName) + '</h1>' +
            volBadge +
          '</div>' +
          '<p style="color: rgba(255,255,255,0.85); margin-top: 4px; margin-bottom: var(--space-3);">' + escapeHtml(currentUser.email) + ' • ' + escapeHtml(currentUser.city || 'India') + '</p>' +
          '<div class="hero-meta-row">' +
            '<span><svg viewBox="0 0 24 24" width="14" height="14"><rect x="3" y="4" width="18" height="18" rx="2" ry="2"/><line x1="16" y1="2" x2="16" y2="6"/><line x1="8" y1="2" x2="8" y2="6"/><line x1="3" y1="10" x2="21" y2="10"/></svg> Member since ' + escapeHtml(currentUser.joinedDate || '2026') + '</span>' +
          '</div>' +
        '</div>' +
      '</div>';
  }


  /* ----- Render Overview Tab ----- */
  function renderOverview() {
    var infoEl = document.getElementById("profile-info-list");
    if (!infoEl || !currentUser) return;

    var volSub = currentUser.volunteerSubProfile;
    var volStatusStr = currentUser.isVolunteer
      ? (volSub ? 'Active Volunteer (' + volSub.volunteerId + ')' : 'Active Volunteer')
      : 'Standard Member (Not registered as Volunteer)';

    infoEl.innerHTML =
      '<div class="info-row"><span class="info-label">Full Name</span><span class="info-val">' + escapeHtml(currentUser.name || '-') + '</span></div>' +
      '<div class="info-row"><span class="info-label">Email Address</span><span class="info-val">' + escapeHtml(currentUser.email || '-') + '</span></div>' +
      '<div class="info-row"><span class="info-label">Phone Number</span><span class="info-val">' + escapeHtml(currentUser.phone || '-') + '</span></div>' +
      '<div class="info-row"><span class="info-label">City / Location</span><span class="info-val">' + escapeHtml(currentUser.city || '-') + '</span></div>' +
      '<div class="info-row"><span class="info-label">Volunteer Status</span><span class="info-val">' + escapeHtml(volStatusStr) + '</span></div>' +
      '<div class="info-row"><span class="info-label">Bio</span><span class="info-val">' + escapeHtml(currentUser.bio || 'No bio added yet.') + '</span></div>';

    // Update impact stats counters
    updateImpactStats();
  }


  /* ----- Update Impact Stats Counters ----- */
  function updateImpactStats() {
    var userDonations = getUserDonationsList();

    var totalDonations = userDonations.length;
    var deliveredItems = userDonations.filter(function (d) { return d.status === "delivered"; }).length;

    var volSub = currentUser ? currentUser.volunteerSubProfile : null;
    var volHours = volSub ? (volSub.hoursContributed || 0) : 0;
    var volDrives = volSub ? (volSub.drivesAttended || 0) : 0;

    var elTotal = document.getElementById("stat-total-donations");
    var elDelivered = document.getElementById("stat-items-delivered");
    var elHours = document.getElementById("stat-vol-hours");
    var elDrives = document.getElementById("stat-vol-drives");
    var elBadgeCount = document.getElementById("donation-count-badge");

    if (elTotal) elTotal.textContent = totalDonations;
    if (elDelivered) elDelivered.textContent = deliveredItems;
    if (elHours) elHours.textContent = volHours + " hrs";
    if (elDrives) elDrives.textContent = volDrives;
    if (elBadgeCount) elBadgeCount.textContent = totalDonations;
  }


  /* ----- Fetch User Donations List ----- */
  function getUserDonationsList() {
    var list = [];
    if (typeof AppData !== "undefined" && AppData.donations) {
      list = list.concat(AppData.donations);
    }
    try {
      var stored = localStorage.getItem("ivolunteer_donations");
      if (stored) {
        var parsed = JSON.parse(stored);
        if (Array.isArray(parsed)) {
          list = parsed.concat(list);
        }
      }
    } catch (e) {}
    return list;
  }


  /* ----- Render Donation History Tab ----- */
  function renderDonationHistory() {
    var container = document.getElementById("user-donation-history-list");
    if (!container) return;

    var donations = getUserDonationsList();

    if (activeDonationStatus !== "all") {
      donations = donations.filter(function (d) {
        return d.status === activeDonationStatus;
      });
    }

    if (donations.length === 0) {
      container.innerHTML =
        '<div class="empty-state">' +
          '<svg viewBox="0 0 24 24"><rect x="3" y="3" width="18" height="18" rx="2" ry="2"/><line x1="3" y1="9" x2="21" y2="9"/><line x1="9" y1="21" x2="9" y2="9"/></svg>' +
          '<p>No donations found matching "' + activeDonationStatus + '".</p>' +
        '</div>';
      return;
    }

    container.innerHTML = "";
    donations.forEach(function (d) {
      var typeLabel = (AppData.donationTypeLabels && AppData.donationTypeLabels[d.type]) || d.type;
      var statusLabel = (AppData.statusLabels && AppData.statusLabels[d.status]) || d.status;

      var card = document.createElement("div");
      card.className = "donation-history-card";
      card.innerHTML =
        '<div class="dh-icon-col ' + d.type + '">' +
          escapeHtml(typeLabel.charAt(0)) +
        '</div>' +
        '<div class="dh-main-col">' +
          '<div style="display: flex; align-items: center; justify-content: space-between; gap: var(--space-2); margin-bottom: 4px;">' +
            '<h4 style="margin: 0; font-size: var(--font-size-md);">' + escapeHtml(d.description) + '</h4>' +
            '<span class="badge dh-status-badge ' + d.status + '">' + escapeHtml(statusLabel) + '</span>' +
          '</div>' +
          '<div class="dh-meta-row">' +
            '<span><strong>ID:</strong> ' + escapeHtml(d.id) + '</span> • ' +
            '<span><strong>Qty:</strong> ' + escapeHtml(d.quantity) + '</span> • ' +
            '<span><strong>Recipient NGO:</strong> ' + escapeHtml(d.ngoName || 'Verified NGO') + '</span>' +
          '</div>' +
          '<div style="font-size: var(--font-size-xs); color: var(--color-text-secondary); margin-top: 4px;">' +
            'Pickup Address: ' + escapeHtml(d.pickupAddress || 'Address on file') + ' • Date: ' + escapeHtml(d.date || 'Recent') +
          '</div>' +
        '</div>';
      container.appendChild(card);
    });
  }


  /* ----- Render Volunteer Subprofile Tab ----- */
  function renderVolunteerSubprofile() {
    var container = document.getElementById("volunteer-subprofile-container");
    if (!container || !currentUser) return;

    if (!currentUser.isVolunteer) {
      // Show prompt to activate Volunteer Subprofile
      container.innerHTML =
        '<div class="card subprofile-prompt-card">' +
          '<div class="card-body text-center" style="padding: var(--space-12);">' +
            '<div class="vol-prompt-icon">' +
              '<svg viewBox="0 0 24 24" width="48" height="48" fill="var(--color-primary)"><path d="M12 21.35l-1.45-1.32C5.4 15.36 2 12.28 2 8.5 2 5.42 4.42 3 7.5 3c1.74 0 3.41.81 4.5 2.09C13.09 3.81 14.76 3 16.5 3 19.58 3 22 5.42 22 8.5c0 3.78-3.4 6.86-8.55 11.54L12 21.35z"/></svg>' +
            '</div>' +
            '<h2 style="margin-bottom: var(--space-3);">Activate Your Volunteer Subprofile</h2>' +
            '<p style="max-width: 540px; margin: 0 auto var(--space-6); color: var(--color-text-secondary);">' +
              'When you choose to volunteer on iVolunteer, a dedicated <strong>Volunteer Subprofile</strong> is created inside your main profile. Track your volunteer hours, earn achievement badges, and participate in community drives!' +
            '</p>' +
            '<button type="button" class="btn btn-primary btn-lg" id="activate-vol-btn">Activate Volunteer Subprofile Now</button>' +
          '</div>' +
        '</div>';

      var actBtn = document.getElementById("activate-vol-btn");
      if (actBtn) {
        actBtn.addEventListener("click", function () {
          activateVolunteerSubprofile();
        });
      }
      return;
    }

    // Ensure user has subprofile object
    var volSub = currentUser.volunteerSubProfile || {
      volunteerId: "VOL-2026-8842",
      status: "Active Volunteer",
      joinedVolunteerDate: "2026-02-10",
      hoursContributed: 24,
      drivesAttended: 6,
      availability: "weekends",
      interests: ["foodDrive", "clothingDrive", "teaching"],
      skills: ["Food Distribution", "Primary Education", "Event Logistics"],
      badges: [
        { name: "Food Hero", icon: "🍱", desc: "Participated in 5+ food distribution drives" },
        { name: "Community Champion", icon: "🌟", desc: "Logged over 20 active volunteer hours" },
        { name: "Warmth Giver", icon: "🧥", desc: "Organized winter clothing collection" }
      ],
      upcomingDrives: [
        { title: "Weekend Food Distribution Drive", date: "2026-08-22", location: "Old City, Hyderabad", status: "Confirmed" },
        { title: "Winter Clothing Collection Camp", date: "2026-09-15", location: "Connaught Place, New Delhi", status: "Registered" }
      ]
    };

    // Render Subprofile
    var interestsBadgesHtml = (volSub.interests || []).map(function (cat) {
      var label = (AppData.activityTypeLabels && AppData.activityTypeLabels[cat]) || cat;
      return '<span class="badge badge-category" style="margin-right: 6px; margin-bottom: 6px;">' + escapeHtml(label) + '</span>';
    }).join("");

    var skillsHtml = (volSub.skills || []).map(function (sk) {
      return '<span class="skill-tag">' + escapeHtml(sk) + '</span>';
    }).join("");

    var badgesGridHtml = (volSub.badges || []).map(function (b) {
      return '<div class="vol-badge-card">' +
               '<div class="vol-badge-icon">' + b.icon + '</div>' +
               '<div class="vol-badge-name">' + escapeHtml(b.name) + '</div>' +
               '<div class="vol-badge-desc">' + escapeHtml(b.desc) + '</div>' +
             '</div>';
    }).join("");

    var upcomingRowsHtml = (volSub.upcomingDrives || []).map(function (d) {
      return '<tr>' +
               '<td><strong>' + escapeHtml(d.title) + '</strong></td>' +
               '<td>' + escapeHtml(d.date) + '</td>' +
               '<td>' + escapeHtml(d.location) + '</td>' +
               '<td><span class="badge badge-verified">' + escapeHtml(d.status) + '</span></td>' +
             '</tr>';
    }).join("");

    container.innerHTML =
      '<div class="vol-subprofile-banner">' +
        '<div class="vol-sub-header">' +
          '<div>' +
            '<div style="display: flex; align-items: center; gap: 10px; flex-wrap: wrap;">' +
              '<h2 style="margin: 0; color: var(--color-white);">Volunteer Subprofile</h2>' +
              '<span class="vol-id-tag">' + escapeHtml(volSub.volunteerId || 'VOL-2026-8842') + '</span>' +
            '</div>' +
            '<p style="color: rgba(255,255,255,0.85); margin-top: 4px;">Status: ' + escapeHtml(volSub.status || 'Active Volunteer') + ' • Member since ' + escapeHtml(volSub.joinedVolunteerDate || 'Feb 2026') + '</p>' +
          '</div>' +
          '<div>' +
            '<a href="volunteer.html" class="btn btn-secondary btn-sm">Find New Drives</a>' +
          '</div>' +
        '</div>' +
      '</div>' +

      '<div class="profile-grid" style="margin-top: var(--space-6);">' +
        '<!-- Left Column: Metrics & Badges -->' +
        '<div style="display: flex; flex-direction: column; gap: var(--space-6);">' +

          '<!-- Volunteer Metrics -->' +
          '<div class="card">' +
            '<div class="card-body">' +
              '<h3 style="margin-bottom: var(--space-4);">Volunteer Impact Metrics</h3>' +
              '<div class="profile-impact-grid">' +
                '<div class="impact-mini-card">' +
                  '<div class="impact-val" style="color: var(--color-primary);">' + (volSub.hoursContributed || 0) + '</div>' +
                  '<div class="impact-lbl">Hours Contributed</div>' +
                '</div>' +
                '<div class="impact-mini-card">' +
                  '<div class="impact-val" style="color: var(--color-accent);">' + (volSub.drivesAttended || 0) + '</div>' +
                  '<div class="impact-lbl">Drives Attended</div>' +
                '</div>' +
                '<div class="impact-mini-card">' +
                  '<div class="impact-val" style="color: #6B5B95;">' + (volSub.badges ? volSub.badges.length : 0) + '</div>' +
                  '<div class="impact-lbl">Badges Unlocked</div>' +
                '</div>' +
              '</div>' +
            '</div>' +
          '</div>' +

          '<!-- Achievement Badges -->' +
          '<div class="card">' +
            '<div class="card-body">' +
              '<h3 style="margin-bottom: var(--space-4);">Volunteer Badges & Achievements</h3>' +
              '<div class="vol-badges-grid">' + badgesGridHtml + '</div>' +
            '</div>' +
          '</div>' +

        '</div>' +

        '<!-- Right Column: Preferences & Drives -->' +
        '<div style="display: flex; flex-direction: column; gap: var(--space-6);">' +

          '<!-- Preferences & Interests -->' +
          '<div class="card">' +
            '<div class="card-body">' +
              '<h3 style="margin-bottom: var(--space-4);">Preferences & Skills</h3>' +
              '<div style="margin-bottom: var(--space-4);">' +
                '<strong style="display: block; font-size: var(--font-size-xs); color: var(--color-text-secondary); text-transform: uppercase; margin-bottom: var(--space-2);">Areas of Interest</strong>' +
                '<div>' + interestsBadgesHtml + '</div>' +
              '</div>' +
              '<div style="margin-bottom: var(--space-4);">' +
                '<strong style="display: block; font-size: var(--font-size-xs); color: var(--color-text-secondary); text-transform: uppercase; margin-bottom: var(--space-2);">Skills Offered</strong>' +
                '<div style="display: flex; flex-wrap: wrap; gap: 6px;">' + skillsHtml + '</div>' +
              '</div>' +
              '<div>' +
                '<strong style="display: block; font-size: var(--font-size-xs); color: var(--color-text-secondary); text-transform: uppercase; margin-bottom: var(--space-1);">Availability</strong>' +
                '<span style="font-weight: var(--font-weight-medium); capitalize">' + escapeHtml(volSub.availability || 'Weekends') + '</span>' +
              '</div>' +
            '</div>' +
          '</div>' +

          '<!-- Registered Drives -->' +
          '<div class="card">' +
            '<div class="card-body">' +
              '<h3 style="margin-bottom: var(--space-4);">Upcoming Registered Drives</h3>' +
              ((volSub.upcomingDrives && volSub.upcomingDrives.length > 0) ?
                '<div class="table-responsive"><table class="custom-table"><thead><tr><th>Drive</th><th>Date</th><th>Location</th><th>Status</th></tr></thead><tbody>' + upcomingRowsHtml + '</tbody></table></div>' :
                '<p style="color: var(--color-text-secondary);">No upcoming drives registered. <a href="volunteer.html">Browse available drives</a>.</p>') +
            '</div>' +
          '</div>' +

        '</div>' +
      '</div>';
  }


  /* ----- Activate Volunteer Subprofile ----- */
  function activateVolunteerSubprofile() {
    if (!currentUser) return;

    currentUser.isVolunteer = true;
    currentUser.volunteerSubProfile = {
      volunteerId: "VOL-2026-" + Math.floor(1000 + Math.random() * 9000),
      status: "Active Volunteer",
      joinedVolunteerDate: new Date().toISOString().split("T")[0],
      hoursContributed: 8,
      drivesAttended: 2,
      availability: "weekends",
      interests: ["foodDrive", "clothingDrive", "teaching"],
      skills: ["Community Support"],
      badges: [
        { name: "First Drive", icon: "🌱", desc: "Joined iVolunteer active volunteer network" },
        { name: "Kind Heart", icon: "❤️", desc: "Activated volunteer subprofile" }
      ],
      upcomingDrives: [
        { title: "Weekend Food Distribution Drive", date: "2026-08-22", location: "Old City, Hyderabad", status: "Confirmed" }
      ]
    };

    AppData.saveUserProfile(currentUser);

    // Re-render UI
    renderHero();
    renderOverview();
    renderVolunteerSubprofile();
  }


  /* ----- Bind Events ----- */
  function bindEvents() {
    // Tab switching
    var tabBtns = document.querySelectorAll(".profile-tab-btn");
    tabBtns.forEach(function (btn) {
      btn.addEventListener("click", function () {
        tabBtns.forEach(function (b) { b.classList.remove("active"); });
        this.classList.add("active");

        var targetTab = this.dataset.tab;
        var tabContents = document.querySelectorAll(".profile-tab-content");
        tabContents.forEach(function (tc) { tc.classList.remove("active"); });

        var targetEl = document.getElementById("tab-" + targetTab);
        if (targetEl) targetEl.classList.add("active");
      });
    });

    // Donation filter pills
    var dPills = document.querySelectorAll("#profile-donation-filters .filter-pill");
    dPills.forEach(function (pill) {
      pill.addEventListener("click", function () {
        dPills.forEach(function (p) { p.classList.remove("active"); });
        this.classList.add("active");
        activeDonationStatus = this.dataset.status || "all";
        renderDonationHistory();
      });
    });

    // Edit profile modal
    var editBtn = document.getElementById("edit-profile-btn");
    var modal = document.getElementById("edit-profile-modal");
    var closeBtn = document.getElementById("close-profile-modal");
    var cancelBtn = document.getElementById("cancel-profile-modal");
    var editForm = document.getElementById("edit-profile-form");

    if (editBtn && modal) {
      editBtn.addEventListener("click", function () {
        if (!currentUser) return;
        document.getElementById("edit-name").value = currentUser.name || "";
        document.getElementById("edit-phone").value = currentUser.phone || "";
        document.getElementById("edit-city").value = currentUser.city || "";
        document.getElementById("edit-bio").value = currentUser.bio || "";
        modal.style.display = "flex";
      });
    }

    function closeModal() {
      if (modal) modal.style.display = "none";
    }

    if (closeBtn) closeBtn.addEventListener("click", closeModal);
    if (cancelBtn) cancelBtn.addEventListener("click", closeModal);

    // Submit profile edit form
    if (editForm) {
      editForm.addEventListener("submit", function (e) {
        e.preventDefault();
        if (!currentUser) return;

        currentUser.name = document.getElementById("edit-name").value.trim();
        currentUser.phone = document.getElementById("edit-phone").value.trim();
        currentUser.city = document.getElementById("edit-city").value.trim();
        currentUser.bio = document.getElementById("edit-bio").value.trim();

        AppData.saveUserProfile(currentUser);

        renderHero();
        renderOverview();
        closeModal();

        // Update header UI if main script is loaded
        if (typeof window.updateHeaderUserUI === "function") {
          window.updateHeaderUserUI();
        }
      });
    }
  }

  document.addEventListener("DOMContentLoaded", initProfile);

})();
