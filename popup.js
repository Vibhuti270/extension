document.addEventListener('DOMContentLoaded', () => {
    chrome.runtime.onMessage.addListener((request, sender, sendResponse) => {
        if (request.timeSpent) {
            updateTimeLog(request.timeSpent);
        }
    });

    // Initial load of time spent
    chrome.storage.local.get(['timeSpent'], result => {
        const timeSpent = result.timeSpent || {};
        updateTimeLog(timeSpent);
    });
});

function updateTimeLog(timeSpent) {
    const timeLogDiv = document.getElementById('time-log');
    timeLogDiv.innerHTML = '';

    for (const [domain, time] of Object.entries(timeSpent)) {
        const formattedTime = formatTime(time);
        const domainDiv = document.createElement('div');
        domainDiv.textContent = `${domain}: ${formattedTime}`;
        timeLogDiv.appendChild(domainDiv);
    }
}

function formatTime(milliseconds) {
    const totalSeconds = Math.floor(milliseconds / 1000);
    const hours = Math.floor(totalSeconds / 3600);
    const minutes = Math.floor((totalSeconds % 3600) / 60);
    const seconds = totalSeconds % 60;

    return `${hours}h ${minutes}m ${seconds}s`;
}

