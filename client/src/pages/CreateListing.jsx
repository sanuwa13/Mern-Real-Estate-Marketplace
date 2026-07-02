import { useState } from "react";
import {
  getStorage,
  getDownloadURL,
  ref,
  uploadBytesResumable,
} from "firebase/storage";
import { app } from "../firebase";
import { useSelector } from "react-redux";
import { useNavigate } from "react-router-dom"; 

export default function CreateListing() {
  const { currentUser } = useSelector((state) => state.user);
  const navigate = useNavigate(); 
  const [files, setFiles] = useState([]);
  const [formData, setFormData] = useState({
    imageUrls: [],
    name: "",
    description: "",
    address: "",
    type: "rent",
    bedrooms: 1,
    bathrooms: 1,
    parking: false,
    furnished: false,
    offer: false,
    regularPrice: 500,
    discountedPrice: 0,
  });
  const [imageUploadError, setImageUploadError] = useState(false);
  const [uploading, setUploading] = useState(false);
  const [error, setError] = useState(false);
  const [loading, setLoading] = useState(false);

  console.log(formData);

  const handleImageSubmit = (e) => {
    // ✅ FIXED: Separate check for empty file selection to give clear error message
    if (files.length === 0) {
      setImageUploadError("Please select at least one image to upload first");
      return;
    }

    if (files.length + formData.imageUrls.length < 7) {
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
            imageUrls: formData.imageUrls.concat(urls),
          });
          setImageUploadError(false);
          setUploading(false);
          setFiles([]);
        })
        .catch((err) => {
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
        (snapshot) => {
          const progress =
            (snapshot.bytesTransferred / snapshot.totalBytes) * 100;
          console.log(`Upload is ${progress} % done`);
        },
        (error) => {
          reject(error);
        },
        () => {
          getDownloadURL(uploadTask.snapshot.ref).then((downloadURL) => {
            resolve(downloadURL);
          });
        },
      );
    });
  };

  const handleRemoveLocalFile = (index) => {
    setFiles(files.filter((_, i) => i !== index));
  };

  const handleRemoveUploadedImage = (index) => {
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
    if (e.target.type === "number") {
      setFormData({
        ...formData,
        [e.target.id]: Number(e.target.value),
      });
    }
    if (e.target.type === "text" || e.target.type === "textarea") {
      setFormData({
        ...formData,
        [e.target.id]: e.target.value,
      });
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      // Prevent form submission if images haven't been uploaded to cloud
      if (formData.imageUrls.length < 1) {
        return setError(
          "You must upload at least one image before creating a listing",
        );
      }

      // Enforce that discount price cannot exceed regular price if an offer exists
      if (formData.offer && formData.regularPrice <= formData.discountedPrice) {
        return setError(
          "Discounted price must be lower than the regular price",
        );
      }

      setLoading(true);
      setError(false);
      const res = await fetch("/api/listing/create", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          ...formData,
          userRef: currentUser?._id,
        }),
      });
      const data = await res.json();
      setLoading(false);

      if (data.success === false) {
        setError(data.message);
      } else {
        // ✅ ADDED: Redirects user to the view page of their new listing upon success
        navigate(`/listing/${data._id}`);
      }
    } catch (error) {
      setError(error.message);
      setLoading(false);
    }
  };

  return (
    <main className="p-3 max-w-4xl mx-auto">
      <h1 className="text-3xl font-semibold text-center my-7">
        Create Listing
      </h1>
      <form onSubmit={handleSubmit} className="flex flex-col sm:flex-row gap-4">
        <div className="flex flex-col gap-4 flex-1">
          <input
            type="text"
            placeholder="Name"
            className="p-3 border rounded-lg"
            id="name"
            maxLength="62"
            minLength="10"
            required
            onChange={handleChange}
            value={formData.name}
          />
          <input
            type="text"
            placeholder="Description"
            className="p-3 border rounded-lg"
            id="description"
            required
            onChange={handleChange}
            value={formData.description}
          />
          <input
            type="text"
            placeholder="Address"
            className="p-3 border rounded-lg"
            id="address"
            required
            onChange={handleChange}
            value={formData.address}
          />

          <div className="flex gap-6 flex-wrap">
            <div className="flex gap-2">
              <input
                type="checkbox"
                id="sale"
                className="w-5"
                onChange={handleChange}
                checked={formData.type === "sale"}
              />
              <span>Sell</span>
            </div>
            <div className="flex gap-2">
              <input
                type="checkbox"
                id="rent"
                className="w-5"
                onChange={handleChange}
                checked={formData.type === "rent"}
              />
              <span>Rent</span>
            </div>
            <div className="flex gap-2">
              <input
                type="checkbox"
                id="parking"
                className="w-5"
                onChange={handleChange}
                checked={formData.parking}
              />
              <span>Parking Spot</span>
            </div>
            <div className="flex gap-2">
              <input
                type="checkbox"
                id="furnished"
                className="w-5"
                onChange={handleChange}
                checked={formData.furnished}
              />
              <span>Furnished</span>
            </div>
            <div className="flex gap-2">
              <input
                type="checkbox"
                id="offer"
                className="w-5"
                onChange={handleChange}
                checked={formData.offer}
              />
              <span>Offer</span>
            </div>
          </div>

          <div className="flex flex-wrap gap-6">
            <div className="flex items-center gap-2">
              <input
                type="number"
                id="bedrooms"
                min="1"
                max="15"
                required
                className="p-3 border border-gray-300 rounded-lg"
                onChange={handleChange}
                value={formData.bedrooms}
              />
              <p>Beds</p>
            </div>
            <div className="flex items-center gap-2">
              <input
                type="number"
                id="bathrooms"
                min="1"
                max="15"
                required
                className="p-3 border border-gray-300 rounded-lg"
                onChange={handleChange}
                value={formData.bathrooms}
              />
              <p>Baths</p>
            </div>
            <div className="flex items-center gap-2">
              <input
                type="number"
                id="regularPrice"
                min="500"
                required
                max="10000000000"
                className="p-3 border border-gray-300 rounded-lg"
                onChange={handleChange}
                value={formData.regularPrice}
              />
              <div className="flex flex-col items-center">
                <p>Regular Price</p>
                <span className="text-xs">(Rs. / month)</span>
              </div>
            </div>

            {/* ✅ Enforce conditional UI/validation or logic helper for Offer */}
            <div className="flex items-center gap-2">
              <input
                type="number"
                id="discountedPrice"
                min="0"
                max="100000000"
                required
                className="p-3 border border-gray-300 rounded-lg"
                onChange={handleChange}
                value={formData.discountedPrice}
              />
              <div className="flex flex-col items-center">
                <p>Discounted Price</p>
                {formData.type === "rent" && (
                  <span className="text-xs">(Rs. / month)</span>
                )}
              </div>
            </div>
          </div>
        </div>

        <div className="flex flex-col flex-1 gap-4">
          <p className="font-semibold">
            Images:
            <span className="font-normal text-gray-600 ml-2">
              The first image will be the cover (max 6)
            </span>
          </p>
          <div className="flex gap-4">
            <input
              onChange={(e) => setFiles(Array.from(e.target.files))}
              className="p-3 border border-gray-300 rounded w-full"
              type="file"
              id="images"
              accept="image/*"
              multiple
            />
            <button
              type="button"
              disabled={uploading}
              onClick={handleImageSubmit}
              className="p-3 text-green-700 border border-green-700 rounded uppercase hover:shadow-lg disabled:opacity-80"
            >
              {uploading ? "Uploading..." : "Upload"}
            </button>
          </div>

          {imageUploadError && (
            <p className="text-red-700 text-sm">{imageUploadError}</p>
          )}

          {files.length > 0 && (
            <div className="flex flex-col gap-2 p-3 border border-dashed border-slate-300 rounded-lg bg-slate-50">
              <p className="text-xs font-semibold text-slate-500 uppercase tracking-wider">
                Selected (Ready to Upload):
              </p>
              {files.map((file, index) => (
                <div
                  key={index}
                  className="flex justify-between items-center bg-white p-2 rounded-md border text-sm"
                >
                  <div className="flex items-center gap-3">
                    <img
                      src={URL.createObjectURL(file)}
                      alt="local preview"
                      className="w-14 h-14 object-cover rounded"
                    />
                    <span className="text-gray-700 truncate max-w-[180px] font-medium">
                      {file.name}
                    </span>
                  </div>
                  <div className="flex items-center gap-3">
                    <span className="text-xs text-gray-400">
                      {(file.size / 1024 / 1024).toFixed(2)} MB
                    </span>
                    <button
                      type="button"
                      onClick={() => handleRemoveLocalFile(index)}
                      className="text-red-500 hover:text-red-700 font-bold px-2 text-base transition-colors"
                    >
                      ✕
                    </button>
                  </div>
                </div>
              ))}
            </div>
          )}

          {formData.imageUrls.length > 0 && (
            <div className="flex flex-col gap-2 p-3 border border-solid border-green-300 rounded-lg bg-green-50/40">
              <p className="text-xs font-semibold text-green-700 uppercase tracking-wider">
                Uploaded Images (Live on Cloud):
              </p>
              {formData.imageUrls.map((url, index) => (
                <div
                  key={url}
                  className="flex justify-between items-center bg-white p-2 rounded-md border text-sm"
                >
                  <div className="flex items-center gap-3">
                    <img
                      src={url}
                      alt="listing image"
                      className="w-14 h-14 object-cover rounded-lg"
                    />
                    <span className="text-xs text-green-600 italic font-medium">
                      Uploaded Successfully
                    </span>
                  </div>
                  <button
                    type="button"
                    onClick={() => handleRemoveUploadedImage(index)}
                    className="p-2 text-red-700 hover:text-red-900 text-xs uppercase font-semibold border border-transparent hover:border-red-200 rounded bg-red-50 transition-all"
                  >
                    Delete From Cloud
                  </button>
                </div>
              ))}
            </div>
          )}

          <button
            type="submit"
            disabled={loading || uploading}
            className="p-3 bg-slate-700 text-white rounded-lg uppercase hover:opacity-95 disabled:opacity-80"
          >
            {loading ? "Creating..." : "Create Listing"}
          </button>
          {error && <p className="text-red-700 text-sm">{error}</p>}
        </div>
      </form>
    </main>
  );
}
