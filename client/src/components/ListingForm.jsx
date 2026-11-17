import { Link } from "react-router-dom";
import { FiArrowLeft, FiUploadCloud, FiX } from "react-icons/fi";

// Shared layout for the create and edit listing pages. Each page keeps its own state and save logic.
// Input ids matter: the pages' change handlers read the field name from them.

const FEATURES = [
  { id: "parking", label: "Parking spot" },
  { id: "furnished", label: "Furnished" },
  { id: "offer", label: "Special offer" },
];

function Section({ number, title, children }) {
  return (
    <section className="grid grid-cols-1 gap-6 border-t border-neutral-200 py-10 md:grid-cols-[14rem_minmax(0,1fr)] md:gap-12">
      <div>
        <p className="font-display text-sm font-semibold text-neutral-400">{number}</p>
        <h2 className="heading mt-1 text-xl">{title}</h2>
      </div>
      <div className="flex flex-col gap-6">{children}</div>
    </section>
  );
}

export default function ListingForm({
  eyebrow,
  title,
  submitLabel,
  submittingLabel,
  formData,
  files,
  setFiles,
  uploading,
  imageUploadError,
  error,
  loading,
  onChange,
  onSubmit,
  onImageUpload,
  onRemoveLocalFile,
  onRemoveUploadedImage,
}) {
  const imageUrls = formData.imageUrls || [];
  const priceUnit = formData.type === "rent" ? "Rs. per month" : "Rs.";

  return (
    <div className="page max-w-5xl py-12 sm:py-16">
      <Link to="/profile" className="btn-link text-neutral-500">
        <FiArrowLeft /> Dashboard
      </Link>
      <p className="eyebrow mt-10">{eyebrow}</p>
      <h1 className="heading mt-3 text-4xl sm:text-5xl">{title}</h1>

      <form onSubmit={onSubmit} className="mt-12">
        <Section number="01" title="Details">
          <div>
            <label htmlFor="name" className="label">Property name</label>
            <input
              type="text"
              id="name"
              className="input"
              placeholder="e.g. Three-bedroom house in Dehiwala"
              maxLength="62"
              minLength="10"
              required
              onChange={onChange}
              value={formData.name || ""}
            />
          </div>
          <div>
            <label htmlFor="description" className="label">Description</label>
            <textarea
              id="description"
              className="textarea"
              placeholder="Describe the property, the area and what makes it special."
              required
              onChange={onChange}
              value={formData.description || ""}
            />
          </div>
          <div className="grid grid-cols-1 gap-6 sm:grid-cols-2">
            <div>
              <label htmlFor="address" className="label">Address</label>
              <input
                type="text"
                id="address"
                className="input"
                required
                onChange={onChange}
                value={formData.address || ""}
              />
            </div>
            <div>
              <label htmlFor="phone" className="label">Contact phone</label>
              <input
                type="text"
                inputMode="tel"
                id="phone"
                className="input"
                placeholder="0771234567"
                required
                onChange={onChange}
                value={formData.phone || ""}
              />
            </div>
          </div>
        </Section>

        <Section number="02" title="Type & features">
          <fieldset>
            <legend className="label">Listing type</legend>
            <div className="grid max-w-xs grid-cols-2 border border-neutral-300">
              {[
                { id: "sale", label: "For sale" },
                { id: "rent", label: "For rent" },
              ].map((option) => (
                <label
                  key={option.id}
                  htmlFor={option.id}
                  className={`cursor-pointer py-3 text-center text-xs uppercase tracking-label transition-colors ${
                    formData.type === option.id ? "bg-ink text-white" : "text-neutral-600 hover:bg-neutral-100"
                  }`}
                >
                  <input
                    type="radio"
                    name="type"
                    id={option.id}
                    className="sr-only"
                    checked={formData.type === option.id}
                    onChange={onChange}
                  />
                  {option.label}
                </label>
              ))}
            </div>
          </fieldset>

          <fieldset>
            <legend className="label">Features</legend>
            <div className="flex flex-wrap gap-x-8 gap-y-3">
              {FEATURES.map((feature) => (
                <label key={feature.id} className="flex cursor-pointer items-center gap-3 text-sm">
                  <input
                    type="checkbox"
                    id={feature.id}
                    className="checkbox"
                    checked={Boolean(formData[feature.id])}
                    onChange={onChange}
                  />
                  {feature.label}
                </label>
              ))}
            </div>
          </fieldset>

          <div className="grid grid-cols-1 gap-6 sm:grid-cols-2">
            <div>
              <label htmlFor="bedrooms" className="label">Bedrooms</label>
              <input
                type="number"
                id="bedrooms"
                min="1"
                max="15"
                required
                className="input"
                onChange={onChange}
                value={formData.bedrooms}
              />
            </div>
            <div>
              <label htmlFor="bathrooms" className="label">Bathrooms</label>
              <input
                type="number"
                id="bathrooms"
                min="1"
                max="15"
                required
                className="input"
                onChange={onChange}
                value={formData.bathrooms}
              />
            </div>
          </div>
        </Section>

        <Section number="03" title="Price">
          <div className="grid grid-cols-1 gap-6 sm:grid-cols-2">
            <div>
              <label htmlFor="regularPrice" className="label">Regular price ({priceUnit})</label>
              <input
                type="number"
                id="regularPrice"
                min="500"
                max="10000000000"
                required
                className="input"
                onChange={onChange}
                value={formData.regularPrice}
              />
            </div>
            {formData.offer && (
              <div>
                <label htmlFor="discountPrice" className="label">Offer price ({priceUnit})</label>
                <input
                  type="number"
                  id="discountPrice"
                  min="0"
                  max="100000000"
                  required
                  className="input"
                  onChange={onChange}
                  value={formData.discountPrice}
                />
              </div>
            )}
          </div>
          {!formData.offer && (
            <p className="text-sm text-neutral-500">
              Tick “Special offer” above to add a reduced price.
            </p>
          )}
        </Section>

        <Section number="04" title="Photos">
          <p className="-mt-2 text-sm text-neutral-500">
            Up to 6 images, 2 MB each. The first photo is used as the cover.
          </p>

          <label
            htmlFor="images"
            className="flex cursor-pointer flex-col items-center justify-center gap-3 border border-dashed border-neutral-400 px-6 py-10 text-center transition-colors hover:border-ink hover:bg-neutral-50"
          >
            <FiUploadCloud className="text-2xl" />
            <span className="text-sm">
              <span className="font-medium underline underline-offset-4">Choose photos</span> from your device
            </span>
            <input
              type="file"
              id="images"
              accept="image/*"
              multiple
              className="sr-only"
              onChange={(e) => setFiles(Array.from(e.target.files))}
            />
          </label>

          {files.length > 0 && (
            <div className="flex flex-col gap-4">
              <ul className="divide-y divide-neutral-200 border-y border-neutral-200">
                {files.map((file, index) => (
                  <li key={`${file.name}-${index}`} className="flex items-center gap-4 py-3">
                    <img
                      src={URL.createObjectURL(file)}
                      alt=""
                      className="h-12 w-16 object-cover"
                    />
                    <span className="min-w-0 flex-1 truncate text-sm">{file.name}</span>
                    <span className="text-xs text-neutral-500">
                      {(file.size / 1024 / 1024).toFixed(2)} MB
                    </span>
                    <button
                      type="button"
                      onClick={() => onRemoveLocalFile(index)}
                      className="p-1 text-neutral-500 hover:text-ink"
                      aria-label={`Remove ${file.name}`}
                    >
                      <FiX />
                    </button>
                  </li>
                ))}
              </ul>
              <button
                type="button"
                disabled={uploading}
                onClick={onImageUpload}
                className="btn-secondary self-start"
              >
                {uploading ? "Uploading…" : `Upload ${files.length} ${files.length === 1 ? "photo" : "photos"}`}
              </button>
            </div>
          )}

          {imageUploadError && <p className="error-text" role="alert">{imageUploadError}</p>}

          {imageUrls.length > 0 && (
            <div className="grid grid-cols-2 gap-4 sm:grid-cols-3">
              {imageUrls.map((url, index) => (
                <div key={url} className="group relative aspect-[4/3] bg-neutral-100">
                  <img src={url} alt="" className="h-full w-full object-cover" />
                  {index === 0 && (
                    <span className="absolute left-2 top-2 bg-white px-2 py-1 text-[10px] font-medium uppercase tracking-label">
                      Cover
                    </span>
                  )}
                  <button
                    type="button"
                    onClick={() => onRemoveUploadedImage(index)}
                    className="absolute right-2 top-2 flex h-8 w-8 items-center justify-center bg-ink text-white hover:bg-neutral-700"
                    aria-label={`Remove photo ${index + 1}`}
                  >
                    <FiX />
                  </button>
                </div>
              ))}
            </div>
          )}
        </Section>

        <div className="flex flex-col gap-4 border-t border-ink pt-8 sm:flex-row sm:items-center sm:justify-between">
          {error ? (
            <p className="error-text" role="alert">{error}</p>
          ) : (
            <p className="text-sm text-neutral-500">Check the details before publishing.</p>
          )}
          <button
            type="submit"
            disabled={loading || uploading}
            className="btn-primary sm:min-w-[14rem]"
          >
            {loading ? submittingLabel : submitLabel}
          </button>
        </div>
      </form>
    </div>
  );
}
