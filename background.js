import getDataForVersion from "./services/get-addons.js";

const swConsoleLabel = ["%cService worker", "padding-inline: 4px; font-weight: bold; border: 1px solid currentColor; border-radius: 8px"];
const messageConsoleLabel = ["%cMessage", "padding-inline: 4px; font-weight: bold; border: 1px solid currentColor; border-radius: 8px"];

console.log(...swConsoleLabel, "Starting");

/* -- Set up extension context menu -- */
chrome.contextMenus.removeAll();
chrome.contextMenus.create({
  id: "popup",
  title: "Popup",
  contexts: ["action"],
});
chrome.contextMenus.create({
  id: "settings",
  title: "Settings Page",
  contexts: ["action"],
});
chrome.contextMenus.create({
  id: "about",
  title: "Licenses",
  contexts: ["action"],
});
chrome.contextMenus.create({
  id: "debug",
  title: "Debug",
  contexts: ["action"],
});
chrome.contextMenus.create({
  id: "test",
  title: "Check addon data",
  parentId: "debug",
  contexts: ["action"],
});
chrome.contextMenus.onClicked.addListener((onClickData) => {
  switch (onClickData.menuItemId) {
    case "popup":
      chrome.action.openPopup();
    break;
    case "settings":
      chrome.tabs.create({ url: "ui/settings-pages.html" });
    break;
    case "about":
      chrome.tabs.create({ url: "ui/about.html" });
    break;
    case "test":
      chrome.tabs.create({ url: "ui/test.html" });
    break;
    default: console.error(...swConsoleLabel, "Unrecognized menu item:", onClickData.menuItemId);
  }
});

/* -- Provide addon data to other scripts -- */
let addonDataPromise; // Cache for addon data that was loaded recently
let lastVersion = "";
chrome.runtime.onMessage.addListener((request, sender, sendResponse) => {
  if (request === "checkPermissions") {
    return; // Ignore, no action needed
  }
  const sendingPage = new URL(sender.url).pathname;
  console.log(...messageConsoleLabel, `Request from ${sendingPage}:`, request);
  // Regex to get the version number of a SA page:
  const pageVersion = String(sendingPage.match(/\d+.\d+.\d+/));
  if (request === "getSettingsInfo") {
    // Load data if it isn't already in the cache
    if (pageVersion !== lastVersion) {
      lastVersion = pageVersion;
      addonDataPromise = getDataForVersion(pageVersion);
    }
    (async () => {
      sendResponse(await addonDataPromise);
    })();
    // Message handlers that respond asynchronously must...
    return true;
  } else if (request.scratchMessaging === "getData") {
    sendResponse({ error: "loggedOut" });
  } else {
    console.error("Request not recognized:", request);
  }
});
