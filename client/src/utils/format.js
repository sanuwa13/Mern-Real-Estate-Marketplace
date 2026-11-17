export const formatPrice = (value) => `Rs. ${Number(value || 0).toLocaleString("en-US")}`;

export const plural = (count, word) => `${count} ${word}${Number(count) === 1 ? "" : "s"}`;
