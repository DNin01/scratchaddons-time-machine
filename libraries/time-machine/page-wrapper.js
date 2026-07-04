import getMessages from "/pages/message-data.js";

// Since each SA page is in an unfamiliar extension, APIs are a little different for them.
// This module overrides some of them for compatibility.

// Older versions of Chrome don't support the browser namespace, but Firefox always did.
// Older versions of SA are aware of this difference (will think Chrome is Firefox);
// removing it if Firefox isn't detected allows pages to tell if they're on Chrome.
const isFirefox = typeof new Error().fileName === "undefined";
if (browser && isFirefox) browser = undefined;

// Return the version of the page, not of Time Machine.
// The version number can be found in the page's URL using this regex:
const pageVersion = String(location.pathname.match(/\d+.\d+.\d+/));
chrome.runtime.getVersion = () => pageVersion;
chrome.runtime.getManifest = () => ({ version: pageVersion, version_name: pageVersion });

// The Addons tab in the extension's popup is actually an iframe of the addon settings page.
// The page can tell if it is in an iframe by checking for the presence of a parent frame.
// Unfortunately, this includes Time Machine itself.
// We can avoid being detected by making SA think it's one level higher than in reality:
if (window.parent === window.top) {
  window.parent = window;
}

// Open the settings page inside the Time Machine container.
chrome.runtime.openOptionsPage = () => chrome.tabs.create({ url: "ui/settings-pages.html" });

// Pages shouldn't reload the whole extension.
chrome.runtime.reload = () => location.reload();

// Always assume "permissions" will be granted.
// They aren't actually necessary because the addons aren't functional in Time Machine.
chrome.permissions.request = (options, callback) => callback(true);

const messages = getMessages(pageVersion);
chrome.i18n.getMessage = (id, ...args) => {
  const message = messages[id];
  return message.replace("$1", args[0]);
}
