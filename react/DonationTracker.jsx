const { useState, useEffect, useCallback } = React;

// Status label mapping
const STATUS_LABELS = {
  requested: "Requested",
  pickedUp: "Picked Up",
  delivered: "Delivered"
};

// Type label mapping
const TYPE_LABELS = {
  food: "Food",
  clothes: "Clothes",
  books: "Books",
  medicines: "Medicines",
  other: "Other"
};

// Tab definitions
const TABS = [
  { key: "all", label: "All" },
  { key: "active", label: "Active" },
  { key: "completed", label: "Completed" }
];


/* ----- Main Component ----- */
function DonationTracker() {
  const [donations, setDonations] = useState([]);
  const [activeTab, setActiveTab] = useState("all");

  // Load donations from localStorage and merge with mock data
  const loadDonations = useCallback(function () {
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

    setDonations(allDonations);
  }, []);

  // Initial load
  useEffect(function () {
    loadDonations();
  }, [loadDonations]);

  // Expose refresh function globally so donationForm.js can call it
  useEffect(function () {
    window.refreshDonationTracker = loadDonations;
    return function () {
      delete window.refreshDonationTracker;
    };
  }, [loadDonations]);

  // Filter donations based on active tab
  var filteredDonations = donations.filter(function (d) {
    if (activeTab === "active") {
      return d.status === "requested" || d.status === "pickedUp";
    }
    if (activeTab === "completed") {
      return d.status === "delivered";
    }
    return true;
  });

  // Count per tab
  var counts = {
    all: donations.length,
    active: donations.filter(function (d) { return d.status === "requested" || d.status === "pickedUp"; }).length,
    completed: donations.filter(function (d) { return d.status === "delivered"; }).length
  };

  return (
    <div className="donation-tracker">
      {/* Tabs */}
      <div className="tracker-tabs" role="tablist">
        {TABS.map(function (tab) {
          return (
            <button
              key={tab.key}
              role="tab"
              aria-selected={activeTab === tab.key}
              className={"tracker-tab" + (activeTab === tab.key ? " active" : "")}
              onClick={function () { setActiveTab(tab.key); }}
            >
              {tab.label}
              <span className="tab-count">{counts[tab.key]}</span>
            </button>
          );
        })}
      </div>

      {/* Donation List */}
      {filteredDonations.length === 0 ? (
        <div className="tracker-empty">
          <svg className="empty-icon" viewBox="0 0 24 24">
            <rect x="3" y="3" width="18" height="18" rx="2" ry="2"/>
            <line x1="3" y1="9" x2="21" y2="9"/>
            <line x1="9" y1="21" x2="9" y2="9"/>
          </svg>
          <p>
            {activeTab === "completed"
              ? "No completed donations yet."
              : activeTab === "active"
              ? "No active donations at the moment."
              : "No donations found. Submit a donation above to get started."}
          </p>
        </div>
      ) : (
        <div className="donation-list">
          {filteredDonations.map(function (donation) {
            var typeLabel = TYPE_LABELS[donation.type] || donation.type;
            var statusLabel = STATUS_LABELS[donation.status] || donation.status;
            var typeInitial = typeLabel.charAt(0);

            return (
              <div key={donation.id} className="donation-item">
                <div className={"donation-type-icon " + donation.type}>
                  {typeInitial}
                </div>
                <div className="donation-info">
                  <h4>{donation.description}</h4>
                  <p>{typeLabel} -- {donation.quantity}</p>
                  <p className="donation-ngo">{donation.ngoName}</p>
                </div>
                <div className="donation-status-col">
                  <span className={"status-badge " + donation.status}>
                    <span className={"status-dot " + donation.status}></span>
                    {statusLabel}
                  </span>
                  <div className="donation-date">{donation.date}</div>
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}


/* ----- Mount the Component ----- */
var trackerRoot = document.getElementById("donation-tracker-root");
if (trackerRoot) {
  var root = ReactDOM.createRoot(trackerRoot);
  root.render(<DonationTracker />);
}
