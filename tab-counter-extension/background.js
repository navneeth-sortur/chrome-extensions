// Background script for Tab Counter extension

// Listen for tab creation
chrome.tabs.onCreated.addListener(function(tab) {
    // You could update badge text here if needed
    console.log('Tab created:', tab.url);
});

// Listen for tab removal
chrome.tabs.onRemoved.addListener(function(tabId, removeInfo) {
    console.log('Tab removed:', tabId);
});

// Listen for tab updates
chrome.tabs.onUpdated.addListener(function(tabId, changeInfo, tab) {
    console.log('Tab updated:', tab.url);
});

function updateBadge() {
    chrome.tabs.query({currentWindow: true}, function(tabs) {
        chrome.action.setBadgeText({
            text: tabs.length.toString()
        });
        chrome.action.setBadgeTextColor({ color: "#FFFFFF" });
        chrome.action.setBadgeBackgroundColor({
            color: '#6e8efb'
        });
    });
}

// Update badge when extension is first loaded
updateBadge();

// Update badge when tabs are created, removed, or updated
chrome.tabs.onCreated.addListener(updateBadge);
chrome.tabs.onRemoved.addListener(updateBadge);
chrome.tabs.onUpdated.addListener(updateBadge);