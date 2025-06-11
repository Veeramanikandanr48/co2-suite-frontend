const helpersTestIds = {
  momentFormat: {
    container: 'moment-format-container',
    timeZone: 'moment-format-timezone',
    formattedTime: 'moment-format-time'
  },
  formatNumber: {
    container: 'format-number-container',
    formattedNumber: 'format-number-value'
  },
  parseJson: {
    container: 'parse-json-container',
    parsedData: 'parse-json-data',
    error: 'parse-json-error'
  }
};

const baseButtonTestIds = {
  button: 'base-button',
  tooltip: 'base-button-tooltip',
  loadingSpinner: 'base-button-loading-spinner',
  loadingText: 'base-button-loading-text'
};

const toastTestIds = {
  container: 'toast-container',
  title: 'toast-title',
  description: 'toast-description',
  action: 'toast-action',
  close: 'toast-close'
};

export {
  helpersTestIds,
  baseButtonTestIds,
  toastTestIds
}; 