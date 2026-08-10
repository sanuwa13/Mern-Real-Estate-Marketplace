import { Link } from 'react-router-dom';
import { 
  FaHome, 
  FaPhoneAlt, 
  FaEnvelope, 
  FaMapMarkerAlt, 
  FaFacebookF, 
  FaTwitter, 
  FaInstagram, 
  FaLinkedinIn 
} from 'react-icons/fa';

export default function Footer() {
  return (
    <footer className='bg-slate-900 text-slate-300 border-t border-slate-800 pt-12 pb-6'>
      <div className='max-w-6xl mx-auto px-4'>
        {/* Main Footer Grid */}
        <div className='grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8 pb-10 border-b border-slate-800/80'>
          
          {/* Column 1: Brand Info */}
          <div className='flex flex-col gap-4'>
            <Link to='/' className='flex items-center gap-2 text-white font-bold text-xl tracking-wide'>
              <div className='bg-blue-600 p-2 rounded-lg text-white'>
                <FaHome className='text-lg' />
              </div>
              <span className='text-transparent bg-clip-text bg-gradient-to-r from-blue-400 to-emerald-400'>
                Own Property
              </span>
            </Link>
            <p className='text-xs sm:text-sm text-slate-400 leading-relaxed font-light'>
              Your trusted partner for buying, selling, and renting real estate. Finding your dream property has never been easier or more reliable.
            </p>
            {/* Social Icons */}
            <div className='flex items-center gap-3 mt-2'>
              <a
                href='https://facebook.com'
                target='_blank'
                rel='noreferrer'
                className='w-9 h-9 bg-slate-800 hover:bg-blue-600 text-slate-300 hover:text-white rounded-lg flex items-center justify-center transition-all'
              >
                <FaFacebookF className='text-sm' />
              </a>
              <a
                href='https://twitter.com'
                target='_blank'
                rel='noreferrer'
                className='w-9 h-9 bg-slate-800 hover:bg-blue-400 text-slate-300 hover:text-white rounded-lg flex items-center justify-center transition-all'
              >
                <FaTwitter className='text-sm' />
              </a>
              <a
                href='https://instagram.com'
                target='_blank'
                rel='noreferrer'
                className='w-9 h-9 bg-slate-800 hover:bg-pink-600 text-slate-300 hover:text-white rounded-lg flex items-center justify-center transition-all'
              >
                <FaInstagram className='text-sm' />
              </a>
              <a
                href='https://linkedin.com'
                target='_blank'
                rel='noreferrer'
                className='w-9 h-9 bg-slate-800 hover:bg-blue-700 text-slate-300 hover:text-white rounded-lg flex items-center justify-center transition-all'
              >
                <FaLinkedinIn className='text-sm' />
              </a>
            </div>
          </div>

          {/* Column 2: Quick Links */}
          <div className='flex flex-col gap-3'>
            <h3 className='text-white font-semibold text-sm uppercase tracking-wider mb-1'>
              Quick Links
            </h3>
            <Link to='/' className='text-sm text-slate-400 hover:text-white transition-colors w-fit'>
              Home
            </Link>
            <Link to='/about' className='text-sm text-slate-400 hover:text-white transition-colors w-fit'>
              About Us
            </Link>
            <Link to='/search' className='text-sm text-slate-400 hover:text-white transition-colors w-fit'>
              Search Properties
            </Link>
            <Link to='/create-listing' className='text-sm text-slate-400 hover:text-white transition-colors w-fit'>
              List Your Property
            </Link>
          </div>

          {/* Column 3: Property Types */}
          <div className='flex flex-col gap-3'>
            <h3 className='text-white font-semibold text-sm uppercase tracking-wider mb-1'>
              Categories
            </h3>
            <Link to='/search?type=sale' className='text-sm text-slate-400 hover:text-white transition-colors w-fit'>
              Properties for Sale
            </Link>
            <Link to='/search?type=rent' className='text-sm text-slate-400 hover:text-white transition-colors w-fit'>
              Properties for Rent
            </Link>
            <Link to='/search?offer=true' className='text-sm text-slate-400 hover:text-white transition-colors w-fit'>
              Special Discount Offers
            </Link>
            <Link to='/search?parking=true' className='text-sm text-slate-400 hover:text-white transition-colors w-fit'>
              Places with Parking
            </Link>
          </div>

          {/* Column 4: Contact Information */}
          <div className='flex flex-col gap-3'>
            <h3 className='text-white font-semibold text-sm uppercase tracking-wider mb-1'>
              Contact Us
            </h3>
            <div className='flex items-start gap-3 text-sm text-slate-400'>
              <FaMapMarkerAlt className='text-blue-500 text-base mt-0.5 shrink-0' />
              <span>123 Main Street, Colombo, Sri Lanka</span>
            </div>
            <div className='flex items-center gap-3 text-sm text-slate-400'>
              <FaPhoneAlt className='text-blue-500 text-sm shrink-0' />
              <span>+94 77 123 4567</span>
            </div>
            <div className='flex items-center gap-3 text-sm text-slate-400'>
              <FaEnvelope className='text-blue-500 text-sm shrink-0' />
              <span>support@ownproperty.com</span>
            </div>
          </div>

        </div>

        {/* Bottom Copyright Bar */}
        <div className='pt-6 flex flex-col sm:flex-row items-center justify-between gap-4 text-xs text-slate-500'>
          <p>© {new Date().getFullYear()} Own Property. All rights reserved.</p>
          <div className='flex gap-6'>
            <Link to='#' className='hover:text-slate-300 transition-colors'>
              Privacy Policy
            </Link>
            <Link to='#' className='hover:text-slate-300 transition-colors'>
              Terms of Service
            </Link>
            <Link to='#' className='hover:text-slate-300 transition-colors'>
              Support
            </Link>
          </div>
        </div>
      </div>
    </footer>
  );
}