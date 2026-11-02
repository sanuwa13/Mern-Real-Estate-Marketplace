import { useSelector } from "react-redux";
import { useRef, useState, useEffect } from "react";
import {
  getStorage,
  ref,
  uploadBytesResumable,
  getDownloadURL,
} from "firebase/storage";
import { app } from "../firebase";
import {
  updateUserStart,
  updateUserSuccess,
  updateUserFailure,
  signoutUserFailure,
  signoutUserStart,
  signoutUserSuccess,
} from "../redux/user/userSlice";
import { useDispatch } from "react-redux";
import { Link } from "react-router-dom";
import { validateImage, deleteImage, deleteImages } from "../utils/images";

export default function Profile() {
  const fileRef = useRef(null);
  const { currentUser, loading, error } = useSelector((state) => state.user);

  const [file, setFile] = useState(undefined);
  const [filePercent, setFilePerc] = useState(0);
  const [fileUploadError, setFileUploadError] = useState(false);
  const [formData, setFormData] = useState({});
  const [updateSuccess, setUpdateSuccess] = useState(false);
  const [showListingsError, setShowListingsError] = useState(false);
  const [userListings, setUserListings] = useState([]);
  const dispatch = useDispatch();

  useEffect(() => {
    if (file) {
      handleFileUpload(file);
    }
  }, [file]);

  const handleFileUpload = (file) => {
    if (validateImage(file)) {
      setFileUploadError(true);
      return;
    }
    const storage = getStorage(app);
    const fileName = new Date().getTime() + file.name;
    const storageRef = ref(storage, fileName);
    const uploadTask = uploadBytesResumable(storageRef, file);

    setFileUploadError(false);
    setFilePerc(1);

    uploadTask.on(
      "state_changed",
      (snapshot) => {
        const progress =
          (snapshot.bytesTransferred / snapshot.totalBytes) * 100;
        // stay below 100 until the download link is ready, so Update can't save without the new avatar
        setFilePerc(Math.min(Math.round(progress), 99));
      },
      (error) => {
        console.error("Upload error:", error);
        setFileUploadError(true);
        setFilePerc(0);
      },
      () => {
        getDownloadURL(uploadTask.snapshot.ref).then((downloadURL) => {
          setFormData((prev) => ({ ...prev, avatar: downloadURL }));
          setFilePerc(100);
        });
      },
    );
  };

  const handleChange = (e) => {
    const { id, value } = e.target;
    setFormData((prev) => ({ ...prev, [id]: value }));
  };

  const avatarUploading = filePercent > 0 && filePercent < 100;

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      setUpdateSuccess(false);
      dispatch(updateUserStart());

      const res = await fetch(`/api/user/update/${currentUser?._id}`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(formData),
      });

      const data = await res.json();
      if (data.success === false) {
        dispatch(updateUserFailure(data.message));
        return;
      }
      if (formData.avatar && currentUser?.avatar !== formData.avatar) {
        deleteImage(currentUser?.avatar);
      }
      dispatch(updateUserSuccess(data));
      setUpdateSuccess(true);
    } catch (error) {
      dispatch(updateUserFailure(error.message));
    }
  };

  const handleSignOut = async () => {
    try {
      dispatch(signoutUserStart());
      const res = await fetch("/api/auth/signout");
      const data = await res.json();
      if (data.success === false) {
        dispatch(signoutUserFailure(data.message));
        return;
      }
      dispatch(signoutUserSuccess(data));
    } catch (error) {
      dispatch(signoutUserFailure(error.message));
    }
  };

  const handleShowListings = async () => {
    try {
      setShowListingsError(false);
      const res = await fetch(`/api/user/listings/${currentUser?._id}`);
      const data = await res.json();
      if (data.success === false) {
        setShowListingsError(true);
        return;
      }

      setUserListings(data);
    } catch (error) {
      setShowListingsError(true);
    }
  };

  const handleListingDelete = async (listing) => {
    if (!window.confirm(`Delete "${listing.name}"?`)) return;
    try {
      const res = await fetch(`/api/listing/delete/${listing._id}`, {
        method: "DELETE",
      });
      const data = await res.json();
      if (data.success === false) {
        setShowListingsError(true);
        return;
      }
      deleteImages(listing.imageUrls);
      setUserListings((prevListings) =>
        prevListings.filter((item) => item._id !== listing._id),
      );
    } catch (error) {
      setShowListingsError(true);
    }
  };

  return (
    <div className="p-3 max-w-lg mx-auto">
      <h1 className="text-3xl font-semibold text-center my-7">Profile</h1>
      <form onSubmit={handleSubmit} className="flex flex-col gap-4">
        <input
          onChange={(e) => setFile(e.target.files[0])}
          type="file"
          ref={fileRef}
          hidden
          accept="image/*"
        />

        <img
          onClick={() => fileRef.current?.click()}
          src={
            formData.avatar ||
            currentUser?.avatar ||
            "https://encrypted-tbn0.gstatic.com/images?q=tbn:ANd9GcRcPVY5FK0TbQhg_WSDUKRuOEWDHwfvaHFCjA&s"
          }
          alt="profile"
          className="h-24 w-24 rounded-full object-cover self-center cursor-pointer mt-2"
        />

        <div className="text-center text-sm">
          {fileUploadError ? (
            <span className="text-red-700">
              Error Image upload (Image must be less than 2MB)
            </span>
          ) : filePercent > 0 && filePercent < 100 ? (
            <span className="text-slate-700">{`Uploading: ${filePercent}%`}</span>
          ) : filePercent === 100 ? (
            <span className="text-green-600">Image Successfully Uploaded!</span>
          ) : (
            ""
          )}
        </div>

        <input
          type="text"
          placeholder="username"
          defaultValue={currentUser?.username}
          id="username"
          className="border p-3 rounded-lg"
          onChange={handleChange}
        />
        <input
          type="email"
          placeholder="email"
          value={currentUser?.email || ""}
          id="email"
          title="The owner email is set by ADMIN_EMAIL on the server"
          className="border p-3 rounded-lg bg-slate-100 text-slate-500"
          readOnly
        />
        <input
          type="password"
          placeholder="password"
          id="password"
          className="border p-3 rounded-lg"
          onChange={handleChange}
        />

        <button
          disabled={loading || avatarUploading}
          className="bg-slate-700 text-white rounded-lg p-3 uppercase hover:opacity-95 disabled:opacity-80"
        >
          {loading ? "Loading..." : avatarUploading ? "Uploading photo..." : "Update"}
        </button>

        <Link
          className="bg-green-700 text-white p-3 rounded-lg uppercase text-center hover:opacity-95"
          to={"/create-listing"}
        >
          Create Listing
        </Link>
      </form>

      <div className="flex justify-end mt-5">
        <span onClick={handleSignOut} className="text-red-700 cursor-pointer">
          Sign Out
        </span>
      </div>

      <p className="text-red-700 mt-5">{error ? error : ""}</p>
      <p className="text-green-700 mt-5">
        {updateSuccess ? "Profile updated successfully!" : ""}
      </p>

      <button
        onClick={handleShowListings}
        className="text-green-700 w-full mt-5 font-semibold hover:underline"
      >
        Show All Listings
      </button>

      <p className="text-red-700 mt-5 text-center text-sm">
        {showListingsError ? "Error showing listings!" : ""}
      </p>

      {userListings && userListings.length > 0 && (
        <div className="flex flex-col gap-4">
          <h1 className="text-center mt-7 text-2xl font-semibold">
            All Listings
          </h1>
          {userListings.map((listing) => (
            <div
              key={listing._id}
              className="border p-3 rounded-lg flex items-center justify-between gap-4"
            >
              <Link to={`/listing/${listing._id}`}>
                
                <img
                  src={
                    listing.imageUrls?.[0] ||
                    listing.images?.[0] ||
                    "https://53.fs1.hubspotusercontent-na1.net/hub/53/hubfs/Sales_Blog/real-estate-business-compressor.png"
                  }
                  alt="listing cover"
                  className="h-16 w-16 object-cover rounded-lg"
                />
              </Link>
              <Link
                className="flex-1 text-slate-700 font-semibold hover:underline truncate"
                to={`/listing/${listing._id}`}
              >
                <p>{listing.name}</p>
              </Link>

              <div className="flex flex-col items-center">
                <button
                  onClick={() => handleListingDelete(listing)}
                  className="text-red-700 uppercase"
                >
                  Delete
                </button>
                <Link
                  to={`/update-listing/${listing._id}`}
                  className="text-green-700 uppercase"
                >
                  Edit
                </Link>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
