chrome.contextMenus.removeAll(); // Just for good measure
chrome.contextMenus.create({
  id: "about",
  title: "Licenses",
  contexts: ["action"],
});
chrome.contextMenus.onClicked.addListener((onClickData) => {
  switch (onClickData.menuItemId) {
    case "about":
      chrome.tabs.create({ url: "ui/about.html" });
    break;
    default: console.error("Unrecognized menu item:", onClickData.menuItemId);
  }
});
