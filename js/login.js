/* ========================================
   login.js — Login & Signup Page Logic
   ======================================== */

(function () {
  "use strict";

  /* ----- Self-contained validation helpers -----
     main.js (which defines window.validateField) is NOT loaded on login/signup pages,
     so we need our own validation functions here. */

  function showFieldError(input, errorMsg) {
    var group = input.closest(".form-group");
    if (!group) return;
    group.classList.add("has-error");
    var errorEl = group.querySelector(".form-error");
    if (errorEl && errorMsg) {
      errorEl.textContent = errorMsg;
    }
  }

  function clearFieldError(input) {
    var group = input.closest(".form-group");
    if (group) {
      group.classList.remove("has-error");
    }
  }


  /* ----- LOGIN FORM ----- */
  var loginForm = document.getElementById("login-form");
  if (loginForm) {
    var emailInput = document.getElementById("login-email");
    var passwordInput = document.getElementById("login-password");
    var toggleBtn = document.getElementById("toggle-password");
    var successMsg = loginForm.querySelector(".form-success");

    // Password Visibility Toggle
    if (toggleBtn && passwordInput) {
      toggleBtn.addEventListener("click", function () {
        var isPassword = passwordInput.type === "password";
        passwordInput.type = isPassword ? "text" : "password";

        var eyeOpen = toggleBtn.querySelector(".eye-open");
        var eyeClosed = toggleBtn.querySelector(".eye-closed");

        if (eyeOpen && eyeClosed) {
          eyeOpen.style.display = isPassword ? "none" : "block";
          eyeClosed.style.display = isPassword ? "block" : "none";
        }
        toggleBtn.setAttribute("aria-label", isPassword ? "Hide password" : "Show password");
      });
    }

    // Submit handler
    loginForm.addEventListener("submit", function (e) {
      e.preventDefault();
      var valid = true;

      var emailVal = emailInput ? emailInput.value.trim() : "";
      var passVal = passwordInput ? passwordInput.value : "";

      // Validate Email
      if (!emailVal || !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(emailVal)) {
        showFieldError(emailInput, "Please enter a valid email address.");
        valid = false;
      }

      // Validate Password
      if (!passVal || passVal.length < 6) {
        showFieldError(passwordInput, "Password must be at least 6 characters.");
        valid = false;
      }

      if (valid) {
        // If user was previously saved, keep existing profile info if available
        var existingUser = null;
        try {
          var stored = localStorage.getItem("ivolunteer_user");
          if (stored) existingUser = JSON.parse(stored);
        } catch (err) {}

        var fallbackName = emailVal.split("@")[0];
        fallbackName = fallbackName.charAt(0).toUpperCase() + fallbackName.slice(1);

        var user = {
          name: (existingUser && existingUser.name) ? existingUser.name : fallbackName,
          email: emailVal,
          phone: (existingUser && existingUser.phone) || "",
          city: (existingUser && existingUser.city) || "",
          joinedDate: (existingUser && existingUser.joinedDate) || "August 2026",
          bio: (existingUser && existingUser.bio) || "Enthusiastic community member.",
          loggedIn: true,
          isVolunteer: existingUser ? existingUser.isVolunteer : true,
          volunteerSubProfile: existingUser ? existingUser.volunteerSubProfile : null,
          loginTime: new Date().toISOString()
        };

        localStorage.setItem("ivolunteer_user", JSON.stringify(user));

        if (successMsg) {
          successMsg.textContent = "Signed in successfully. Redirecting to your profile...";
          successMsg.classList.add("visible");
        }

        setTimeout(function () {
          window.location.href = "profile.html";
        }, 1000);
      }
    });

    // Clear error on input for all fields
    [emailInput, passwordInput].forEach(function (input) {
      if (!input) return;
      input.addEventListener("input", function () {
        clearFieldError(this);
      });
    });
  }


  /* ----- SIGNUP FORM ----- */
  var signupForm = document.getElementById("signup-form");
  if (signupForm) {
    var sName = document.getElementById("signup-name");
    var sEmail = document.getElementById("signup-email");
    var sPhone = document.getElementById("signup-phone");
    var sCity = document.getElementById("signup-city");
    var sPass = document.getElementById("signup-password");
    var sVolCheck = document.getElementById("signup-is-volunteer");
    var sSuccess = signupForm.querySelector(".form-success");

    signupForm.addEventListener("submit", function (e) {
      e.preventDefault();
      var valid = true;

      var nameVal = sName ? sName.value.trim() : "";
      var emailVal = sEmail ? sEmail.value.trim() : "";
      var passVal = sPass ? sPass.value : "";
      var phoneVal = sPhone ? sPhone.value.trim() : "";
      var cityVal = sCity ? sCity.value.trim() : "";
      var isVol = sVolCheck ? sVolCheck.checked : false;

      if (!nameVal) {
        showFieldError(sName, "Please enter your full name.");
        valid = false;
      }
      if (!emailVal || !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(emailVal)) {
        showFieldError(sEmail, "Please enter a valid email address.");
        valid = false;
      }
      if (!passVal || passVal.length < 6) {
        showFieldError(sPass, "Password must be at least 6 characters.");
        valid = false;
      }

      if (valid) {
        var newUser = {
          name: nameVal,
          email: emailVal,
          phone: phoneVal || "",
          city: cityVal || "",
          joinedDate: "August 2026",
          bio: "Enthusiastic community member dedicated to making a difference through giving and volunteering.",
          loggedIn: true,
          isVolunteer: isVol,
          volunteerSubProfile: isVol ? {
            volunteerId: "VOL-2026-" + Math.floor(1000 + Math.random() * 9000),
            status: "Active Volunteer",
            joinedVolunteerDate: new Date().toISOString().split("T")[0],
            hoursContributed: 0,
            drivesAttended: 0,
            availability: "weekends",
            interests: ["foodDrive", "clothingDrive"],
            skills: ["Community Outreach"],
            badges: [
              { name: "New Volunteer", icon: "🌱", desc: "Joined iVolunteer active volunteer network" }
            ],
            upcomingDrives: []
          } : null
        };

        localStorage.setItem("ivolunteer_user", JSON.stringify(newUser));

        if (sSuccess) {
          sSuccess.textContent = "Account created successfully! Redirecting to profile...";
          sSuccess.classList.add("visible");
        }

        setTimeout(function () {
          window.location.href = "profile.html";
        }, 1200);
      }
    });

    [sName, sEmail, sPass, sPhone, sCity].forEach(function (input) {
      if (!input) return;
      input.addEventListener("input", function () {
        clearFieldError(this);
      });
    });
  }


  /* ----- GOOGLE LOGIN ----- */
  var googleBtn = document.getElementById("google-login-btn");
  if (googleBtn) {
    googleBtn.addEventListener("click", function () {
      var gName = prompt("Welcome to iVolunteer! Please enter your Full Name for your profile:");
      if (gName === null) return; // User cancelled
      while (!gName || !gName.trim()) {
        gName = prompt("Name is required to set up your profile. Please enter your Full Name:");
        if (gName === null) return;
      }

      var gPhone = prompt("Please enter your Phone Number (e.g. +91 98765 43210):");
      if (gPhone === null) gPhone = "";

      var gCity = prompt("Please enter your City (e.g. Mumbai, New Delhi):");
      if (gCity === null) gCity = "";

      var googleUser = {
        name: gName.trim(),
        email: gName.trim().toLowerCase().replace(/\s+/g, ".") + "@gmail.com",
        phone: gPhone.trim() || "",
        city: gCity.trim() || "",
        joinedDate: "August 2026",
        bio: "Signed in via Google.",
        loggedIn: true,
        isVolunteer: true
      };

      localStorage.setItem("ivolunteer_user", JSON.stringify(googleUser));

      var successMsg = document.querySelector(".form-success");
      if (successMsg) {
        successMsg.textContent = "Signed in with Google. Redirecting to profile...";
        successMsg.classList.add("visible");
      }

      setTimeout(function () {
        window.location.href = "profile.html";
      }, 1000);
    });
  }

})();
