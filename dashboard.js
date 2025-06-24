const sheetURL = "https://script.google.com/macros/s/AKfycbwDKpE7c1fNNKedMF05Q6uGnW9cTKIQ-AgyGkLwUIjI7LV3fXOsrQBIvPokzkX-vI3-YA/exec";
const booths = ["A1", "A2", "A3", "A4", "A5", "A6"];

// Cache DOM elements
const boothContainer = document.getElementById("boothContainer");
const refreshBtn = document.getElementById("refreshBtn");
const lastRefreshTime = document.getElementById("lastRefreshTime");
const availableCount = document.getElementById("availableCount");
const occupiedCount = document.getElementById("occupiedCount");
const maintenanceCount = document.getElementById("maintenanceCount");

// Statistics counters
let stats = {
    available: 0,
    occupied: 0,
    maintenance: 0
};

// Format timestamp
function formatTimestamp(timestamp) {
    if (timestamp === "-") return "Offline";
    
    const date = new Date(timestamp);
    return `Last updated: ${date.toLocaleTimeString()}`;
}

// Update refresh time display
function updateRefreshTime() {
    const now = new Date();
    lastRefreshTime.textContent = now.toLocaleTimeString();
}

// Update statistics display
function updateStatsDisplay() {
    availableCount.textContent = stats.available;
    occupiedCount.textContent = stats.occupied;
    maintenanceCount.textContent = stats.maintenance;
}

// Reset statistics counters
function resetStats() {
    stats = {
        available: 0,
        occupied: 0,
        maintenance: 0
    };
}

async function loadBoothData() {
    try {
        // Show loading state
        boothContainer.innerHTML = '<div class="loading-spinner"><i class="fas fa-spinner fa-spin"></i> Loading...</div>';
        refreshBtn.disabled = true;
        refreshBtn.innerHTML = '<i class="fas fa-spinner fa-spin"></i> Refreshing';

        const res = await fetch(sheetURL);
        const data = await res.json();

        // Clear container and reset stats
        boothContainer.innerHTML = "";
        resetStats();

        booths.forEach((booth, index) => {
            let boothData;

            if (index === 0 && data.length > 0) {
                boothData = {
                    name: booth,
                    status: data[0].status.toLowerCase(),
                    timestamp: data[0].timestamp
                };
            } else {
                boothData = {
                    name: booth,
                    status: "maintenance",
                    timestamp: "-"
                };
            }

            // Update statistics
            if (boothData.status === "empty") stats.available++;
            else if (boothData.status === "occupied") stats.occupied++;
            else stats.maintenance++;

            const card = document.createElement("div");
            card.className = "booth-card";

            let statusClass, statusText, statusIcon;
            switch (boothData.status) {
                case "empty":
                    statusClass = "status-available";
                    statusText = "Available";
                    statusIcon = "fa-check-circle";
                    break;
                case "occupied":
                    statusClass = "status-occupied";
                    statusText = "Occupied";
                    statusIcon = "fa-user-clock";
                    break;
                default:
                    statusClass = "status-maintenance";
                    statusText = "Maintenance";
                    statusIcon = "fa-tools";
            }

            card.innerHTML = `
                <div class="booth-name">${boothData.name}</div>
                <div class="booth-status ${statusClass}">
                    <i class="fas ${statusIcon}"></i> ${statusText}
                </div>
                <div class="last-updated">${formatTimestamp(boothData.timestamp)}</div>
                <div class="booth-actions">
                    <button class="btn report-btn" data-booth="${boothData.name}">
                        <i class="fas fa-flag"></i> Report Issue
                    </button>
                </div>
            `;

            boothContainer.appendChild(card);
        });

        updateStatsDisplay();
        updateRefreshTime();
    } catch (err) {
        console.error("Failed to load data:", err);
        boothContainer.innerHTML = `
            <div class="error-message">
                <i class="fas fa-exclamation-triangle"></i>
                <p>Error loading booth data. Please try again later.</p>
                <button class="btn retry-btn" onclick="loadBoothData()">
                    <i class="fas fa-redo"></i> Retry
                </button>
            </div>
        `;
    } finally {
        refreshBtn.disabled = false;
        refreshBtn.innerHTML = '<i class="fas fa-sync-alt"></i> Refresh';
    }
}

// Event delegation for report buttons
document.addEventListener('click', function(e) {
    if (e.target.closest('.report-btn')) {
        const booth = e.target.closest('.report-btn').dataset.booth;
        alert(`Issue reported for booth ${booth}. Our team will look into it shortly.`);
    }
});

// Load initially and every 10 seconds
loadBoothData();
setInterval(loadBoothData, 10000);

// Manual refresh button
refreshBtn.addEventListener("click", loadBoothData);

// Add keyboard shortcut for refresh (Ctrl/Cmd + R)
document.addEventListener('keydown', function(e) {
    if ((e.ctrlKey || e.metaKey) && e.key === 'r') {
        e.preventDefault();
        loadBoothData();
    }
});
