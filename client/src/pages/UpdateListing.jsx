import { useState, useEffect } from "react";
import {
  getStorage,
  getDownloadURL,
  ref,
  uploadBytesResumable,
} from "firebase/storage";
import { app } from "../firebase";
import ListingForm from "../components/ListingForm";
import { useNavigate, useParams } from "react-router-dom";
import { validateImage, deleteImage, deleteImages } from "../utils/images";

export default function UpdateListing() {
  const navigate = useNavigate();
  const params = useParams();
  const [files, setFiles] = useState([]);
  // images already saved on the listing; only removed from storage once the update is saved
  const [savedImageUrls, setSavedImageUrls] = useState([]);
  const [formData, setFormData] = useState({
    imageUrls: [],
    name: "",
    description: "",
    address: "",
    phone: "",
    type: "rent",
    bedrooms: 1,
    bathrooms: 1,
    parking: false,
    furnished: false,
    offer: false,
    regularPrice: 500,
    discountPrice: 0,
  });
  const [imageUploadError, setImageUploadError] = useState(false);
  const [uploading, setUploading] = useState(false);
  const [error, setError] = useState(false);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    const fetchListingData = async () => {
      try {
        const listingId = params.listingId;
        const res = await fetch(`/api/listing/get/${listingId}`);
        const data = await res.json();
        if (data.success === false) {
          setError(data.message);
          return;
        }

        setFormData({
          ...data,
          phone: data.phone || "",
          discountPrice: data.discountPrice ?? data.discountedPrice ?? 0,
          imageUrls: data.imageUrls || [],
        });
        setSavedImageUrls(data.imageUrls || []);
      } catch {
        setError("Failed to fetch listing data");
      }
    };

    fetchListingData();
  }, [params.listingId]);

  const handleImageSubmit = () => {
    if (files.length === 0) {
      setImageUploadError("Please select at least one image to upload first");
      return;
    }

    const invalidFile = files.map(validateImage).find(Boolean);
    if (invalidFile) {
      setImageUploadError(invalidFile);
      return;
    }

    if (files.length + (formData.imageUrls?.length || 0) < 7) {
      setUploading(true);
      setImageUploadError(false);
      const promises = [];

      for (let i = 0; i < files.length; i++) {
        promises.push(storeImage(files[i]));
      }

      Promise.all(promises)
        .then((urls) => {
          setFormData({
            ...formData,
            imageUrls: (formData.imageUrls || []).concat(urls),
          });
          setImageUploadError(false);
          setUploading(false);
          setFiles([]);
        })
        .catch(() => {
          setImageUploadError("Image upload failed (2 MB max per image)");
          setUploading(false);
        });
    } else {
      setImageUploadError("You can only upload 6 images per listing");
      setUploading(false);
    }
  };

  const storeImage = async (file) => {
    return new Promise((resolve, reject) => {
      const storage = getStorage(app);
      const fileName = new Date().getTime() + file.name;
      const storageRef = ref(storage, fileName);
      const uploadTask = uploadBytesResumable(storageRef, file);

      uploadTask.on(
        "state_changed",
        null,
        (error) => {
          reject(error);
        },
        () => {
          getDownloadURL(uploadTask.snapshot.ref).then((downloadURL) => {
            resolve(downloadURL);
          });
        }
      );
    });
  };

  const handleRemoveLocalFile = (index) => {
    setFiles(files.filter((_, i) => i !== index));
  };

  const handleRemoveUploadedImage = (index) => {
    const url = formData.imageUrls[index];
    if (!savedImageUrls.includes(url)) deleteImage(url);
    setFormData({
      ...formData,
      imageUrls: formData.imageUrls.filter((_, i) => i !== index),
    });
  };

  const handleChange = (e) => {
    if (e.target.id === "sale" || e.target.id === "rent") {
      setFormData({
        ...formData,
        type: e.target.id,
      });
    }
    if (
      e.target.id === "parking" ||
      e.target.id === "furnished" ||
      e.target.id === "offer"
    ) {
      setFormData({
        ...formData,
        [e.target.id]: e.target.checked,
      });
    }
    if (
      e.target.type === "number" ||
      e.target.type === "text" ||
      e.target.type === "textarea"
    ) {
      setFormData({
        ...formData,
        [e.target.id]: e.target.value,
      });
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      if ((formData.imageUrls?.length || 0) < 1) {
        return setError(
          "You must upload at least one image before updating a listing"
        );
      }

      if (
        formData.offer &&
        Number(formData.regularPrice) <= Number(formData.discountPrice)
      ) {
        return setError(
          "Discounted price must be lower than the regular price"
        );
      }

      setLoading(true);
      setError(false);
      const res = await fetch(`/api/listing/update/${params.listingId}`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          ...formData,
          regularPrice: Number(formData.regularPrice),
          bedrooms: Number(formData.bedrooms),
          bathrooms: Number(formData.bathrooms),
          discountPrice: formData.offer ? Number(formData.discountPrice) : 0,
        }),
      });
      const data = await res.json();
      setLoading(false);

      if (data.success === false) {
        setError(data.message);
      } else {
        await deleteImages(
          savedImageUrls.filter((url) => !formData.imageUrls.includes(url))
        );
        navigate(`/listing/${data._id}`);
      }
    } catch (error) {
      setError(error.message);
      setLoading(false);
    }
  };

  return (
    <ListingForm
      eyebrow="Your listings"
      title="Edit listing"
      submitLabel="Save changes"
      submittingLabel="Saving…"
      formData={formData}
      files={files}
      setFiles={setFiles}
      uploading={uploading}
      imageUploadError={imageUploadError}
      error={error}
      loading={loading}
      onChange={handleChange}
      onSubmit={handleSubmit}
      onImageUpload={handleImageSubmit}
      onRemoveLocalFile={handleRemoveLocalFile}
      onRemoveUploadedImage={handleRemoveUploadedImage}
    />
  );
}
