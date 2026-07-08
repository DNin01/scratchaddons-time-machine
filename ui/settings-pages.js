const selectElem = document.querySelector("select");
const iframeElem = document.querySelector("iframe");

let selectedVersion = localStorage.getItem("v") ?? selectElem.firstElementChild.value;
selectElem.value = selectedVersion;

function loadSettingsPage() {
  console.log(`Loading settings page v${selectedVersion}...`);
  iframeElem.contentWindow.location = `/pages/${selectedVersion}/settings/index.html${location.hash}`;

  // Replace 'v*.*.*' (inside the parentheses) in the document title
  document.title = document.title.replace(/(?<=\().*(?=\))/, selectedVersion);
}

selectElem.addEventListener("change", async (e) => {
  console.clear();
  selectedVersion = e.target.value;
  localStorage.setItem("v", selectedVersion);

  selectElem.disabled = true;
  loadSettingsPage();
  setTimeout(() => selectElem.disabled = false, 500);
});

loadSettingsPage();
selectElem.disabled = false;
