// Since each SA page is in an unfamiliar extension, chrome.* APIs are a little different for them.
// This module overrides some of them for compatibility.

// Older versions of Chrome don't support the browser API.
// Delete it if Firefox isn't detected so that pages can tell if it's Chrome.
if (browser && typeof new Error().fileName === "undefined") delete browser;

const pageVersion = location.pathname.match(/\d+.\d+.\d+/);
// Return the version of the webpage, not of Time Machine
chrome.runtime.getVersion = () => pageVersion;
chrome.runtime.getManifest = () => ({ version: pageVersion, version_name: pageVersion });

// We don't want one of the pages to reload the whole extension.
chrome.runtime.reload = () => location.reload();

// Always assume "permissions" will be granted.
// They aren't actually necessary since the addons aren't functional in Time Machine.
chrome.permissions.request = (options, callback) => callback(true);
