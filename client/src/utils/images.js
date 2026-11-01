import { getStorage, ref, deleteObject } from "firebase/storage";
import { app } from "../firebase";

export const MAX_IMAGE_MB = 2;

// returns an error message, or null when the file is fine to upload
export const validateImage = (file) => {
  if (!file.type.startsWith("image/")) {
    return `${file.name} is not an image`;
  }
  if (file.size > MAX_IMAGE_MB * 1024 * 1024) {
    return `${file.name} is larger than ${MAX_IMAGE_MB} MB`;
  }
  return null;
};

// best effort: a failed delete only leaves an unused file behind, so it never blocks the user
export const deleteImage = async (url) => {
  if (!url || !url.includes("firebasestorage")) return;
  try {
    await deleteObject(ref(getStorage(app), url));
  } catch (error) {
    console.error("Could not delete image from storage:", error);
  }
};

export const deleteImages = (urls = []) => Promise.all(urls.map(deleteImage));
