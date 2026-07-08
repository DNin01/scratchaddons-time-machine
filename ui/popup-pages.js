const selectElem = document.querySelector("select");
const iframeElem = document.querySelector("iframe");

let selectedVersion = localStorage.getItem("v") ?? selectElem.firstElementChild.value;
selectElem.value = selectedVersion;

function loadPopupPage() {
  console.log(`Loading popup v${selectedVersion}...`);
  iframeElem.contentWindow.location = `/pages/${selectedVersion}/popup/index.html`;
}

selectElem.addEventListener("change", async (e) => {
  console.clear();
  selectedVersion = e.target.value;
  localStorage.setItem("v", selectedVersion);

  selectElem.disabled = true;
  loadPopupPage();
  setTimeout(() => selectElem.disabled = false, 500);
});

loadPopupPage();
selectElem.disabled = false;
