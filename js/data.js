var AppData = (function () {

  /* ----- Global Auth Guard ----- */
  (function enforceAuthGuard() {
    try {
      var path = window.location.pathname;
      var filename = path.split("/").pop() || "index.html";
      if (!filename || filename === "") filename = "index.html";

      // Pages that require login
      var protectedPages = ["profile.html"];
      var isProtectedPage = protectedPages.indexOf(filename) !== -1;
      // Pages where logged-in users should be redirected away
      var isAuthPage = (filename === "login.html" || filename === "signup.html");

      var rawUser = localStorage.getItem("ivolunteer_user");
      var userLoggedIn = false;
      if (rawUser) {
        var parsed = JSON.parse(rawUser);
        if (parsed && parsed.loggedIn && parsed.name) {
          userLoggedIn = true;
        }
      }

      // Not logged in and trying to access a protected page → go to login
      if (!userLoggedIn && isProtectedPage) {
        window.location.replace("login.html");
        return; // Stop further execution
      }
      // Logged in but on login/signup → go to home
      else if (userLoggedIn && isAuthPage) {
        window.location.replace("index.html");
        return; // Stop further execution
      }

      // Auth check passed — reveal the page body
      document.documentElement.style.visibility = "visible";
    } catch (e) {
      // On error, still show the page to avoid blank screens
      document.documentElement.style.visibility = "visible";
    }
  })();

  /* ----- NGOs / Organisations ----- */
  var ngos = [
    {
      id: 1,
      name: "Helping Hands Foundation",
      category: "ngo",
      description: "A non-profit organisation dedicated to providing food and shelter to underprivileged communities across urban areas.",
      address: "12, MG Road, Sector 14",
      city: "New Delhi",
      lat: 28.6139,
      lng: 77.2090,
      verified: true,
      contactEmail: "contact@helpinghands.org",
      contactPhone: "+91 98765 43210",
      founded: "2014",
      urgentNeeds: ["Rice & Pulses", "Warm Blankets", "Hygiene Kits"],
      beneficiariesServed: "15,000+ people",
      operatingHours: "9:00 AM - 6:00 PM (Mon - Sat)",
      verificationDetails: "FCRA & 80G Certified, On-Ground Verified 2026",
      impactHighlights: "Serves over 1,500 hot meals daily and supports 12 shelter homes in Delhi NCR."
    },
    {
      id: 2,
      name: "Sunshine Orphanage",
      category: "orphanage",
      description: "Home to over 60 children, providing education, healthcare, and a nurturing environment for growth.",
      address: "45, Green Park Colony",
      city: "Mumbai",
      lat: 19.0760,
      lng: 72.8777,
      verified: true,
      contactEmail: "info@sunshineorphanage.in",
      contactPhone: "+91 98765 12345",
      founded: "2011",
      urgentNeeds: ["School Notebooks & Pens", "Kids Footwear", "Nutritional Drinks"],
      beneficiariesServed: "65 Resident Children",
      operatingHours: "8:00 AM - 8:00 PM (Everyday)",
      verificationDetails: "Child Care License #4481, Annual Audit Verified",
      impactHighlights: "100% school enrollment for resident children with 12 students pursuing higher education."
    },
    {
      id: 3,
      name: "Silver Years Old Age Home",
      category: "oldAgeHome",
      description: "Caring for elderly residents with dignity, offering medical support, recreational activities, and companionship.",
      address: "78, Lajpat Nagar",
      city: "New Delhi",
      lat: 28.5700,
      lng: 77.2400,
      verified: true,
      contactEmail: "care@silveryears.org",
      contactPhone: "+91 87654 32109",
      founded: "2016",
      urgentNeeds: ["Adult Diapers", "Wheelchairs & Walking Sticks", "Medicines & First Aid"],
      beneficiariesServed: "80 Senior Residents",
      operatingHours: "24 Hours Operational",
      verificationDetails: "Senior Care Welfare Registered, Verified 2026",
      impactHighlights: "Round-the-clock geriatric medical care and daily recreational companionship sessions."
    },
    {
      id: 4,
      name: "Green Earth Initiative",
      category: "ngo",
      description: "Focused on environmental conservation, clean water access, and sustainable living practices in rural communities.",
      address: "23, Banjara Hills",
      city: "Hyderabad",
      lat: 17.4100,
      lng: 78.4400,
      verified: true,
      contactEmail: "hello@greenearth.org",
      contactPhone: "+91 99887 76655",
      founded: "2018",
      urgentNeeds: ["Water Filters", "Tree Saplings", "Recyclable Containers"],
      beneficiariesServed: "40+ Rural Villages",
      operatingHours: "9:30 AM - 5:30 PM (Mon - Fri)",
      verificationDetails: "Environment Ministry Partner NGO, Verified 2026",
      impactHighlights: "Installed clean drinking water purification plants benefiting over 25,000 villagers."
    },
    {
      id: 5,
      name: "Little Stars Children Home",
      category: "orphanage",
      description: "Providing a safe haven, quality education, and emotional support to orphaned and abandoned children.",
      address: "90, Koramangala 4th Block",
      city: "Bangalore",
      lat: 12.9352,
      lng: 77.6245,
      verified: true,
      contactEmail: "admin@littlestars.in",
      contactPhone: "+91 80456 78901",
      founded: "2015",
      urgentNeeds: ["Story Books & Textbooks", "Winter Jackets", "Art Supplies"],
      beneficiariesServed: "90 Children & Youth",
      operatingHours: "9:00 AM - 7:00 PM (Everyday)",
      verificationDetails: "Karnataka State Child Trust #882, Verified 2026",
      impactHighlights: "Runs digital literacy labs and weekend mentorship programs for youth aged 6-18."
    },
    {
      id: 6,
      name: "Sahara Elder Care",
      category: "oldAgeHome",
      description: "A well-equipped residential facility for senior citizens offering medical care, therapy, and daily activities.",
      address: "34, Anna Nagar East",
      city: "Chennai",
      lat: 13.0827,
      lng: 80.2707,
      verified: true,
      contactEmail: "support@saharaeldercare.in",
      contactPhone: "+91 98001 23456",
      founded: "2013",
      urgentNeeds: ["Bed Sheets & Towels", "Orthopedic Pillows", "Nutritious Food Kits"],
      beneficiariesServed: "55 Senior Residents",
      operatingHours: "24 Hours Operational",
      verificationDetails: "TN Healthcare & Senior Welfare Trust, Verified 2026",
      impactHighlights: "Provides specialized physiotherapy and daily wellness programs for elderly care."
    },
    {
      id: 7,
      name: "Vidya Daan Foundation",
      category: "ngo",
      description: "Distributing books, stationery, and educational resources to government schools and community learning centres.",
      address: "56, Civil Lines",
      city: "Jaipur",
      lat: 26.9124,
      lng: 75.7873,
      verified: true,
      contactEmail: "reach@vidyadaan.org",
      contactPhone: "+91 94140 55667",
      founded: "2017",
      urgentNeeds: ["NCERT Textbooks", "School Bags & Uniforms", "Whiteboards"],
      beneficiariesServed: "8,500 Students",
      operatingHours: "9:00 AM - 5:00 PM (Mon - Sat)",
      verificationDetails: "Ministry of Education Partner NGO, Verified 2026",
      impactHighlights: "Equipped 35 government school libraries with over 40,000 donated books."
    },
    {
      id: 8,
      name: "Asha Deep Orphanage",
      category: "orphanage",
      description: "Running educational programmes, vocational training, and health check-ups for children without parental care.",
      address: "12, Salt Lake, Sector V",
      city: "Kolkata",
      lat: 22.5726,
      lng: 88.3639,
      verified: true,
      contactEmail: "info@ashadeep.org",
      contactPhone: "+91 98300 45678",
      founded: "2012",
      urgentNeeds: ["Children Shoes & Socks", "Raincoats", "Pulses & Milk Powder"],
      beneficiariesServed: "75 Resident Children",
      operatingHours: "8:00 AM - 7:30 PM (Everyday)",
      verificationDetails: "WB Child Welfare Committee License #912, Verified 2026",
      impactHighlights: "Offers skill development, computer training, and sports coaching for all residents."
    },
    {
      id: 9,
      name: "Karuna Medical Aid",
      category: "ngo",
      description: "Providing free medicines, health screenings, and medical equipment to underserved populations and rural clinics.",
      address: "101, Aundh Road",
      city: "Pune",
      lat: 18.5204,
      lng: 73.8567,
      verified: true,
      contactEmail: "help@karunamed.org",
      contactPhone: "+91 95551 22334",
      founded: "2016",
      urgentNeeds: ["First Aid Kits", "Pain Relievers & Antacids", "BP Monitors"],
      beneficiariesServed: "18,000+ Patients",
      operatingHours: "8:30 AM - 6:30 PM (Mon - Sat)",
      verificationDetails: "Indian Medical Relief Trust #332, Verified 2026",
      impactHighlights: "Organized 120+ free health screening camps across Maharashtra and Goa."
    },
    {
      id: 10,
      name: "Golden Sunset Home",
      category: "oldAgeHome",
      description: "Offering round-the-clock care, nutritious meals, and social activities for elderly residents in a home-like setting.",
      address: "67, Residency Road",
      city: "Bangalore",
      lat: 12.9716,
      lng: 77.5946,
      verified: true,
      contactEmail: "info@goldensunset.in",
      contactPhone: "+91 80234 56789",
      founded: "2010",
      urgentNeeds: ["Nutritional Supplements", "Blankets", "Recreational Board Games"],
      beneficiariesServed: "60 Senior Residents",
      operatingHours: "24 Hours Operational",
      verificationDetails: "Karnataka Elders Protection Board, Verified 2026",
      impactHighlights: "Creates a loving family atmosphere with regular cultural events and volunteer visits."
    },
    {
      id: 11,
      name: "Annapurna Food Bank",
      category: "ngo",
      description: "Collecting and redistributing surplus food from restaurants, events, and households to feed the hungry.",
      address: "19, Connaught Place",
      city: "New Delhi",
      lat: 28.6328,
      lng: 77.2197,
      verified: true,
      contactEmail: "donate@annapurnafb.org",
      contactPhone: "+91 99100 78900",
      founded: "2019",
      urgentNeeds: ["Cooked Meals", "Grain Packets", "Insulated Food Containers"],
      beneficiariesServed: "50,000+ Meals Served",
      operatingHours: "7:00 AM - 10:00 PM (Everyday)",
      verificationDetails: "FSSAI Registered Food Security Partner, Verified 2026",
      impactHighlights: "Rescues surplus food from 80+ hotel partners and feeds thousands daily."
    },
    {
      id: 12,
      name: "Naya Savera Trust",
      category: "ngo",
      description: "Working on women empowerment, child education, and community development through grassroots programmes.",
      address: "42, Jubilee Hills",
      city: "Hyderabad",
      lat: 17.4310,
      lng: 78.4070,
      verified: true,
      contactEmail: "connect@nayasavera.org",
      contactPhone: "+91 96001 33445",
      founded: "2017",
      urgentNeeds: ["Sewing Machines", "Sanitary Kits", "Children Books"],
      beneficiariesServed: "6,000 Women & Girls",
      operatingHours: "9:00 AM - 6:00 PM (Mon - Sat)",
      verificationDetails: "Telangana Women Welfare Dept Partner, Verified 2026",
      impactHighlights: "Trained 800+ women in vocational skills and established 15 self-help groups."
    }
  ];


  /* ----- Donations (mock history) ----- */
  var donations = [
    {
      id: "DON-1001",
      type: "food",
      description: "10 kg rice, 5 kg dal, cooking oil",
      quantity: "15 kg",
      pickupAddress: "23, Sector 18, Noida",
      ngoId: 1,
      ngoName: "Helping Hands Foundation",
      status: "delivered",
      date: "2026-07-20",
      lastUpdated: "2026-07-23"
    },
    {
      id: "DON-1002",
      type: "clothes",
      description: "Winter jackets and woollen blankets",
      quantity: "20 items",
      pickupAddress: "45, MG Road, Bangalore",
      ngoId: 5,
      ngoName: "Little Stars Children Home",
      status: "delivered",
      date: "2026-07-25",
      lastUpdated: "2026-07-28"
    },
    {
      id: "DON-1003",
      type: "books",
      description: "NCERT textbooks for classes 6 to 10",
      quantity: "35 books",
      pickupAddress: "78, Civil Lines, Jaipur",
      ngoId: 7,
      ngoName: "Vidya Daan Foundation",
      status: "delivered",
      date: "2026-08-01",
      lastUpdated: "2026-08-04"
    },
    {
      id: "DON-1004",
      type: "medicines",
      description: "OTC pain relievers, first-aid kits, bandages",
      quantity: "12 packs",
      pickupAddress: "101, FC Road, Pune",
      ngoId: 9,
      ngoName: "Karuna Medical Aid",
      status: "pickedUp",
      date: "2026-08-05",
      lastUpdated: "2026-08-07"
    },
    {
      id: "DON-1005",
      type: "food",
      description: "Cooked meals -- vegetable biryani, 50 servings",
      quantity: "50 servings",
      pickupAddress: "19, CP, New Delhi",
      ngoId: 11,
      ngoName: "Annapurna Food Bank",
      status: "pickedUp",
      date: "2026-08-08",
      lastUpdated: "2026-08-09"
    },
    {
      id: "DON-1006",
      type: "clothes",
      description: "Children uniforms and school shoes",
      quantity: "30 items",
      pickupAddress: "12, Salt Lake, Kolkata",
      ngoId: 8,
      ngoName: "Asha Deep Orphanage",
      status: "requested",
      date: "2026-08-10",
      lastUpdated: "2026-08-10"
    },
    {
      id: "DON-1007",
      type: "other",
      description: "Bed sheets, pillows, and towels",
      quantity: "25 items",
      pickupAddress: "34, Anna Nagar, Chennai",
      ngoId: 6,
      ngoName: "Sahara Elder Care",
      status: "requested",
      date: "2026-08-11",
      lastUpdated: "2026-08-11"
    },
    {
      id: "DON-1008",
      type: "books",
      description: "Storybooks, colouring books, and notebooks",
      quantity: "50 books",
      pickupAddress: "90, Koramangala, Bangalore",
      ngoId: 5,
      ngoName: "Little Stars Children Home",
      status: "requested",
      date: "2026-08-12",
      lastUpdated: "2026-08-12"
    }
  ];


  /* ----- Volunteer Activities ----- */
  var volunteerActivities = [
    {
      id: 1,
      title: "Weekend Food Distribution Drive",
      description: "Join us in distributing cooked meals and grocery kits to families in need across the Old City area every Saturday.",
      type: "foodDrive",
      location: "Old City, Hyderabad",
      date: "Every Saturday",
      spotsAvailable: 15,
      organiser: "Annapurna Food Bank"
    },
    {
      id: 2,
      title: "Winter Clothing Collection Camp",
      description: "Help collect, sort, and distribute warm clothing and blankets to homeless individuals and families before winter.",
      type: "clothingDrive",
      location: "Connaught Place, New Delhi",
      date: "2026-09-15",
      spotsAvailable: 20,
      organiser: "Helping Hands Foundation"
    },
    {
      id: 3,
      title: "Community Teaching Programme",
      description: "Teach English, Mathematics, and basic computer skills to children at the orphanage every weekend morning.",
      type: "teaching",
      location: "Koramangala, Bangalore",
      date: "Every Sunday",
      spotsAvailable: 8,
      organiser: "Little Stars Children Home"
    },
    {
      id: 4,
      title: "Elder Care Companionship Visit",
      description: "Spend time with elderly residents -- reading, playing board games, and simply providing companionship and conversation.",
      type: "elderCare",
      location: "Lajpat Nagar, New Delhi",
      date: "2026-09-01",
      spotsAvailable: 10,
      organiser: "Silver Years Old Age Home"
    },
    {
      id: 5,
      title: "Neighbourhood Cleanup Drive",
      description: "Participate in cleaning parks, streets, and public spaces. Supplies and refreshments provided to all volunteers.",
      type: "cleanup",
      location: "Jubilee Hills, Hyderabad",
      date: "2026-09-10",
      spotsAvailable: 30,
      organiser: "Green Earth Initiative"
    },
    {
      id: 6,
      title: "Book Donation and Reading Camp",
      description: "Organise a reading session for school children and distribute donated books, stationery, and school supplies.",
      type: "teaching",
      location: "Civil Lines, Jaipur",
      date: "2026-09-20",
      spotsAvailable: 12,
      organiser: "Vidya Daan Foundation"
    },
    {
      id: 7,
      title: "Free Health Check-up Camp",
      description: "Assist medical professionals in conducting free health screenings, distributing medicines, and health awareness materials.",
      type: "foodDrive",
      location: "Aundh, Pune",
      date: "2026-09-05",
      spotsAvailable: 18,
      organiser: "Karuna Medical Aid"
    },
    {
      id: 8,
      title: "Festival Celebration at Orphanage",
      description: "Help organise a festival celebration for children, including games, cultural activities, new clothes, and festive meals.",
      type: "elderCare",
      location: "Salt Lake, Kolkata",
      date: "2026-10-01",
      spotsAvailable: 25,
      organiser: "Asha Deep Orphanage"
    }
  ];


  /* ----- Category Labels ----- */
  var categoryLabels = {
    ngo: "NGO",
    orphanage: "Orphanage",
    oldAgeHome: "Old Age Home"
  };

  var donationTypeLabels = {
    food: "Food",
    clothes: "Clothes",
    books: "Books",
    medicines: "Medicines",
    other: "Other Essentials"
  };

  var activityTypeLabels = {
    foodDrive: "Food Drive",
    clothingDrive: "Clothing Drive",
    teaching: "Teaching",
    elderCare: "Elder Care",
    cleanup: "Cleanup"
  };

  var statusLabels = {
    requested: "Requested",
    pickedUp: "Picked Up",
    delivered: "Delivered"
  };

  /* ----- User Profile Structure ----- */
  var defaultUser = null;

  /* ----- Get / Set User Profile Helper ----- */
  function getUserProfile() {
    try {
      var stored = localStorage.getItem("ivolunteer_user");
      if (stored) {
        var parsed = JSON.parse(stored);
        if (parsed && parsed.loggedIn && parsed.name) {
          return parsed;
        }
      }
    } catch (e) {}
    return null;
  }

  function saveUserProfile(userObj) {
    try {
      localStorage.setItem("ivolunteer_user", JSON.stringify(userObj));
    } catch (e) {}
  }


  /* ----- Public API ----- */
  return {
    ngos: ngos,
    donations: donations,
    volunteerActivities: volunteerActivities,
    categoryLabels: categoryLabels,
    donationTypeLabels: donationTypeLabels,
    activityTypeLabels: activityTypeLabels,
    statusLabels: statusLabels,
    defaultUser: defaultUser,
    getUserProfile: getUserProfile,
    saveUserProfile: saveUserProfile
  };

})();

