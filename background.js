chrome.contextMenus.removeAll(); // Just for good measure
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
  title: "Test addon data",
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
    default: console.error("Unrecognized menu item:", onClickData.menuItemId);
  }
});
