import momentTimezone from "moment-timezone";

 const momentFormat = (time: string, formatString: string = "h:mm A"): string => {
  const currentUserTimeZone: string = Intl.DateTimeFormat().resolvedOptions().timeZone;
    return momentTimezone.utc(time).tz(currentUserTimeZone).format(formatString);
 };

/**
 * Formats a number with commas and decimal places
 *
 * @param {number} number - Number to format
 * @returns {string} A styled number to be displayed on the invoice
 */
const formatNumberWithCommas = (number: number) => {
  return number.toLocaleString("en-US", {
      style: "decimal",
      minimumFractionDigits: 2,
      maximumFractionDigits: 2,
  });
};

const parseJson = (data: unknown) => {
  try {
      return typeof data === 'string' 
          ? JSON.parse(data) 
          : data;
  } catch {
      return data;
  }
};

export { 
  momentFormat, 
  parseJson,
  formatNumberWithCommas 
};
