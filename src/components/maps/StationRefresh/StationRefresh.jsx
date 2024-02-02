import L, { Control } from "leaflet";
import { createControlComponent } from "@react-leaflet/core";

/*
 * @class StationRefresh
 * @inherits Control
 * This control was part of a mini project to add a refresh button to the map to reload station data. It is based off of the zoom control in leaflet.
 * The control additionally uses react-leaflets createControlComponent to create a react component that can be used in the context of react-leaflet by wrapping the leaflet control.
 */

const repeatIcon =
  '<svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" fill="currentColor" class="bi bi-arrow-repeat" viewBox="0 0 16 16">' +
  ' <path d="M11.534 7h3.932a.25.25 0 0 1 .192.41l-1.966 2.36a.25.25 0 0 1-.384 0l-1.966-2.36a.25.25 0 0 1 .192-.41m-11 2h3.932a.25.25 0 0 0 .192-.41L2.692 6.23a.25.25 0 0 0-.384 0L.342 8.59A.25.25 0 0 0 .534 9"/>' +
  ' <path fill-rule="evenodd" d="M8 3c-1.552 0-2.94.707-3.857 1.818a.5.5 0 1 1-.771-.636A6.002 6.002 0 0 1 13.917 7H12.9A5 5 0 0 0 8 3M3.1 9a5.002 5.002 0 0 0 8.757 2.182.5.5 0 1 1 .771.636A6.002 6.002 0 0 1 2.083 9z"/>' +
  " </svg>";

export const LStationRefresh = Control.extend({
  // @section
  // @aka StationRefresh options
  options: {
    // @option position: String = 'topleft'
    // The position of the control (one of the map corners). Possible values are `'topleft'`,
    // `'topright'`, `'bottomleft'` or `'bottomright'`
    position: "topleft",

    // @option refreshText: String = '<span aria-hidden="true"><FontAwesomeIcon icon="fa-brands fa-bootstrap" /></span>'
    // The text set on the 'zoom in' button.
    refreshText: `<span aria-hidden="true">${repeatIcon}</span>`,

    // @option refreshTitle: String = 'Zoom in'
    // The title set on the 'zoom in' button.
    refreshTitle: "Refresh Station Data",

    onReloadStations: () => {
      console.log("onReloadStations not set");
    },
  },

  onAdd() {
    const refreshName = "leaflet-control-refresh-stations",
      container = L.DomUtil.create("div", `${refreshName} leaflet-bar`),
      options = this.options;

    this._refreshButton = this._createButton(
      options.refreshText,
      options.refreshTitle,
      `${refreshName}-in`,
      container,
      this._refreshStations,
    );

    return container;
  },

  onRemove() {
    // Nothing to do here as we don't listen to anything
  },

  disable() {
    this._disabled = true;
    this._updateDisabled();
    return this;
  },

  enable() {
    this._disabled = false;
    this._updateDisabled();
    return this;
  },

  _createButton(html, title, className, container, fn) {
    const link = L.DomUtil.create("a", className, container);
    link.innerHTML = html;
    link.href = "#";
    link.title = title;

    /*
     * Will force screen readers like VoiceOver to read this as "Refresh Stations - button"
     */
    link.setAttribute("role", "button");
    link.setAttribute("aria-label", title);

    L.DomEvent.disableClickPropagation(link);
    L.DomEvent.on(link, "click", L.DomEvent.stop);
    L.DomEvent.on(link, "click", fn, this);
    L.DomEvent.on(link, "click", this._refocusOnMap, this);

    return link;
  },

  _updateDisabled() {
    const map = this._map,
      className = "leaflet-disabled";

    this._refreshButton.classList.remove(className);
    this._refreshButton.setAttribute("aria-disabled", "false");

    if (this._disabled) {
      this._refreshButton.classList.add(className);
      this._refreshButton.setAttribute("aria-disabled", "true");
    }
  },

  _refreshStations() {
    if (!this._disabled) {
      this.options.onReloadStations();
    }
  },
});

// @factory stationRefresh(options: StationRefresh options)
// Creates a zoom control
export const stationRefresh = function (options) {
  return new LStationRefresh(options);
};

export const StationRefresh = createControlComponent(
  function createStationRefresh(props) {
    return new LStationRefresh(props);
  },
);
