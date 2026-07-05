import getDataForVersion from "./services/get-addons.js";

try {
  window.addonsJsonFile = await (await fetch("/ScratchAddons/addons/addons.json")).json();
} catch {
  alert("To start the test, paste in a Scratch Addons directory.");
  throw new Error("Aborting test: addons.json file not found");
}

// Normally we wouldn't use global variables, but it is useful for debugging purposes
window.selectedVersion = prompt("What's the Scratch Addons version?");
if (selectedVersion?.length < 1) throw new Error("Version not specified");
const dots = selectedVersion.split(".").length - 1;
if (dots === 0) selectedVersion = `1.${selectedVersion}.0`;
else if (dots === 1) selectedVersion = `${selectedVersion}.0`;

console.time("test");
window.getAddonsRes = await getDataForVersion(selectedVersion);
window.timeMachineAddonData = getAddonsRes.manifests;

if (Object.keys(timeMachineAddonData).length === 0) {
  alert("There is no addon data for v" + selectedVersion);
  throw new Error(`No data found (version ${selectedVersion})`);
}

for (const item of timeMachineAddonData) {
  delete item.manifest.l10n;
}

// Filter to items that start with an alphanumeric character
window.addonIds = addonsJsonFile.filter((item) => /^\w/.test(item));
window.scratchAddonsAddonData = await Promise.all(addonIds.map(async (id) => {
  const res = await (await fetch(`/ScratchAddons/addons/${id}/addon.json`)).json();
  delete res.$schema;
  delete res.userscripts;
  delete res.userstyles;
  delete res.persistentScripts;
  delete res.customCssVariables;
  delete res.l10n;
  return [id, res];
}));

window.timeMachineAddonManifests = Object.assign(
  {}, ...timeMachineAddonData.map((obj) => ({ [obj.addonId]: obj.manifest }))
);
window.scratchAddonsAddonManifests = Object.assign(
  {}, ...scratchAddonsAddonData.map((obj) => ({ [obj[0]]: obj[1] }))
);

const count = [0, 0];
window.allAddonIds = new Set([...timeMachineAddonData.map((obj) => obj.addonId), ...window.addonIds]);
for (const id of allAddonIds) {
  if (JSON.stringify(timeMachineAddonManifests[id]) === JSON.stringify(scratchAddonsAddonManifests[id])) {
    console.log(`✅ ${id} is in sync`);
    count[0]++;
    count[1]++;
  } else {
    console.warn(`${id} is out of sync`, timeMachineAddonManifests[id], scratchAddonsAddonManifests[id]);
    count[1]++;
  }
}

console.timeEnd("test");

if (count[0] === count[1]) {
  alert("All addons are up to date - nice work.");
} else {
  alert(`${count[0]}/${count[1]} addons are up to date. Check the console for details.`);
}
