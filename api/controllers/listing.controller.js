import Listing from "../models/listing.model.js";
import { errorHandler } from "../utils/error.js";
import { DISTRICTS, tidyTownName } from "../utils/districts.js";

const LISTING_FIELDS = [
  "name",
  "description",
  "address",
  "district",
  "city",
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
  if (data.city !== undefined) data.city = tidyTownName(data.city);
  return data;
};

const locationError = (data) => {
  if (!DISTRICTS.includes(data.district)) return "Please choose a district";
  if (!data.city) return "Please enter the town or area";
  return null;
};

const escapeRegex = (text) => text.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");

const booleanFilter = (value) =>
  value === "true" ? true : { $in: [false, true] };

export const createListing = async (req, res, next) => {
  try {
    const data = pickListingFields(req.body);
    const problem = locationError(data);
    if (problem) return next(errorHandler(400, problem));
    const listing = await Listing.create({ ...data, userRef: req.user.id });
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

    const data = pickListingFields(req.body);
    const problem = locationError({ ...listing.toObject(), ...data });
    if (problem) return next(errorHandler(400, problem));

    const updatedListing = await Listing.findByIdAndUpdate(
      req.params.id,
      { $set: data },
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

    const location = {};
    if (DISTRICTS.includes(req.query.district)) location.district = req.query.district;
    if (typeof req.query.city === "string" && req.query.city.trim()) {
      location.city = { $regex: `^${escapeRegex(req.query.city.trim())}$`, $options: "i" };
    }

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
      ...location,
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

// counts for the home page figures
export const getListingStats = async (req, res, next) => {
  try {
    const [total, sale, rent, offers] = await Promise.all([
      Listing.countDocuments(),
      Listing.countDocuments({ type: "sale" }),
      Listing.countDocuments({ type: "rent" }),
      Listing.countDocuments({ offer: true }),
    ]);
    res.status(200).json({ total, sale, rent, offers });
  } catch (error) {
    next(error);
  }
};

// ad counts per district and town, for the location filter
export const getListingLocations = async (req, res, next) => {
  try {
    const groups = await Listing.aggregate([
      { $match: { district: { $in: DISTRICTS } } },
      { $group: { _id: { district: "$district", city: "$city" }, count: { $sum: 1 } } },
    ]);
    const byDistrict = new Map();
    for (const { _id, count } of groups) {
      const entry = byDistrict.get(_id.district) || { district: _id.district, count: 0, cities: [] };
      entry.count += count;
      if (_id.city) entry.cities.push({ city: _id.city, count });
      byDistrict.set(_id.district, entry);
    }
    const locations = [...byDistrict.values()]
      .map((entry) => ({ ...entry, cities: entry.cities.sort((a, b) => a.city.localeCompare(b.city)) }))
      .sort((a, b) => a.district.localeCompare(b.district));
    res.status(200).json(locations);
  } catch (error) {
    next(error);
  }
};
