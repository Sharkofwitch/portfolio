// Log and check for 404 errors in static assets
// Run this script in the browser console when testing the website

console.log("Monitoring for 404 errors in static assets...");

// Create a MutationObserver to watch for dynamically added scripts and stylesheets
const observer = new MutationObserver((mutations) => {
  for (const mutation of mutations) {
    if (mutation.type === "childList") {
      for (const node of mutation.addedNodes) {
        if (node.nodeName === "LINK" && node.rel === "stylesheet") {
          checkResource(node.href, "CSS");
        } else if (node.nodeName === "SCRIPT" && node.src) {
          checkResource(node.src, "JavaScript");
        }
      }
    }
  }
});

// Function to check if a resource exists
function checkResource(url, type) {
  fetch(url, { method: "HEAD" })
    .then((response) => {
      if (!response.ok) {
        console.error(`404 Error: ${type} file not found at ${url}`);
      } else {
        console.log(`✅ ${type} file loaded successfully: ${url}`);
      }
    })
    .catch((error) => {
      console.error(`Error loading ${type} file at ${url}:`, error);
    });
}

// Check all existing stylesheets and scripts
document.querySelectorAll('link[rel="stylesheet"]').forEach((link) => {
  checkResource(link.href, "CSS");
});

document.querySelectorAll("script[src]").forEach((script) => {
  checkResource(script.src, "JavaScript");
});

// Start observing the document for added scripts and stylesheets
observer.observe(document, { childList: true, subtree: true });

console.log(
  "Asset monitoring setup complete. Check console for any 404 errors.",
);
