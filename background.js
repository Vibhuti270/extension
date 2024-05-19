let timeSpent = {};
let currentTabId = null;
let currentDomain = null;
let switchTime = Date.now();
let isPaused = false;

chrome.tabs.onActivated.addListener(activeInfo => {
    if (isPaused) {
        resumeTracking(activeInfo.tabId);
    } else {
        updateTimeSpent();
        currentTabId = activeInfo.tabId;
        chrome.tabs.get(currentTabId, tab => {
            if (tab.url) {
                currentDomain = extractDomain(tab.url);
            }
            switchTime = Date.now();
        });
    }
});

chrome.tabs.onUpdated.addListener((tabId, changeInfo, tab) => {
    if (tabId === currentTabId && changeInfo.url) {
        updateTimeSpent();
        if (tab.url) {
            currentDomain = extractDomain(tab.url);
        }
        switchTime = Date.now();
    }
});

chrome.tabs.onRemoved.addListener(tabId => {
    if (tabId === currentTabId) {
        updateTimeSpent();
        pauseTracking();
    }
});

chrome.windows.onFocusChanged.addListener(windowId => {
    updateTimeSpent();
    if (windowId === chrome.windows.WINDOW_ID_NONE) {
        pauseTracking();
    } else {
        chrome.tabs.query({ active: true, windowId: windowId }, tabs => {
            if (tabs.length > 0) {
                if (isPaused) {
                    resumeTracking(tabs[0].id);
                } else {
                    currentTabId = tabs[0].id;
                    if (tabs[0].url) {
                        currentDomain = extractDomain(tabs[0].url);
                    }
                    switchTime = Date.now();
                }
            }
        });
    }
});

function updateTimeSpent() {
    const now = Date.now();
    if (currentDomain !== null) {
        const timeOnCurrentDomain = now - switchTime;
        timeSpent[currentDomain] = (timeSpent[currentDomain] || 0) + timeOnCurrentDomain;
        sendTimeUpdate();
    }
    switchTime = now;
    saveTimeSpent();
}

function pauseTracking() {
    currentTabId = null;
    currentDomain = null;
    isPaused = true;
}

function resumeTracking(tabId) {
    currentTabId = tabId;
    chrome.tabs.get(currentTabId, tab => {
        if (tab.url) {
            currentDomain = extractDomain(tab.url);
        }
        switchTime = Date.now();
        isPaused = false;
    });
}

function saveTimeSpent() {
    chrome.storage.local.set({ timeSpent });
}

function extractDomain(url) {
    const urlObj = new URL(url);
    return urlObj.hostname;
}

function sendTimeUpdate() {
    chrome.runtime.sendMessage({ timeSpent });
}

// Log time spent every 5 seconds for debugging purposes
setInterval(() => {
    console.log('Time spent on each domain:', timeSpent);
}, 5000);



