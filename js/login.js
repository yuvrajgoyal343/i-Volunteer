/* ========================================
   login.js — Login & Signup Page Logic
   ======================================== */

(function () {
  "use strict";

  /* ----- LOGIN FORM ----- */
  var loginForm = document.getElementById("login-form");
  if (loginForm) {
    var nameInput = document.getElementById("login-name");
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

      var nameVal = nameInput ? nameInput.value.trim() : "";
      var emailVal = emailInput ? emailInput.value.trim() : "";
      var passVal = passwordInput ? passwordInput.value : "";

      if (nameInput && !nameVal) {
        if (typeof validateField === "function") {
          validateField(nameInput, function () { return false; }, "Please enter your full name.");
        }
        valid = false;
      }

      if (!emailVal || !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(emailVal)) {
        if (typeof validateField === "function") {
          validateField(emailInput, function () { return false; }, "Please enter a valid email address.");
        }
        valid = false;
      }

      if (!passVal || passVal.length < 6) {
        if (typeof validateField === "function") {
          validateField(passwordInput, function () { return false; }, "Password must be at least 6 characters.");
        }
        valid = false;
      }

      if (valid) {
        // If user was previously saved under this email, keep existing profile info if available
        var existingUser = null;
        try {
          var stored = localStorage.getItem("ivolunteer_user");
          if (stored) existingUser = JSON.parse(stored);
        } catch (err) {}

        var user = {
          name: nameVal || (existingUser && existingUser.name) || emailVal.split("@")[0],
          email: emailVal,
          phone: (existingUser && existingUser.phone) || "+91 98765 43210",
          city: (existingUser && existingUser.city) || "New Delhi",
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

    // Clear error on input
    [nameInput, emailInput, passwordInput].forEach(function (input) {
      if (!input) return;
      input.addEventListener("input", function () {
        var group = this.closest(".form-group");
        if (group) group.classList.remove("has-error");
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
        if (typeof validateField === "function") validateField(sName, function () { return false; }, "Please enter your full name.");
        valid = false;
      }
      if (!emailVal || !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(emailVal)) {
        if (typeof validateField === "function") validateField(sEmail, function () { return false; }, "Please enter a valid email address.");
        valid = false;
      }
      if (!passVal || passVal.length < 6) {
        if (typeof validateField === "function") validateField(sPass, function () { return false; }, "Password must be at least 6 characters.");
        valid = false;
      }

      if (valid) {
        var newUser = {
          name: nameVal,
          email: emailVal,
          phone: phoneVal || "+91 98765 43210",
          city: cityVal || "New Delhi",
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

    [sName, sEmail, sPass].forEach(function (input) {
      if (!input) return;
      input.addEventListener("input", function () {
        var group = this.closest(".form-group");
        if (group) group.classList.remove("has-error");
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

      var googleUser = {
        name: gName.trim(),
        email: gName.trim().toLowerCase().replace(/\s+/g, ".") + "@gmail.com",
        phone: "+91 98112 33445",
        city: "Mumbai",
        joinedDate: "August 2026",
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
