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
import { FiPlus } from "react-icons/fi";
import { validateImage, deleteImage, deleteImages } from "../utils/images";
import { formatPrice, listingPrices } from "../utils/format";
import { formatLocation } from "../utils/districts";

const DEFAULT_AVATAR =
  "https://encrypted-tbn0.gstatic.com/images?q=tbn:ANd9GcRcPVY5FK0TbQhg_WSDUKRuOEWDHwfvaHFCjA&s";

export default function Profile() {
  const fileRef = useRef(null);
  const { currentUser, loading, error } = useSelector((state) => state.user);

  const [filePercent, setFilePerc] = useState(0);
  const [fileUploadError, setFileUploadError] = useState(false);
  const [formData, setFormData] = useState({});
  const [updateSuccess, setUpdateSuccess] = useState(false);
  const [showListingsError, setShowListingsError] = useState(false);
  const [userListings, setUserListings] = useState([]);
  const [listingsLoading, setListingsLoading] = useState(true);
  const dispatch = useDispatch();

  useEffect(() => {
    const loadListings = async () => {
      try {
        const res = await fetch(`/api/user/listings/${currentUser?._id}`);
        const data = await res.json();
        if (data.success === false) {
          setShowListingsError(true);
        } else {
          setUserListings(data);
        }
      } catch {
        setShowListingsError(true);
      } finally {
        setListingsLoading(false);
      }
    };
    loadListings();
  }, [currentUser?._id]);

  const handleFileUpload = (file) => {
    if (!file) return;
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
    } catch {
      setShowListingsError(true);
    }
  };

  return (
    <div>
      <section className="border-b border-neutral-200">
        <div className="page flex flex-col gap-6 py-12 sm:flex-row sm:items-end sm:justify-between sm:py-16">
          <div>
            <p className="eyebrow">Owner dashboard</p>
            <h1 className="heading mt-3 text-4xl sm:text-5xl">
              Hello, {currentUser?.username}.
            </h1>
          </div>
          <div className="flex flex-wrap gap-3">
            <Link to="/create-listing" className="btn-primary">
              <FiPlus /> New listing
            </Link>
            <button onClick={handleSignOut} className="btn-secondary">
              Sign out
            </button>
          </div>
        </div>
      </section>

      <div className="page grid grid-cols-1 gap-16 py-12 lg:grid-cols-[minmax(0,1fr)_22rem]">
        {/* Listings */}
        <section>
          <div className="flex items-baseline justify-between border-b border-ink pb-4">
            <h2 className="heading text-2xl">Listings</h2>
            {!listingsLoading && (
              <p className="text-sm text-neutral-500">{userListings.length} total</p>
            )}
          </div>

          {showListingsError && (
            <p className="error-text mt-6" role="alert">
              Something went wrong with your listings. Please refresh and try again.
            </p>
          )}

          {listingsLoading && <p className="py-10 text-sm text-neutral-500">Loading listings…</p>}

          {!listingsLoading && userListings.length === 0 && !showListingsError && (
            <div className="py-16 text-center">
              <p className="heading text-xl">No listings yet.</p>
              <Link to="/create-listing" className="btn-secondary mt-6">
                Create your first listing
              </Link>
            </div>
          )}

          <ul className="divide-y divide-neutral-200">
            {userListings.map((listing) => (
              <li key={listing._id} className="flex items-center gap-4 py-5 sm:gap-6">
                <Link to={`/listing/${listing._id}`} className="shrink-0">
                  <img
                    src={listing.imageUrls?.[0] || listing.images?.[0]}
                    alt=""
                    onError={(e) => {
                      e.currentTarget.style.visibility = "hidden";
                    }}
                    className="h-16 w-20 bg-neutral-100 object-cover sm:h-20 sm:w-28"
                  />
                </Link>
                <div className="min-w-0 flex-1">
                  <Link
                    to={`/listing/${listing._id}`}
                    className="block truncate font-medium hover:underline hover:underline-offset-4"
                  >
                    {listing.name}
                  </Link>
                  <p className="mt-1 truncate text-sm text-neutral-500">
                    {listing.district ? (
                      formatLocation(listing)
                    ) : (
                      <span className="text-red-700">No district yet. Edit to add one.</span>
                    )}
                  </p>
                  <p className="mt-2 text-xs uppercase tracking-label text-neutral-600">
                    {listing.type === "rent" ? "Rent" : "Sale"} · {formatPrice(listingPrices(listing).price)}
                    {listing.offer && " · Offer"}
                  </p>
                </div>
                <div className="flex shrink-0 flex-col items-end sm:flex-row sm:items-center sm:gap-6">
                  <Link to={`/update-listing/${listing._id}`} className="btn-link !my-0">
                    Edit
                  </Link>
                  <button
                    onClick={() => handleListingDelete(listing)}
                    className="btn-link !my-0 text-neutral-500 hover:text-red-700"
                  >
                    Delete
                  </button>
                </div>
              </li>
            ))}
          </ul>
        </section>

        {/* Account */}
        <aside className="lg:sticky lg:top-28 lg:self-start">
          <form onSubmit={handleSubmit} className="flex flex-col gap-6 border border-neutral-200 p-6 sm:p-8">
            <h2 className="heading text-2xl">Account</h2>

            <div className="flex items-center gap-4">
              <input
                onChange={(e) => handleFileUpload(e.target.files[0])}
                type="file"
                ref={fileRef}
                hidden
                accept="image/*"
              />
              <img
                src={formData.avatar || currentUser?.avatar || DEFAULT_AVATAR}
                alt="Profile"
                className="h-16 w-16 object-cover"
              />
              <div>
                <button
                  type="button"
                  onClick={() => fileRef.current?.click()}
                  className="btn-link"
                >
                  Change photo
                </button>
                <p className="mt-1 text-xs text-neutral-500" aria-live="polite">
                  {fileUploadError
                    ? <span className="text-red-700">Upload failed. Use an image under 2 MB.</span>
                    : avatarUploading
                      ? `Uploading… ${filePercent}%`
                      : filePercent === 100
                        ? "Photo ready. Save to apply."
                        : "JPG or PNG, up to 2 MB"}
                </p>
              </div>
            </div>

            <div>
              <label htmlFor="username" className="label">Username</label>
              <input
                type="text"
                defaultValue={currentUser?.username}
                id="username"
                className="input"
                onChange={handleChange}
              />
            </div>
            <div>
              <label htmlFor="email" className="label">Email</label>
              <input
                type="email"
                value={currentUser?.email || ""}
                id="email"
                title="The owner email is set by ADMIN_EMAIL on the server"
                className="input"
                readOnly
              />
            </div>
            <div>
              <label htmlFor="password" className="label">New password</label>
              <input
                type="password"
                id="password"
                autoComplete="new-password"
                placeholder="Leave blank to keep current"
                className="input"
                onChange={handleChange}
              />
            </div>

            {error && <p className="error-text" role="alert">{error}</p>}
            {updateSuccess && <p className="text-sm text-ink">Your changes have been saved.</p>}

            <button disabled={loading || avatarUploading} className="btn-primary w-full">
              {loading ? "Saving…" : avatarUploading ? "Uploading photo…" : "Save changes"}
            </button>
          </form>
        </aside>
      </div>
    </div>
  );
}
