var GeoLocation = (function () {
  "use strict";

  /* ----- Get Current Position ----- */
  // Returns a Promise that resolves to { lat, lng } or rejects with an error message.
  function getCurrentPosition() {
    return new Promise(function (resolve, reject) {
      if (!navigator.geolocation) {
        reject("Geolocation is not supported by your browser.");
        return;
      }

      navigator.geolocation.getCurrentPosition(
        function (position) {
          resolve({
            lat: position.coords.latitude,
            lng: position.coords.longitude
          });
        },
        function (error) {
          switch (error.code) {
            case error.PERMISSION_DENIED:
              reject("Location permission was denied. Please enable location access in your browser settings.");
              break;
            case error.POSITION_UNAVAILABLE:
              reject("Location information is currently unavailable. Please try again.");
              break;
            case error.TIMEOUT:
              reject("The location request timed out. Please try again.");
              break;
            default:
              reject("An unknown error occurred while fetching location.");
          }
        },
        {
          enableHighAccuracy: true,
          timeout: 10000,
          maximumAge: 60000
        }
      );
    });
  }


  /* ----- Reverse Geocode (simple, no external API) ----- */
  // Converts lat/lng to a readable string using known city coordinates.
  // Since we cannot call external APIs, this does a nearest-city lookup
  // against our mock data and returns a formatted address string.
  function reverseGeocode(lat, lng) {
    var knownLocations = [
      { name: "New Delhi", lat: 28.6139, lng: 77.2090 },
      { name: "Mumbai", lat: 19.0760, lng: 72.8777 },
      { name: "Bangalore", lat: 12.9716, lng: 77.5946 },
      { name: "Hyderabad", lat: 17.3850, lng: 78.4867 },
      { name: "Chennai", lat: 13.0827, lng: 80.2707 },
      { name: "Kolkata", lat: 22.5726, lng: 88.3639 },
      { name: "Pune", lat: 18.5204, lng: 73.8567 },
      { name: "Jaipur", lat: 26.9124, lng: 75.7873 },
      { name: "Noida", lat: 28.5355, lng: 77.3910 },
      { name: "Gurgaon", lat: 28.4595, lng: 77.0266 }
    ];

    var nearest = null;
    var minDist = Infinity;

    knownLocations.forEach(function (loc) {
      var d = calculateDistance(lat, lng, loc.lat, loc.lng);
      if (d < minDist) {
        minDist = d;
        nearest = loc;
      }
    });

    // Format: "Near <City> (lat, lng)"
    var city = nearest ? nearest.name : "your location";
    return "Near " + city + " (" + lat.toFixed(4) + ", " + lng.toFixed(4) + ")";
  }


  /* ----- Haversine Distance Calculation ----- */
  // Returns distance in kilometres between two coordinate pairs.
  function calculateDistance(lat1, lng1, lat2, lng2) {
    var R = 6371; // Earth radius in km
    var dLat = toRad(lat2 - lat1);
    var dLng = toRad(lng2 - lng1);

    var a =
      Math.sin(dLat / 2) * Math.sin(dLat / 2) +
      Math.cos(toRad(lat1)) * Math.cos(toRad(lat2)) *
      Math.sin(dLng / 2) * Math.sin(dLng / 2);

    var c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
    return R * c;
  }

  function toRad(deg) {
    return deg * (Math.PI / 180);
  }


  /* ----- Auto-Fill Address Field ----- */
  // Fetches the user's location and fills the specified input element.
  // Also updates a status element if provided.
  function autoFillAddress(inputElement, statusElement) {
    if (statusElement) {
      statusElement.className = "location-status";
      statusElement.innerHTML =
        '<svg viewBox="0 0 24 24"><path d="M21 10c0 7-9 13-9 13s-9-6-9-13a9 9 0 0 1 18 0z"/><circle cx="12" cy="10" r="3"/></svg>' +
        '<span>Fetching your location...</span>';
    }

    return getCurrentPosition()
      .then(function (coords) {
        var address = reverseGeocode(coords.lat, coords.lng);
        inputElement.value = address;

        // Store coordinates for distance filtering
        inputElement.dataset.lat = coords.lat;
        inputElement.dataset.lng = coords.lng;

        if (statusElement) {
          statusElement.className = "location-status success";
          statusElement.innerHTML =
            '<svg viewBox="0 0 24 24"><path d="M22 11.08V12a10 10 0 1 1-5.93-9.14"/><polyline points="22 4 12 14.01 9 11.01"/></svg>' +
            '<span>Location detected successfully.</span>';
        }

        // Dispatch a custom event so other modules can react
        window.dispatchEvent(new CustomEvent("locationDetected", {
          detail: coords
        }));

        return coords;
      })
      .catch(function (errMsg) {
        if (statusElement) {
          statusElement.className = "location-status error";
          statusElement.innerHTML =
            '<svg viewBox="0 0 24 24"><circle cx="12" cy="12" r="10"/><line x1="15" y1="9" x2="9" y2="15"/><line x1="9" y1="9" x2="15" y2="15"/></svg>' +
            '<span>' + errMsg + '</span>';
        }
        throw errMsg;
      });
  }


  /* ----- Public API ----- */
  return {
    getCurrentPosition: getCurrentPosition,
    reverseGeocode: reverseGeocode,
    calculateDistance: calculateDistance,
    autoFillAddress: autoFillAddress
  };

})();
