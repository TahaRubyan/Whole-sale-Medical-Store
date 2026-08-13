/**
 * Date Standardization Utility for Wholesale Medical Store ERP
 * Formats any valid date input into DD-MM-YYYY string format.
 * 
 * @param {string|Date|null|undefined} dateInput 
 * @returns {string} Formatted date string in DD-MM-YYYY or empty string if invalid
 */
export const formatDateDDMMYYYY = (dateInput) => {
  if (!dateInput) return '';

  if (dateInput instanceof Date) {
    if (isNaN(dateInput.getTime())) return '';
    const day = String(dateInput.getDate()).padStart(2, '0');
    const month = String(dateInput.getMonth() + 1).padStart(2, '0');
    const year = dateInput.getFullYear();
    return `${day}-${month}-${year}`;
  }

  if (typeof dateInput === 'string') {
    const str = dateInput.trim();
    if (!str) return '';

    // Already DD-MM-YYYY
    if (/^\d{2}-\d{2}-\d{4}$/.test(str)) {
      return str;
    }

    // DD/MM/YYYY format
    if (/^\d{2}\/\d{2}\/\d{4}$/.test(str)) {
      const [d, m, y] = str.split('/');
      return `${d.padStart(2, '0')}-${m.padStart(2, '0')}-${y}`;
    }

    // YYYY-MM-DD format
    if (/^\d{4}-\d{2}-\d{2}$/.test(str)) {
      const [y, m, d] = str.split('-');
      return `${d.padStart(2, '0')}-${m.padStart(2, '0')}-${y}`;
    }

    // YYYY/MM/DD format
    if (/^\d{4}\/\d{2}\/\d{2}$/.test(str)) {
      const [y, m, d] = str.split('/');
      return `${d.padStart(2, '0')}-${m.padStart(2, '0')}-${y}`;
    }

    // YYYY-MM format
    if (/^\d{4}-\d{2}$/.test(str)) {
      const [y, m] = str.split('-');
      return `01-${m.padStart(2, '0')}-${y}`;
    }

    // Generic date or ISO string parsing
    const parsed = new Date(str);
    if (!isNaN(parsed.getTime())) {
      const day = String(parsed.getDate()).padStart(2, '0');
      const month = String(parsed.getMonth() + 1).padStart(2, '0');
      const year = parsed.getFullYear();
      return `${day}-${month}-${year}`;
    }
  }

  return String(dateInput);
};

/**
 * Check if a date string or Date object is within 6 months from today (or already expired).
 * 
 * @param {string|Date} dateInput 
 * @returns {boolean} True if date is <= 6 months from today
 */
export const isWithinSixMonths = (dateInput) => {
  if (!dateInput) return false;

  let expDate;
  if (dateInput instanceof Date) {
    expDate = new Date(dateInput.getTime());
  } else if (typeof dateInput === 'string') {
    const str = dateInput.trim();
    if (/^\d{4}-\d{2}-\d{2}$/.test(str)) {
      const [y, m, d] = str.split('-').map(Number);
      expDate = new Date(y, m - 1, d);
    } else if (/^\d{2}-\d{2}-\d{4}$/.test(str)) {
      const [d, m, y] = str.split('-').map(Number);
      expDate = new Date(y, m - 1, d);
    } else if (/^\d{2}\/\d{2}\/\d{4}$/.test(str)) {
      const [d, m, y] = str.split('/').map(Number);
      expDate = new Date(y, m - 1, d);
    } else {
      expDate = new Date(str);
    }
  } else {
    expDate = new Date(dateInput);
  }

  if (isNaN(expDate.getTime())) return false;

  const today = new Date();
  const cutoff = new Date(today.getFullYear(), today.getMonth() + 6, today.getDate());

  expDate.setHours(0, 0, 0, 0);
  cutoff.setHours(23, 59, 59, 999);

  return expDate <= cutoff;
};
