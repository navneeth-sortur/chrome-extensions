document.addEventListener('DOMContentLoaded', function() {
    const tabsList = document.getElementById('tabs-list');
    const tabCount = document.getElementById('tab-count');
    const uniqueCount = document.getElementById('unique-count');
    const refreshBtn = document.getElementById('refresh-btn');
    const exportBtn = document.getElementById('export-btn');
    
    // Function to update the tab list
    function updateTabList() {
        // Query all tabs in the current window
        chrome.tabs.query({currentWindow: true}, function(tabs) {
            // Update counts
            tabCount.textContent = tabs.length;
            
            // Calculate unique domains
            const domains = new Set();
            tabs.forEach(tab => {
                try {
                    const domain = new URL(tab.url).hostname;
                    domains.add(domain);
                } catch (e) {
                    // Skip invalid URLs
                }
            });
            uniqueCount.textContent = domains.size;
            
            // Clear the list
            tabsList.innerHTML = '';
            
            // Add tabs to the list
            if (tabs.length === 0) {
                tabsList.innerHTML = '<div class="empty-state">No tabs open in this window</div>';
            } else {
                tabs.forEach(tab => {
                    const tabElement = document.createElement('div');
                    tabElement.className = 'tab-item';
                    
                    // Use favicon if available, otherwise use a placeholder
                    let faviconHtml = '🌐';
                    if (tab.favIconUrl) {
                        faviconHtml = `<img src="${tab.favIconUrl}" class="favicon" alt="Favicon">`;
                    }
                    
                    tabElement.innerHTML = `
                        <div class="favicon">${faviconHtml}</div>
                        <div class="tab-info">
                            <div class="tab-title">${tab.title || 'Untitled'}</div>
                            <div class="tab-url">${tab.url || 'No URL'}</div>
                        </div>
                    `;
                    tabsList.appendChild(tabElement);
                });
            }
        });
    }
    
    // Initial update
    updateTabList();
    
    // Refresh button event
    refreshBtn.addEventListener('click', updateTabList);
    
    // Export button event
    exportBtn.addEventListener('click', function () {
    chrome.tabs.query({ currentWindow: true }, function (tabs) {
        const urls = tabs.map(tab => tab.url).join('\n');
        const blob = new Blob([urls], { type: 'text/plain' });
        const objectUrl = URL.createObjectURL(blob);

        chrome.downloads.download({
            url: objectUrl,
            filename: 'tab-urls.txt',
            saveAs: true
        }, function(downloadId) {
            // Optional: revoke the blob URL after a short delay to allow the download to start
            setTimeout(() => URL.revokeObjectURL(objectUrl), 1000);
        });
    });
});
});