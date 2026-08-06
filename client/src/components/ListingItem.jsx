import { Link } from 'react-router-dom'; 
import { MdLocationOn } from 'react-icons/md';

export default function ListingItem({ listing }) {
  const coverImage =
    listing?.imageUrls?.[0] ||
    listing?.imagesUrls?.[0] ||
    'https://53.fs1.hubspotusercontent-na1.net/hub/53/hubfs/Sales_Blog/real-estate-business-compressor.png';

  const price = listing.offer
    ? Number(listing?.discountPrice ?? listing?.discountedPrice ?? 0)
    : Number(listing?.regularPrice || 0);

  return (
    /* 👈 Updated width to sm:w-[265px] so 4 cards fit side-by-side with gap-4 */
    <div className='bg-white shadow-md hover:shadow-lg transition-shadow overflow-hidden rounded-lg w-full sm:w-[265px]'>
      <Link to={`/listing/${listing._id}`}>
        <img
          src={coverImage}
          alt='listing cover'
          className='w-full h-[200px] sm:h-[170px] object-cover hover:scale-105 transition-transform duration-300'
        />
        <div className='p-3 flex flex-col gap-2 w-full'>
          <p className='text-base font-semibold text-slate-700 truncate'>
            {listing.name}
          </p>
          <div className='flex items-center gap-1'>
            <MdLocationOn className='h-4 w-4 text-green-700' />
            <p className='text-xs text-gray-600 truncate w-full'>
              {listing.address}
            </p>
          </div>
          <p className='text-xs text-gray-600 line-clamp-2'>
            {listing.description}
          </p>
          <p className='mt-1 font-semibold text-slate-500 text-sm'>
            Rs. {price.toLocaleString("en-US")}
            {listing.type === 'rent' && ' / month'}
          </p>
          <div className='text-slate-700 flex gap-3 text-xs font-bold'>
            <div>
              {listing.bedrooms > 1 ? `${listing.bedrooms} Beds` : `${listing.bedrooms} Bed`}
            </div>
            <div>
              {listing.bathrooms > 1 ? `${listing.bathrooms} Baths` : `${listing.bathrooms} Bath`}
            </div>
          </div>
        </div>
      </Link>
    </div>
  );
}