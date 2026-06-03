import getDataForVersion from "./services/get-addons.js";

const selectElem = document.querySelector("select");
const iframeElem = document.querySelector("iframe");

let selectedVersion = localStorage.getItem("v") ?? selectElem.lastElementChild.value;
selectElem.value = selectedVersion;
let addonData;

async function loadSettingsPage() {
  console.log(`Preparing settings page v${selectedVersion}...`);
  addonData = await getDataForVersion(selectedVersion);

  console.log(`Loading settings page v${selectedVersion}...`);
  iframeElem.contentWindow.location = `/pages/${selectedVersion}/settings/index.html`;

  // Replace 'v*.*.*' (inside the parentheses) in the document title
  document.title = document.title.replace(/(?<=\().*(?=\))/, selectedVersion);

  return true;
}

selectElem.addEventListener("change", async (e) => {
  console.clear();
  selectedVersion = e.target.value;
  localStorage.setItem("v", selectedVersion);

  selectElem.disabled = true;
  await loadSettingsPage();
  setTimeout(() => selectElem.disabled = false, 500);
});

chrome.runtime.onMessage.addListener((request, sender, sendResponse) => {
  switch (request) {
    case "getSettingsInfo":
      sendResponse(addonData);
    break;
    default: console.error(new URL(sender.tab.url).pathname + " sent an unrecognized request:", request);
  }
});

await loadSettingsPage();
selectElem.disabled = false;
