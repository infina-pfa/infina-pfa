/**
 * Date formatting utilities for Vietnamese locale
 */

/**
 * Format a date to Vietnamese format (DD/MM/YYYY)
 * @param date Date string or Date object
 * @returns Formatted date string in Vietnamese format
 */
export const formatDateVN = (date: string | Date): string => {
  const dateObj = typeof date === 'string' ? new Date(date) : date;
  
  const day = dateObj.getDate().toString().padStart(2, '0');
  const month = (dateObj.getMonth() + 1).toString().padStart(2, '0');
  const year = dateObj.getFullYear();
  
  return `${day}/${month}/${year}`;
};

/**
 * Format a time to Vietnamese format (HH:MM)
 * @param date Date string or Date object
 * @returns Formatted time string in Vietnamese format
 */
export const formatTimeVN = (date: string | Date): string => {
  const dateObj = typeof date === 'string' ? new Date(date) : date;
  
  const hours = dateObj.getHours().toString().padStart(2, '0');
  const minutes = dateObj.getMinutes().toString().padStart(2, '0');
  
  return `${hours}:${minutes}`;
};

/**
 * Format a datetime to Vietnamese format (HH:MM DD/MM/YYYY)
 * @param date Date string or Date object
 * @returns Formatted datetime string in Vietnamese format
 */
export const formatDateTimeVN = (date: string | Date): string => {
  return `${formatTimeVN(date)} ${formatDateVN(date)}`;
};

/**
 * Format a date to relative time in Vietnamese (hôm nay, hôm qua, etc.)
 * @param date Date string or Date object
 * @returns Relative time string in Vietnamese
 */
export const formatRelativeDateVN = (date: string | Date): string => {
  const dateObj = typeof date === 'string' ? new Date(date) : date;
  const now = new Date();
  
  // Reset hours to compare just the dates
  const today = new Date(now);
  today.setHours(0, 0, 0, 0);
  
  const yesterday = new Date(today);
  yesterday.setDate(yesterday.getDate() - 1);
  
  const dateToCompare = new Date(dateObj);
  dateToCompare.setHours(0, 0, 0, 0);
  
  if (dateToCompare.getTime() === today.getTime()) {
    return 'Hôm nay';
  } else if (dateToCompare.getTime() === yesterday.getTime()) {
    return 'Hôm qua';
  } else {
    return formatDateVN(date);
  }
}; 