/**
 * Converts a number to PKR Words (e.g. 77268 -> "Seventy-Seven Thousand Two Hundred and Sixty-Eight Rupees Only")
 */
export function numberToWordsPKR(amount) {
  const num = Math.round(Number(amount) || 0);
  if (num === 0) return 'Zero Rupees Only';

  const ones = ['', 'One', 'Two', 'Three', 'Four', 'Five', 'Six', 'Seven', 'Eight', 'Nine', 'Ten', 
                'Eleven', 'Twelve', 'Thirteen', 'Fourteen', 'Fifteen', 'Sixteen', 'Seventeen', 'Eighteen', 'Nineteen'];
  const tens = ['', '', 'Twenty', 'Thirty', 'Forty', 'Fifty', 'Sixty', 'Seventy', 'Eighty', 'Ninety'];

  function convertLessThanOneThousand(n) {
    let current = '';
    if (n >= 100) {
      current += ones[Math.floor(n / 100)] + ' Hundred ';
      n %= 100;
    }
    if (n >= 20) {
      current += tens[Math.floor(n / 10)] + (n % 10 !== 0 ? '-' + ones[n % 10] : '') + ' ';
    } else if (n > 0) {
      current += ones[n] + ' ';
    }
    return current.trim();
  }

  let remaining = num;
  let words = '';

  // Crores (10,000,000)
  if (remaining >= 10000000) {
    const crore = Math.floor(remaining / 10000000);
    words += convertLessThanOneThousand(crore) + ' Crore ';
    remaining %= 10000000;
  }

  // Lakhs (100,000)
  if (remaining >= 100000) {
    const lakh = Math.floor(remaining / 100000);
    words += convertLessThanOneThousand(lakh) + ' Lakh ';
    remaining %= 100000;
  }

  // Thousands (1,000)
  if (remaining >= 1000) {
    const thousand = Math.floor(remaining / 1000);
    words += convertLessThanOneThousand(thousand) + ' Thousand ';
    remaining %= 1000;
  }

  // Hundreds and remainder
  if (remaining > 0) {
    words += convertLessThanOneThousand(remaining) + ' ';
  }

  return `${words.trim()} Rupees Only`;
}
