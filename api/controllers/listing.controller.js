import Listing from "../models/listing.model.js";

export const createListing = async (req, res, next) => {
  try {
    const listing = await Listing.create(req.body);
    res.status(201).json(listing);
  } catch (error) {
    next(error);
  }
};

export const deleteListing = async (req, res, next) => {
  try {
    const listing = await Listing.findById(req.params.id);

    if (!listing) {
      const err = new Error("Listing not found!");
      err.statusCode = 404;
      return next(err);
    }

    if (req.user.id !== listing.userRef) {
      const err = new Error("You can only delete your own listings!");
      err.statusCode = 401;
      return next(err);
    }

    await Listing.findByIdAndDelete(req.params.id);
    res.status(200).json({ message: "Listing deleted successfully" });
  } catch (error) {
    next(error);
  }
};

export const updateListing = async (req, res, next) => {
  const listing = await Listing.findById(req.params.id);
  
  if (!listing) {
    return next(errorHandler(404,'Listing not found!'));
  }
  if(req.user.id !== listing.userRef){
    return next(errorHandler(401,'You can only update your own listings!'));
  }
  try {
    const updatedListing = await Listing.findByIdAndUpdate(
      req.params.id,
      { $set: req.body },
      { new: true }
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
      const err = new Error("Listing not found!");
      err.statusCode = 404;
      return next(err);
    }
    res.status(200).json(listing);
  } catch (error) {
    next(error);
  }
};