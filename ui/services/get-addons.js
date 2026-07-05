// First of all, get the change list
const changesFile = await (await fetch("/addons/changes.json")).json();

async function getAddonsForVersion(version) {
  // Filter to only changes since the requested version
  const currentVersionIndex = changesFile.findIndex((list) => list.version === version);
  const pastChanges = changesFile.slice(0, currentVersionIndex + 1);

  // Accumulate changes to addons, selecting the most recent iteration of each
  const addonVersions = {};
  const removedAddons = [];
  for (const list of pastChanges) {
    for (const entry of list.removed ?? []) {
      delete addonVersions[entry];
    }
    for (const entry of [list.added ?? [], list.modified ?? []].flat()) {
      addonVersions[entry] = list.version;
    }
  };
  const addonIds = Object.keys(addonVersions);
  console.log(`Loading ${addonIds.length} addons`, addonVersions);
  const paths = addonIds.map((id) => `/addons/${addonVersions[id]}/${id}.json`);
  const fetches = paths.map((path) => fetch(path).then((res) => res.json()));
  const results = await Promise.all(fetches);

  let upgradeCount = 0;
  for (const item of results) {
    // Some property names have changed between versions, update them if necessary
    if (version === "1.0.0" || version === "1.1.1") continue;
    if (item.options) {
      item.settings = item.options;
      delete item.options;
      upgradeCount++;
    }
    if (typeof item.enabled_by_default === "boolean") {
      item.enabledByDefault = item.enabled_by_default;
      delete item.enabled_by_default;
      upgradeCount++;
    }
  };
  if (upgradeCount) console.log(upgradeCount + " manifest properties upgraded");

  // Wrap all manifests in an object that the webpages can use
  const manifestsObj = results.map((item, index) => ({
    addonId: addonIds[index],
    manifest: item,
  }));

  console.log(manifestsObj.length + " addon manifests stored", manifestsObj);
  return manifestsObj;
}

function getDefaultValues(manifestsObj) {
  let addonsEnabled = {};
  let addonSettings = {};
  for (const { addonId, manifest } of manifestsObj) {
    addonsEnabled[addonId] = manifest.enabledByDefault ?? manifest.enabled_by_default ?? false;
    const settings = manifest.settings ?? manifest.options;
    if (settings) {
      addonSettings[addonId] = {};
      for (const setting of settings) {
        addonSettings[addonId][setting.id] = setting.default;
      }
    }
  }
  return { addonsEnabled, addonSettings };
}

export default async function getDataForVersion(version) {
  const manifests = await getAddonsForVersion(version);
  const { addonsEnabled, addonSettings } = getDefaultValues(manifests);

  return { manifests, addonsEnabled, addonSettings };
}
