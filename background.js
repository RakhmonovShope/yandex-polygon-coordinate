chrome.webRequest.onCompleted.addListener(
  function(details) {
    console.log('background.js: Received details data: ======================>', details);
    if (details.statusCode === 200 && details.url.includes('yandex.uz/maps/api/search')) {
      // Instead of fetching, handle the data directly from details if possible

      console.log('background.js: Received JSON data: ======================>', details.url);
      chrome.tabs.sendMessage(details.tabId, {type: 'capturedJson', url: details.url});
    }
  },
  {urls: ["https://yandex.uz/maps/*", "https://yandex.ru/maps/*"]},
  ["responseHeaders"]
);
