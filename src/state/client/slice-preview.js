import isEqual from "date-fns/isEqual";
import addMonths from "date-fns/addMonths";
import subMonths from "date-fns/subMonths";

export const createPreviewSlice = (set, get) => ({
  stationId: null,
  maxEndDate: null,
  minStartDate: null,

  selectedStartDate: null,
  selectedEndDate: null,
  selectedDuration: 6,

  showLegend: true,

  setStationId: (id) => {
    if (id !== get().stationId) {
      get().clearRanges();
      set({ stationId: id });
    }
  },

  setMaxEndDate: (date) => {
    set({ maxEndDate: date });
  },

  setMinStartDate: (date) => {
    set({ minStartDate: date });
  },

  /**
   *
   * @param {Date} date
   */
  setSelectedStartDate: (date) => {
    const initialDate = get().selectedStartDate;
    if (!isEqual(initialDate, date)) {
      set({
        selectedStartDate: date,
        selectedEndDate: addMonths(date, get().selectedDuration),
      });
    }
  },

  /**
   *
   * @param {Date} date
   */
  setSelectedEndDate: (date) => {
    const initialDate = get().selectedEndDate;
    if (!isEqual(initialDate, date)) {
      set({
        selectedEndDate: date,
        selectedStartDate: subMonths(date, get().selectedDuration),
      });
    }
  },

  /**
   *
   * @param {number} months
   */
  setDurationBeforeEnd: (months) => {
    const initialDuration = get().selectedDuration;
    if (initialDuration !== months) {
      set({
        selectedDuration: months,
        selectedStartDate: subMonths(get().selectedEndDate, months),
      });
    }
  },
  clearRanges: () => {
    set({
      maxEndDate: null,
      minStartDate: null,
      selectedStartDate: null,
      selectedEndDate: null,
      selectedDuration: 6,
    });
  },

  toggleLegend: () => {
    set({ showLegend: !get().showLegend });
  },
});

export default createPreviewSlice;
