const sheetURL = "https://script.google.com/macros/s/AKfycby4yNUo1_x9VJRKitMLz9oCI5_VAgFG8H324o2y4YuSQ82IVHkmXY-E1FETZyAht-dZGQ/exec";

const booths = ["A1", "A2", "A3", "A4", "A5", "A6"];

async function loadBoothData() {
    try {
        const res = await fetch(sheetURL);
        const data = await res.json();

        const container = document.getElementById("boothContainer");
        container.innerHTML = "";

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

            const card = document.createElement("div");
            card.className = "booth-card";

            let statusClass, statusText;
            switch (boothData.status) {
                case "empty":
                    statusClass = "status-available";
                    statusText = "Available";
                    break;
                case "occupied":
                    statusClass = "status-occupied";
                    statusText = "Occupied";
                    break;
                default:
                    statusClass = "status-maintenance";
                    statusText = "In Maintenance";
            }

            card.innerHTML = `
                <div class="booth-name">${boothData.name}</div>
                <div class="${statusClass}">${statusText}</div>
                <div class="last-updated">${boothData.timestamp !== "-" ? "Last updated: " + boothData.timestamp : "Offline"}</div>
            `;

            container.appendChild(card);
        });
    } catch (err) {
        console.error("Failed to load data:", err);
        document.getElementById("boothContainer").innerHTML = "<p style='color:red;'>Error loading data.</p>";
    }
}

// Load initially and every 10 seconds
loadBoothData();
setInterval(loadBoothData, 10000);

// Manual refresh button
document.getElementById("refreshBtn").addEventListener("click", loadBoothData);
