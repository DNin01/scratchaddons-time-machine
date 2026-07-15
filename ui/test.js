import getDataForVersion from "/services/get-addons.js";

try {
  // Normally we wouldn't use global variables, but it is useful for debugging purposes
  window.addonsJsonFile = await (await fetch("/ScratchAddons/addons/addons.json")).json();
} catch {
  alert("To start the check, paste the ScratchAddons repository into the extension's root directory.");
  throw new Error("Aborting test: addons.json file not found");
}

try {
  window.selectedVersion = (await (await fetch("/ScratchAddons/manifest.json")).json()).version;
  console.log("ScratchAddons is on v" + selectedVersion);
} catch {
  window.selectedVersion = prompt("What's the Scratch Addons version?");
  if (selectedVersion?.length < 1) throw new Error("Version not specified");
  const dots = selectedVersion.split(".").length - 1;
  if (dots === 0) selectedVersion = `1.${selectedVersion}.0`;
  else if (dots === 1) selectedVersion = `${selectedVersion}.0`;
}

console.time("test");
window.getAddonsRes = await getDataForVersion(selectedVersion);
window.timeMachineAddonData = getAddonsRes.manifests;

if (Object.keys(timeMachineAddonData).length === 0) {
  alert("There is no addon data for v" + selectedVersion);
  throw new Error(`No data found (version ${selectedVersion})`);
}

for (const item of timeMachineAddonData) {
  delete item.manifest.l10n;
  delete item.manifest.popup?.icon;
  delete item.manifest.dynamicDisable;
  delete item.manifest.dynamicEnable;
  delete item.manifest.updateUserstylesOnSettingsChange;
  delete item.manifest.injectAsStyleElt;
  // Re-add settings at the end of the object
  // (when get-addons.js updates property names they move to the end)
  const settings = item.manifest.settings;
  delete item.manifest.settings;
  item.manifest.settings = settings;
}

// Filter to items that start with an alphanumeric character
window.addonIds = addonsJsonFile.filter((item) => /^\w/.test(item));
window.scratchAddonsAddonData = await Promise.all(addonIds.map(async (id) => {
  const res = await (await fetch(`/ScratchAddons/addons/${id}/addon.json`)).json();
  delete res.$schema;
  delete res.userscripts;
  delete res.userstyles;
  delete res.persistentScripts;
  delete res.popup?.icon;
  delete res.customCssVariables;
  delete res.dynamicDisable;
  delete res.dynamicEnable;
  delete res.updateUserstylesOnSettingsChange;
  delete res.injectAsStyleElt;
  delete res.l10n;
  // Re-add settings at the end of the object
  const settings = res.settings;
  delete res.settings;
  res.settings = settings;
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
    count[1]++;
    if (scratchAddonsAddonManifests[id]) {
      if (timeMachineAddonManifests[id]) {
        console.warn(`${id} is out of sync`, timeMachineAddonManifests[id], scratchAddonsAddonManifests[id]);
      } else {
        console.warn(`${id} is missing`);
      }
    } else {
      console.warn(`${id} should be removed`);
    }
  }
}

console.timeEnd("test");

if (count[0] === count[1]) {
  document.title += " (success)";
  alert(`All addons are up to date in v${selectedVersion} - nice work.`);
} else {
  document.title += ` (${count[0]}/${count[1]})`;
  alert(`${count[0]}/${count[1]} addons are up to date. Check the console for details.`);
}
