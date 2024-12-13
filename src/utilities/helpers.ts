// Custom validation schema for 24-hour time clock
export const timeRegex = /^([01]\d|2[0-3]):([0-5]\d)$/;

// Validate the time format (HH:mm)
export const isValidRecurrenceTime = (time: string): boolean => {
    return timeRegex.test(time);
};

// Regex for validating a date string regardless of common formats
export const dateRegex = /^(\d{4}([-/.])\d{2}\2\d{2})|(\d{2}([-/.])\d{2}\4\d{4})$/;

export const isValidQueryDate = (date: string): boolean => {
    return dateRegex.test(date);
};

// Calculate a new date based off the argument's offset to UTC
export const convertToUTCTime = (date: Date): Date => {
    return new Date(date.getTime() + date.getTimezoneOffset() * 60000);
};
