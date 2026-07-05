import getDataForVersion from "./services/get-addons.js";

const selectElem = document.querySelector("select");
const iframeElem = document.querySelector("iframe");

let selectedVersion = localStorage.getItem("v") ?? selectElem.firstElementChild.value;
selectElem.value = selectedVersion;
let addonData;

async function loadPopupPage() {
  const minor = selectedVersion.split(".")[1];
  if (minor >= 7) {
    // v1.7.0 and later requires addon setting data
    console.log(`Preparing popup v${selectedVersion}...`);
    addonData = await getDataForVersion(selectedVersion);
  }

  console.log(`Loading popup v${selectedVersion}...`);
  iframeElem.contentWindow.location = `/pages/${selectedVersion}/popup/index.html`;

  return true;
}

selectElem.addEventListener("change", async (e) => {
  console.clear();
  selectedVersion = e.target.value;
  localStorage.setItem("v", selectedVersion);

  selectElem.disabled = true;
  await loadPopupPage();
  setTimeout(() => selectElem.disabled = false, 500);
});

chrome.runtime.onMessage.addListener((request, sender, sendResponse) => {
  if (request === "getSettingsInfo") {
    sendResponse(addonData);
  } else if (request.scratchMessaging === "getData") {
    sendResponse({ error: "loggedOut" });
  } else {
    console.error(new URL(sender.url).pathname + " sent an unrecognized request:", request);
  }
});

await loadPopupPage();
selectElem.disabled = false;
