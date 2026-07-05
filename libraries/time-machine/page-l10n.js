// TODO
// Since SA's addon locales are not included at this time,
// the least Time Machine can do is prevent errors.

// import { escapeHTML } from "../scratch-addons/autoescaper.js"

export default class WebsiteLocalizationProvider {
  loadMessages() {
    return true;
  }
  loadByAddonId() {
    return true;
  }
  get(key) {
    return key;
  }
  escaped(key) {
    // Keys do not require sanitization
    return key;
  }
}
