(function () {
  "use strict";

  var form = null;
  var successMsg = null;
  var ngoSelect = null;
  var addressInput = null;
  var locationBtn = null;
  var locationStatus = null;
  var userCoords = null;


  /* ----- Populate NGO Dropdown ----- */
  function populateNgoDropdown(sortByDistance) {
    if (!ngoSelect || typeof AppData === "undefined") return;

    var ngos = AppData.ngos.slice();

    // Sort by distance if user location is available
    if (sortByDistance && userCoords) {
      ngos.sort(function (a, b) {
        var distA = GeoLocation.calculateDistance(userCoords.lat, userCoords.lng, a.lat, a.lng);
        var distB = GeoLocation.calculateDistance(userCoords.lat, userCoords.lng, b.lat, b.lng);
        return distA - distB;
      });
    }

    // Clear existing options (keep the first placeholder)
    while (ngoSelect.options.length > 1) {
      ngoSelect.remove(1);
    }

    ngos.forEach(function (ngo) {
      var option = document.createElement("option");
      option.value = ngo.id;
      var label = ngo.name + " -- " + ngo.city;
      if (userCoords) {
        var dist = GeoLocation.calculateDistance(userCoords.lat, userCoords.lng, ngo.lat, ngo.lng);
        label += " (" + Math.round(dist) + " km)";
      }
      option.textContent = label;
      ngoSelect.appendChild(option);
    });
  }


  /* ----- Location Auto-Fill ----- */
  function handleLocationClick() {
    if (!addressInput || typeof GeoLocation === "undefined") return;

    GeoLocation.autoFillAddress(addressInput, locationStatus)
      .then(function (coords) {
        userCoords = coords;
        // Re-populate NGO dropdown sorted by distance
        populateNgoDropdown(true);
        // Clear any error on address field
        if (typeof clearFieldError === "function") {
          clearFieldError(addressInput);
        }
      })
      .catch(function () {
        // Error is already displayed by autoFillAddress
      });
  }


  /* ----- Validate and Submit ----- */
  function handleSubmit(e) {
    e.preventDefault();

    var valid = true;

    var typeField = form.querySelector("#donation-type");
    var descField = form.querySelector("#donation-desc");
    var qtyField = form.querySelector("#donation-qty");
    var addrField = form.querySelector("#donation-address");
    var ngoField = form.querySelector("#donation-ngo");

    // Validate each field
    if (!validateField(typeField, function (v) { return v.length > 0; }, "Please select a donation type.")) valid = false;
    if (!validateField(descField, function (v) { return v.length >= 5; }, "Please provide a description (at least 5 characters).")) valid = false;
    if (!validateField(qtyField, function (v) { return v.length > 0; }, "Please enter the quantity.")) valid = false;
    if (!validateField(addrField, function (v) { return v.length >= 5; }, "Please enter a valid pickup address.")) valid = false;
    if (!validateField(ngoField, function (v) { return v.length > 0; }, "Please select an organisation.")) valid = false;

    if (!valid) return;

    // Build donation record
    var selectedNgo = AppData.ngos.find(function (n) { return n.id === parseInt(ngoField.value); });
    var donation = {
      id: "DON-" + (Date.now() % 100000),
      type: typeField.value,
      description: descField.value.trim(),
      quantity: qtyField.value.trim(),
      pickupAddress: addrField.value.trim(),
      ngoId: parseInt(ngoField.value),
      ngoName: selectedNgo ? selectedNgo.name : "Unknown",
      status: "requested",
      date: new Date().toISOString().split("T")[0],
      lastUpdated: new Date().toISOString().split("T")[0]
    };

    // Save to localStorage
    var stored = [];
    try {
      var raw = localStorage.getItem("ivolunteer_donations");
      if (raw) stored = JSON.parse(raw);
    } catch (err) {
      stored = [];
    }
    stored.unshift(donation);
    localStorage.setItem("ivolunteer_donations", JSON.stringify(stored));

    // Show success
    if (successMsg) {
      successMsg.textContent = "Your donation request (ID: " + donation.id + ") has been submitted successfully. The organisation will arrange a pickup shortly.";
      successMsg.classList.add("visible");
    }

    form.reset();

    // Refresh the React tracker if it exists
    if (window.refreshDonationTracker) {
      window.refreshDonationTracker();
    }

    // Scroll to success message
    if (successMsg) {
      successMsg.scrollIntoView({ behavior: "smooth", block: "center" });
    }

    // Hide success after 8 seconds
    setTimeout(function () {
      if (successMsg) successMsg.classList.remove("visible");
    }, 8000);
  }


  /* ----- Initialise ----- */
  function init() {
    form = document.getElementById("donation-form");
    if (!form) return;

    successMsg = form.querySelector(".form-success");
    ngoSelect = form.querySelector("#donation-ngo");
    addressInput = form.querySelector("#donation-address");
    locationBtn = document.getElementById("use-location-btn");
    locationStatus = document.getElementById("location-status");

    // Populate NGO dropdown
    populateNgoDropdown(false);

    // Location button
    if (locationBtn) {
      locationBtn.addEventListener("click", handleLocationClick);
    }

    // Listen for location events from other sources
    window.addEventListener("locationDetected", function (e) {
      userCoords = e.detail;
      populateNgoDropdown(true);
    });

    // Form submission
    form.addEventListener("submit", handleSubmit);

    // Clear field errors on input
    var inputs = form.querySelectorAll(".form-input, .form-textarea, .form-select");
    inputs.forEach(function (input) {
      input.addEventListener("input", function () {
        if (typeof clearFieldError === "function") {
          clearFieldError(this);
        }
      });
    });
  }

  document.addEventListener("DOMContentLoaded", init);

})();
