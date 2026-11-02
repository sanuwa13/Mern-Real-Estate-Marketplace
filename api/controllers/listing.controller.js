import Listing from "../models/listing.model.js";
import { errorHandler } from "../utils/error.js";

const LISTING_FIELDS = [
  "name",
  "description",
  "address",
  "phone",
  "regularPrice",
  "discountPrice",
  "bathrooms",
  "bedrooms",
  "furnished",
  "parking",
  "type",
  "offer",
  "imageUrls",
];
const SORT_FIELDS = ["createdAt", "regularPrice"];
const MAX_LIMIT = 50;

// only copy the fields a user is allowed to set, so things like userRef can't be changed from the browser
const pickListingFields = (body) => {
  const data = {};
  for (const field of LISTING_FIELDS) {
    if (body[field] !== undefined) data[field] = body[field];
  }
  return data;
};

const escapeRegex = (text) => text.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");

const booleanFilter = (value) =>
  value === "true" ? true : { $in: [false, true] };

export const createListing = async (req, res, next) => {
  try {
    const listing = await Listing.create({
      ...pickListingFields(req.body),
      userRef: req.user.id,
    });
    res.status(201).json(listing);
  } catch (error) {
    next(error);
  }
};

export const deleteListing = async (req, res, next) => {
  try {
    const listing = await Listing.findById(req.params.id);

    if (!listing) {
      return next(errorHandler(404, "Listing not found!"));
    }

    await Listing.findByIdAndDelete(req.params.id);
    res.status(200).json({ message: "Listing deleted successfully" });
  } catch (error) {
    next(error);
  }
};

export const updateListing = async (req, res, next) => {
  try {

    const listing = await Listing.findById(req.params.id);

    if (!listing) {
      return next(errorHandler(404, "Listing not found!"));
    }

    const updatedListing = await Listing.findByIdAndUpdate(
      req.params.id,
      { $set: pickListingFields(req.body) },
      { returnDocument: "after", runValidators: true }
    );
    res.status(200).json(updatedListing);
  } catch (error) {
    next(error);
  }
};

export const getListing = async (req, res, next) => {
  try {
    const listing = await Listing.findById(req.params.id);
    if (!listing) {
      return next(errorHandler(404, "Listing not found!"));
    }
    res.status(200).json(listing);
  } catch (error) {
    next(error);
  }
};

export const getListings = async (req, res, next) => {
  try {
    const limit = Math.min(parseInt(req.query.limit) || 9, MAX_LIMIT);
    const startIndex = Math.max(parseInt(req.query.startIndex) || 0, 0);

    const offer = booleanFilter(req.query.offer);
    const furnished = booleanFilter(req.query.furnished);
    const parking = booleanFilter(req.query.parking);

    const type = ["rent", "sale"].includes(req.query.type)
      ? req.query.type
      : { $in: ["rent", "sale"] };

    const searchTerm =
      typeof req.query.searchTerm === "string" ? req.query.searchTerm : "";
    const sort = SORT_FIELDS.includes(req.query.sort)
      ? req.query.sort
      : "createdAt";
    const order = req.query.order === "asc" ? "asc" : "desc";

    const listings = await Listing.find({
      name: { $regex: escapeRegex(searchTerm), $options: "i" },
      offer,
      furnished,
      parking,
      type,
    })
      .select("-phone")
      .sort({ [sort]: order })
      .skip(startIndex)
      .limit(limit);

    return res.status(200).json(listings);
  } catch (error) {
    next(error);
  }
};
