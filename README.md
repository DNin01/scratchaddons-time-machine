<div align="center">
  <img alt="The application's icon, an orange cardboard box labeled with the letter S" src="images/time-machine/icon.svg" width="128">

  # Scratch Addons Time Machine

  Relive old Scratch Addons.
</div>

![An image showing the settings page on version 1.3.1 in Scratch Addons Time Machine](images/screenshots/settings.jpeg)
<i align="center">An image showing the settings page on version 1.3.1 in Scratch Addons Time Machine</i>

## About

Scratch Addons Time Machine is a ported collection of UI from past major versions of the [Scratch Addons browser extension](https://github.com/ScratchAddons/ScratchAddons). Using Time Machine, you can interact with nostalgic emulations of the popups and settings pages.

The plugins, called "addons", offered by Scratch Addons, are not functional in Time Machine, but you can still browse them.

Time Machine includes the following versions of Scratch Addons:
- 1.0.0
- 1.1.1
- 1.2.1
- 1.3.1
- 1.4.0
- 1.5.1

## Usage

Scratch Addons Time Machine is a browser extension and is currently only available in source code form. Once downloaded, you can install it using developer mode in your browser's Extensions menu.

## Motivation

Scratch Addons versions prior to 1.38.0 ran on Manifest V2, which lost support from major browsers in 2025. By bringing parts of these versions to a new [Manifest V3](https://developer.chrome.com/docs/extensions/develop/migrate/what-is-mv3) extension, Time Machine archives the classic UI, which got Scratch Addons to where it was today, for new audiences.

## For developers

### Technical overview

Scratch Addons Time Machine's source code contains addon data and settings page files organized by version number.

When the user selects a version using the settings page or popup containers, the first thing that happens is the version's corresponding addon files are retrieved using a version control system. The database is stored in [`/addons`](/addons) alongside a [`changes.json`](/addons/changes.json) file. Events from the change list are processed up to the selected version, and the entries are used to load the latest revision of each addon manifest that still exists.

Next, an embed of the corresponding webpage is loaded. It receives the data resulting from the process described above so it can display the addons from the same version.

Here's where some of these processes are located:
- [`/ui/settings-pages.html`](/ui/settings-pages.html) — Loads the embeds of settings pages
- [`/ui/popup-pages.html`](/ui/popup-pages.html) — Loads the embeds of popup pages
- [`/ui/services/get-addons.js`](/ui/services/get-addons.js) — Finds the appropriate versions of each addon, and processes the data for use by the webpage embed
- [`/libraries/time-machine/page-wrapper.js`](/libraries/time-machine/page-wrapper) — Compatibility layers that help the webpage embed work properly in a foreign browser extension

### Adding versions

The general steps to add a version of Scratch Addons' webpages and addon collection to Time Machine using [Git](https://git-scm.com) and a code editor are as follows:

#### 0. Ensure that the latest version added to Time Machine has a complete list of changes.

In other words, you should complete all these steps before repeating the process to add another version, as they build on previous ones in a way that is difficult to change later.

#### 1. Note which [release version](https://github.com/ScratchAddons/ScratchAddons/releases) of Scratch Addons you want to add, and check out its tag.

Open a clone of Scratch Addons in your terminal, then use this command:
```shell
git checkout <tag_name>
```

#### 2. Collect the cumulative changes between your chosen version and the previous version that is listed in Time Machine.

One way to see what has changed is to use this command in Scratch Addons after checkout:
```shell
git diff --name-status <previous_tag_name> HEAD
```

#### 3. Append a change list to `/addons/changes.json`. Include any addon manifests that were added, updated, or removed, based on the list from step 2.

You can ignore changes to `userscripts`, `userstyles`, `customCssVariables`, `persistentScripts`, `dynamicEnable`, `dynamicDisable`, and similar properties that don't have an effect on the content in the settings page.

The entry should look like this:
```json
{
  "version": "<version_number>",
  "added": { ... },
  "modified": { ... },
  "removed": { ... }
}
```

#### 4. Import any addon manifests that were added or modified from Scratch Addons into a new directory in Time Machine: `/addons/<version_number>`.

Copy each addon manifest to `/addons/<version_number>/<addon_id>.json`.

(This path is different than in Scratch Addons, where manifests are stored in `/addons/<addon_id>/addon.json`.)

#### 5. Import the popup window, popup tabs, and settings page from your chosen version of Scratch Addons into a new directory in Time Machine: `/pages/<version_number>`.

The Scratch Addons popup and settings pages are found in its `/webpages` directory, and the popup tabs are found in `/popups`. In Time Machine, however, they all go in the same directory.

You can use Time Machine's `/images` and `/libraries` directories to store images and code shared by multiple page versions. Don't forget to update URLs so they point to the appropriate resource locations in Time Machine. (Tip: Use a find-and-replace tool!)

#### 6. Add the new version to the menu in both `/ui/settings-pages.html` and `/ui/popup-pages.html`.

Just add an `<option>` element to each drop-down menu. Newer versions go at the top.

#### 7. Use Time Machine to make sure everything is working.

Remember to save your changes, and check the new settings and popup pages in the extension by selecting the version from the menu.

## Licenses

Scratch Addons Time Machine is available under [GNU General Public License v3](LICENSE) terms. Licenses for included software libraries can be found in the [`/licenses` directory](/licenses).
