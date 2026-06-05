const selectElem = document.querySelector("select");
const iframeElem = document.querySelector("iframe");

let selectedVersion = localStorage.getItem("v") ?? selectElem.firstElementChild.value;
selectElem.value = selectedVersion;
let addonData;

async function loadPopupPage() {
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
  switch (request) {
    default: console.error(new URL(sender.url).pathname + " sent an unrecognized request:", request);
  }
});

await loadPopupPage();
selectElem.disabled = false;
