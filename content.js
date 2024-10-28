// Function to parse JSON response and extract polygon data
function extractPolygonData(response) {
  try {
    const data = JSON.parse(response);
    const items = data.data.items;
    let polygonData = null;

    for (const item of items) {
      if (item.displayGeometry && item.displayGeometry.type === 'GeometryCollection') {
        const geometries = item.displayGeometry.geometries;
        for (const geometry of geometries) {
          if (geometry.type === 'Polygon') {
            polygonData = geometry.coordinates;
            break;
          }
        }
      }
      if (polygonData) break; // Stop searching once we find polygon data
    }

    return polygonData;
  } catch (error) {
    console.error('Failed to parse polygon data:', error);
    return null;
  }
}

function downloadJSON(data, filename = 'polygon_data.json') {
  const blob = new Blob([JSON.stringify(data, null, 2)], {type : 'application/json'});
  const url = window.URL.createObjectURL(blob);

  const a = document.createElement('a');
  a.href = url;
  a.download = filename;
  document.body.appendChild(a);
  a.click();

  // Cleanup
  setTimeout(() => {
    window.URL.revokeObjectURL(url);
    document.body.removeChild(a);
  }, 100);
}


let hasFetchedData = false

// Add a listener for messages from the background script
chrome.runtime.onMessage.addListener(function(message, sender, sendResponse) {

  if(!hasFetchedData && message.type === 'capturedJson') {
    hasFetchedData = true

    fetch(message.url)
      .then(response => {
        if (!response.ok) {
          throw new Error('Network response was not ok');
        }
        return response.json();
      })
      .then(data => {
        sendResponse({data: data}); // Send data back to the background or popup

        const polygonCoordinates = extractPolygonData(JSON.stringify(data));

        if (polygonCoordinates) {
          console.log('Extracted Polygon Coordinates:', polygonCoordinates);
          downloadJSON(polygonCoordinates, `${data?.data?.items[0]?.address}.json`);
        } else {
          console.log('No polygon data found.');
        }

      })
      .catch(error => {
        console.error('Fetch error:', error);
        sendResponse({error: error.message}); // Send error back
      });


  }
});



