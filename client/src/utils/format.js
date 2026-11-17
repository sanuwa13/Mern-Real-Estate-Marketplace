export const formatPrice = (value) => `Rs. ${Number(value || 0).toLocaleString("en-US")}`;

export const plural = (count, word) => `${count} ${word}${Number(count) === 1 ? "" : "s"}`;

// the price a visitor actually pays; an offer without a valid discount falls back to the regular price
export const listingPrices = (listing) => {
  const regular = Number(listing?.regularPrice || 0);
  const discount = Number(listing?.discountPrice ?? listing?.discountedPrice ?? 0);
  const hasDiscount = Boolean(listing?.offer) && discount > 0 && discount < regular;
  return { regular, discount, hasDiscount, price: hasDiscount ? discount : regular };
};
