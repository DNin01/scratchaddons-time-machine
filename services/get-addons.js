const consoleLabel = ["%cAddonmulator", "padding-inline: 4px; font-weight: bold; border: 1px solid currentColor; border-radius: 8px"];

// First of all, get the change list
const changesFile = fetch("/addons/changes.json").then((res) => res.json());

async function getAddonsForVersion(version) {
  const startTime = performance.now();

  // Filter to only changes since the requested version
  const currentVersionIndex = (await changesFile).findIndex((list) => list.version === version);
  const pastChanges = (await changesFile).slice(0, currentVersionIndex + 1);

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
  console.log(...consoleLabel, `Loading ${addonIds.length} addons from up to v${version}`, addonVersions);
  let failedCount = 0;
  const paths = addonIds.map((id) => `/addons/${addonVersions[id]}/${id}.json`);
  const fetches = paths.map((path) => fetch(path)
    .then((res) => res.json())
    .catch((err) => {
      console.error(...consoleLabel, `Error while accessing ${path}:`, err);
      failedCount++;
      return;
    })
  );
  const results = await Promise.all(fetches);
  if (failedCount) console.warn(...consoleLabel, `${failedCount} addons not loaded`);

  let upgradeCount = 0;
  for (const item of results.filter((item) => typeof item === "object")) {
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
  }
  if (upgradeCount) console.log(...consoleLabel, upgradeCount + " manifest properties upgraded");

  // Wrap each manifest in an object that the webpages can use
  const manifestsObj = results.map((item, index) => ({
    addonId: addonIds[index],
    manifest: item,
  }));
  // Exclude items that failed to load
  const validManifestsObj = manifestsObj.filter(({ manifest }) => typeof manifest === "object");

  const responseTime = Math.floor(performance.now() - startTime);
  console.log(...consoleLabel, `Completed in ${responseTime} ms`, validManifestsObj);
  return validManifestsObj;
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
