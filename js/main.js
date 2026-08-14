(function () {
  "use strict";

  /* ----- Mobile Menu Toggle ----- */
  function initMobileMenu() {
    var toggle = document.querySelector(".menu-toggle");
    var nav = document.querySelector(".main-nav");

    if (!toggle || !nav) return;

    toggle.addEventListener("click", function () {
      var isOpen = nav.classList.toggle("open");
      toggle.classList.toggle("open", isOpen);
      toggle.setAttribute("aria-expanded", isOpen ? "true" : "false");
    });

    // Close menu when a nav link is clicked (mobile)
    var navLinks = nav.querySelectorAll("a");
    navLinks.forEach(function (link) {
      link.addEventListener("click", function () {
        nav.classList.remove("open");
        toggle.classList.remove("open");
        toggle.setAttribute("aria-expanded", "false");
      });
    });

    // Close menu on outside click
    document.addEventListener("click", function (e) {
      if (!nav.contains(e.target) && !toggle.contains(e.target)) {
        nav.classList.remove("open");
        toggle.classList.remove("open");
        toggle.setAttribute("aria-expanded", "false");
      }
    });
  }


  /* ----- Helper: Get User Initials ----- */
  function getInitials(name) {
    if (!name) return "U";
    var parts = name.trim().split(/\s+/);
    if (parts.length >= 2) {
      return (parts[0][0] + parts[parts.length - 1][0]).toUpperCase();
    }
    return name.substring(0, 2).toUpperCase();
  }
  window.getInitials = getInitials;


  /* ----- Header User Navigation & Login State ----- */
  function updateHeaderUserUI() {
    var ctaWrap = document.querySelector(".header-cta");
    if (!ctaWrap) return;

    var user = null;
    if (typeof AppData !== "undefined" && AppData.getUserProfile) {
      user = AppData.getUserProfile();
    } else {
      try {
        var raw = localStorage.getItem("ivolunteer_user");
        if (raw) {
          var parsed = JSON.parse(raw);
          if (parsed && parsed.loggedIn && parsed.name) user = parsed;
        }
      } catch (e) {}
    }

    if (user && user.loggedIn) {
      var displayName = user.name || user.email.split("@")[0];
      var initials = getInitials(displayName);
      var volunteerBadge = user.isVolunteer ? '<span class="user-vol-pill" title="Active Volunteer">Vol</span>' : '';

      ctaWrap.innerHTML =
        '<div class="header-user-menu">' +
          '<a href="profile.html" class="header-profile-btn" title="View Profile">' +
            '<div class="header-avatar initials-avatar">' + escapeHtml(initials) + '</div>' +
            '<span class="header-username">' + escapeHtml(displayName) + '</span>' +
            volunteerBadge +
          '</a>' +
          '<button type="button" id="header-logout-btn" class="btn btn-ghost btn-sm" title="Log Out">' +
            '<svg viewBox="0 0 24 24" width="16" height="16"><path d="M9 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h4"/><polyline points="16 17 21 12 16 7"/><line x1="21" y1="12" x2="9" y2="12"/></svg>' +
          '</button>' +
        '</div>' +
        '<a href="donate.html" class="btn btn-primary btn-sm">Donate Now</a>';

      var logoutBtn = document.getElementById("header-logout-btn");
      if (logoutBtn) {
        logoutBtn.addEventListener("click", function (e) {
          e.preventDefault();
          if (confirm("Are you sure you want to log out?")) {
            localStorage.removeItem("ivolunteer_user");
            window.location.href = "login.html";
          }
        });
      }
    } else {
      ctaWrap.innerHTML =
        '<a href="login.html" class="header-login-link">Sign In</a>' +
        '<a href="donate.html" class="btn btn-primary btn-sm">Donate Now</a>';
    }
  }


  /* ----- Active Page Highlighting ----- */
  function setActivePage() {
    var currentPath = window.location.pathname;
    var filename = currentPath.split("/").pop() || "index.html";

    var navLinks = document.querySelectorAll(".main-nav a");
    navLinks.forEach(function (link) {
      var href = link.getAttribute("href");
      if (!href) return;

      var linkFile = href.split("/").pop();
      if (linkFile === filename) {
        link.classList.add("active");
      } else {
        link.classList.remove("active");
      }
    });
  }


  /* ----- Smooth Scroll for Anchor Links ----- */
  function initSmoothScroll() {
    var anchors = document.querySelectorAll('a[href^="#"]');
    anchors.forEach(function (anchor) {
      anchor.addEventListener("click", function (e) {
        var targetId = this.getAttribute("href");
        if (targetId === "#") return;

        var target = document.querySelector(targetId);
        if (target) {
          e.preventDefault();
          target.scrollIntoView({ behavior: "smooth", block: "start" });
        }
      });
    });
  }


  /* ----- Generic Form Validation Utility ----- */
  // Validates a form field and toggles error state.
  // Returns true if valid, false otherwise.
  window.validateField = function (input, validationFn, errorMsg) {
    var group = input.closest(".form-group");
    if (!group) return true;

    var errorEl = group.querySelector(".form-error");
    var isValid = validationFn(input.value.trim());

    if (!isValid) {
      group.classList.add("has-error");
      if (errorEl) {
        errorEl.textContent = errorMsg || "This field is required.";
      }
    } else {
      group.classList.remove("has-error");
    }

    return isValid;
  };

  // Clear error state on input
  window.clearFieldError = function (input) {
    var group = input.closest(".form-group");
    if (group) {
      group.classList.remove("has-error");
    }
  };


  /* ----- Contact Form Validation (about.html) ----- */
  function initContactForm() {
    var form = document.getElementById("contact-form");
    if (!form) return;

    var successMsg = form.querySelector(".form-success");

    form.addEventListener("submit", function (e) {
      e.preventDefault();
      var valid = true;

      var name = form.querySelector("#contact-name");
      var email = form.querySelector("#contact-email");
      var subject = form.querySelector("#contact-subject");
      var message = form.querySelector("#contact-message");

      if (!validateField(name, function (v) { return v.length > 0; }, "Please enter your name.")) valid = false;
      if (!validateField(email, function (v) { return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(v); }, "Please enter a valid email address.")) valid = false;
      if (!validateField(subject, function (v) { return v.length > 0; }, "Please enter a subject.")) valid = false;
      if (!validateField(message, function (v) { return v.length >= 10; }, "Message must be at least 10 characters.")) valid = false;

      if (valid) {
        if (successMsg) {
          successMsg.textContent = "Thank you for reaching out. We will get back to you shortly.";
          successMsg.classList.add("visible");
        }
        form.reset();
        // Hide success after 5 seconds
        setTimeout(function () {
          if (successMsg) successMsg.classList.remove("visible");
        }, 5000);
      }
    });

    // Clear errors on input
    var inputs = form.querySelectorAll(".form-input, .form-textarea, .form-select");
    inputs.forEach(function (input) {
      input.addEventListener("input", function () {
        clearFieldError(this);
      });
    });
  }


  /* ----- Volunteer Form Validation (volunteer.html) ----- */
  function initVolunteerForm() {
    var form = document.getElementById("volunteer-form");
    if (!form) return;

    var successMsg = form.querySelector(".form-success");

    form.addEventListener("submit", function (e) {
      e.preventDefault();
      var valid = true;

      var name = form.querySelector("#vol-name");
      var email = form.querySelector("#vol-email");
      var phone = form.querySelector("#vol-phone");
      var availability = form.querySelector("#vol-availability");

      if (!validateField(name, function (v) { return v.length > 0; }, "Please enter your full name.")) valid = false;
      if (!validateField(email, function (v) { return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(v); }, "Please enter a valid email address.")) valid = false;
      if (!validateField(phone, function (v) { return /^[+]?[\d\s-]{7,15}$/.test(v); }, "Please enter a valid phone number.")) valid = false;
      if (!validateField(availability, function (v) { return v.length > 0; }, "Please select your availability.")) valid = false;

      // Check that at least one interest checkbox is selected
      var checkboxes = form.querySelectorAll('input[name="interests"]:checked');
      var selectedInterests = [];
      checkboxes.forEach(function (cb) { selectedInterests.push(cb.value); });

      var checkboxGroup = form.querySelector(".checkbox-group");
      var checkboxError = form.querySelector("#interests-error");
      if (checkboxes.length === 0) {
        valid = false;
        if (checkboxGroup) checkboxGroup.closest(".form-group").classList.add("has-error");
        if (checkboxError) checkboxError.style.display = "block";
      } else {
        if (checkboxGroup) checkboxGroup.closest(".form-group").classList.remove("has-error");
        if (checkboxError) checkboxError.style.display = "none";
      }

      if (valid) {
        // Save or update user profile with Volunteer Subprofile
        var user = null;
        if (typeof AppData !== "undefined" && AppData.getUserProfile) {
          user = AppData.getUserProfile() || Object.assign({}, AppData.defaultUser);
        } else {
          user = {
            name: name.value.trim(),
            email: email.value.trim(),
            phone: phone.value.trim(),
            city: "New Delhi",
            joinedDate: "August 2026",
            loggedIn: true
          };
        }

        user.name = name.value.trim();
        user.email = email.value.trim();
        user.phone = phone.value.trim();
        user.isVolunteer = true;
        user.loggedIn = true;

        user.volunteerSubProfile = {
          volunteerId: "VOL-2026-" + Math.floor(1000 + Math.random() * 9000),
          status: "Active Volunteer",
          joinedVolunteerDate: new Date().toISOString().split("T")[0],
          hoursContributed: 12,
          drivesAttended: 3,
          availability: availability.value,
          interests: selectedInterests,
          skills: ["Community Outreach", "Event Logistics"],
          badges: [
            { name: "Registered Volunteer", icon: "🤝", desc: "Signed up via Volunteer Registration form" },
            { name: "Community Contributor", icon: "🌟", desc: "Active volunteer profile initialized" }
          ],
          upcomingDrives: [
            { title: "Weekend Food Distribution Drive", date: "2026-08-22", location: "Old City, Hyderabad", status: "Confirmed" }
          ]
        };

        if (typeof AppData !== "undefined" && AppData.saveUserProfile) {
          AppData.saveUserProfile(user);
        } else {
          localStorage.setItem("ivolunteer_user", JSON.stringify(user));
        }

        if (successMsg) {
          successMsg.innerHTML =
            '<div>Thank you for signing up as a volunteer! Your <strong>Volunteer Subprofile</strong> is now active in your profile.</div>' +
            '<a href="profile.html" class="btn btn-primary btn-sm" style="margin-top: var(--space-3); display: inline-block;">View My Volunteer Subprofile</a>';
          successMsg.classList.add("visible");
        }

        form.reset();

        if (typeof updateHeaderUserUI === "function") {
          updateHeaderUserUI();
        }
      }
    });

    // Clear errors on input
    var inputs = form.querySelectorAll(".form-input, .form-textarea, .form-select");
    inputs.forEach(function (input) {
      input.addEventListener("input", function () {
        clearFieldError(this);
      });
    });
  }


  /* ----- Volunteer Activities Rendering ----- */
  function initVolunteerActivities() {
    var container = document.getElementById("activities-grid");
    if (!container || typeof AppData === "undefined") return;

    var activities = AppData.volunteerActivities;
    var typeFilter = document.getElementById("activity-type-filter");
    var locationFilter = document.getElementById("activity-location-filter");

    function renderActivities(filtered) {
      container.innerHTML = "";

      if (filtered.length === 0) {
        container.innerHTML = '<div class="empty-state"><svg viewBox="0 0 24 24"><circle cx="12" cy="12" r="10"/><path d="M8 15s1.5 2 4 2 4-2 4-2"/><line x1="9" y1="9" x2="9.01" y2="9"/><line x1="15" y1="9" x2="15.01" y2="9"/></svg><p>No activities match your filters.</p></div>';
        return;
      }

      filtered.forEach(function (activity) {
        var typeLabel = AppData.activityTypeLabels[activity.type] || activity.type;
        var card = document.createElement("div");
        card.className = "card";
        card.innerHTML =
          '<div class="card-body">' +
            '<div class="card-icon-header">' +
              getActivityIcon(activity.type) +
            '</div>' +
            '<h3>' + escapeHtml(activity.title) + '</h3>' +
            '<p>' + escapeHtml(activity.description) + '</p>' +
            '<div class="card-meta">' +
              '<span class="card-meta-item"><svg viewBox="0 0 24 24"><path d="M21 10c0 7-9 13-9 13s-9-6-9-13a9 9 0 0 1 18 0z"/><circle cx="12" cy="10" r="3"/></svg>' + escapeHtml(activity.location) + '</span>' +
              '<span class="card-meta-item"><svg viewBox="0 0 24 24"><rect x="3" y="4" width="18" height="18" rx="2" ry="2"/><line x1="16" y1="2" x2="16" y2="6"/><line x1="8" y1="2" x2="8" y2="6"/><line x1="3" y1="10" x2="21" y2="10"/></svg>' + escapeHtml(activity.date) + '</span>' +
            '</div>' +
            '<div style="margin-top: var(--space-4); display: flex; justify-content: space-between; align-items: center;">' +
              '<span class="badge badge-category">' + escapeHtml(typeLabel) + '</span>' +
              '<span style="font-size: var(--font-size-xs); color: var(--color-text-secondary);">' + activity.spotsAvailable + ' spots available</span>' +
            '</div>' +
          '</div>';
        container.appendChild(card);
      });
    }

    function filterActivities() {
      var type = typeFilter ? typeFilter.value : "all";
      var loc = locationFilter ? locationFilter.value.trim().toLowerCase() : "";

      var filtered = activities.filter(function (a) {
        var matchType = type === "all" || a.type === type;
        var matchLoc = loc === "" || a.location.toLowerCase().indexOf(loc) !== -1;
        return matchType && matchLoc;
      });

      renderActivities(filtered);
    }

    if (typeFilter) typeFilter.addEventListener("change", filterActivities);
    if (locationFilter) locationFilter.addEventListener("input", filterActivities);

    renderActivities(activities);
  }


  /* ----- SVG Icons for activity types ----- */
  function getActivityIcon(type) {
    var icons = {
      foodDrive: '<svg viewBox="0 0 24 24"><path d="M18 8h1a4 4 0 0 1 0 8h-1"/><path d="M2 8h16v9a4 4 0 0 1-4 4H6a4 4 0 0 1-4-4V8z"/><line x1="6" y1="1" x2="6" y2="4"/><line x1="10" y1="1" x2="10" y2="4"/><line x1="14" y1="1" x2="14" y2="4"/></svg>',
      clothingDrive: '<svg viewBox="0 0 24 24"><path d="M20.38 3.46L16 2 12 5.5 8 2l-4.38 1.46a2 2 0 0 0-1.34 1.88v15.34A2 2 0 0 0 4.26 22h15.48a2 2 0 0 0 1.98-1.32V5.34a2 2 0 0 0-1.34-1.88z"/></svg>',
      teaching: '<svg viewBox="0 0 24 24"><path d="M2 3h6a4 4 0 0 1 4 4v14a3 3 0 0 0-3-3H2z"/><path d="M22 3h-6a4 4 0 0 0-4 4v14a3 3 0 0 1 3-3h7z"/></svg>',
      elderCare: '<svg viewBox="0 0 24 24"><path d="M20.84 4.61a5.5 5.5 0 0 0-7.78 0L12 5.67l-1.06-1.06a5.5 5.5 0 0 0-7.78 7.78l1.06 1.06L12 21.23l7.78-7.78 1.06-1.06a5.5 5.5 0 0 0 0-7.78z"/></svg>',
      cleanup: '<svg viewBox="0 0 24 24"><path d="M3 6h18"/><path d="M19 6v14c0 1-1 2-2 2H7c-1 0-2-1-2-2V6"/><path d="M8 6V4c0-1 1-2 2-2h4c1 0 2 1 2 2v2"/></svg>'
    };
    return icons[type] || '<svg viewBox="0 0 24 24"><circle cx="12" cy="12" r="10"/></svg>';
  }


  /* ----- Utility: escape HTML ----- */
  function escapeHtml(str) {
    var div = document.createElement("div");
    div.textContent = str;
    return div.innerHTML;
  }
  // Make available globally for other modules
  window.escapeHtml = escapeHtml;


  /* ----- Initialise on DOM Ready ----- */
  document.addEventListener("DOMContentLoaded", function () {
    initMobileMenu();
    updateHeaderUserUI();
    setActivePage();
    initSmoothScroll();
    initContactForm();
    initVolunteerForm();
    initVolunteerActivities();
  });

})();
