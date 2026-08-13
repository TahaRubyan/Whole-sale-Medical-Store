export const PHARMACY_QUOTES = [
  "Success in wholesale starts with accuracy and good stock management.",
  "Customer trust is built on timely delivery and accurate invoicing.",
  "A well-managed inventory is the backbone of a successful pharmacy store.",
  "Precision in medicine batch tracking guarantees quality and patient safety.",
  "Efficient cash collection and clear regional ledgers build strong shop partnerships.",
  "Check expiry dates regularly to minimize waste and ensure compliance.",
  "Streamlined wholesale billing makes daily operations smooth and profitable."
];

export const getRandomQuote = () => {
  const index = Math.floor(Math.random() * PHARMACY_QUOTES.length);
  return PHARMACY_QUOTES[index];
};
