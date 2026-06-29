import { useSelector } from 'react-redux';
import { useRef, useState, useEffect } from 'react';
import { getStorage, ref, uploadBytesResumable, getDownloadURL } from 'firebase/storage';
import { app } from '../firebase';
import { 
  updateUserStart, 
  updateUserSuccess, 
  updateUserFailure, 
  deleteUserStart, 
  deleteUserSuccess, 
  deleteUserFailure, 
  signoutUserFailure, 
  signoutUserStart, 
  signoutUserSuccess 
} from '../redux/user/userSlice';
import { useDispatch } from 'react-redux';
import { Link } from 'react-router-dom'; // 1. Fixed: Capitalized Link

export default function Profile() {
  const fileRef = useRef(null);
  const { currentUser, loading, error } = useSelector((state) => state.user);
  
  const [file, setFile] = useState(undefined);
  const [filePercent, setFilePerc] = useState(0);
  const [fileUploadError, setFileUploadError] = useState(false);
  const [formData, setFormData] = useState({});
  const [updateSuccess, setUpdateSuccess] = useState(false);
  const dispatch = useDispatch();

  useEffect(() => {
    if (file) {
      handleFileUpload(file);
    }
  }, [file]);

  const handleFileUpload = (file) => {
    const storage = getStorage(app);
    const fileName = new Date().getTime() + file.name;
    const storageRef = ref(storage, fileName);
    const uploadTask = uploadBytesResumable(storageRef, file);

    setFileUploadError(false);

    uploadTask.on(
      'state_changed',
      (snapshot) => {
        const progress = (snapshot.bytesTransferred / snapshot.totalBytes) * 100;
        setFilePerc(Math.round(progress));
      },
      (error) => {
        console.error('Upload error:', error);
        setFileUploadError(true);
      },
      () => {
        getDownloadURL(uploadTask.snapshot.ref).then((downloadURL) =>
          setFormData({ ...formData, avatar: downloadURL })
        );
      }
    );
  };

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.id]: e.target.value });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      setUpdateSuccess(false);
      dispatch(updateUserStart());
      
      const res = await fetch(`/api/user/update/${currentUser._id}`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(formData),
      });
      
      const data = await res.json();
      if (data.success === false) {
        dispatch(updateUserFailure(data.message));
        return;
      }
      dispatch(updateUserSuccess(data));
      setUpdateSuccess(true);
    } catch (error) {
      dispatch(updateUserFailure(error.message));
    }
  };

  const handleDeleteUser = async () => {
    try {
      dispatch(deleteUserStart());
      const res = await fetch(`/api/user/delete/${currentUser._id}`, {
        method: 'DELETE',
      });
      const data = await res.json();
      if (data.success === false) {
        dispatch(deleteUserFailure(data.message));
        return;
      }
      dispatch(deleteUserSuccess());
    } catch (error) {
      dispatch(deleteUserFailure(error.message));
    }
  };

  const handleSignOut = async () => {
    try {
      dispatch(signoutUserStart());
      const res = await fetch('/api/auth/signout');
      const data = await res.json();
      if (data.success === false) {
        dispatch(signoutUserFailure(data.message));
        return;
      }
      dispatch(signoutUserSuccess(data));
    } catch (error) {
      // 2. Fixed: Changed data.message to error.message
      dispatch(signoutUserFailure(error.message));
    }
  };

  return (
    <div className='p-3 max-w-lg mx-auto'>
      <h1 className='text-3xl font-semibold text-center my-7'>Profile</h1>
      <form onSubmit={handleSubmit} className='flex flex-col gap-4'>
        <input 
          onChange={(e) => setFile(e.target.files[0])}
          type="file" 
          ref={fileRef} 
          hidden 
          accept='image/*'
        />
        
        <img 
          onClick={() => fileRef.current.click()}
          src={formData.avatar || currentUser.avatar || "https://encrypted-tbn0.gstatic.com/images?q=tbn:ANd9GcRcPVY5FK0TbQhg_WSDUKRuOEWDHwfvaHFCjA&s"}
          alt="profile"
          className='h-24 w-24 rounded-full object-cover self-center cursor-pointer mt-2'
        />
       
        <div className='text-center text-sm'>
          {fileUploadError ? (
            <span className='text-red-700'>Error Image upload (Image must be less than 2MB)</span>
          ) : filePercent > 0 && filePercent < 100 ? (
            <span className='text-slate-700'>{`Uploading: ${filePercent}%`}</span>
          ) : filePercent === 100 ? (
            <span className='text-green-600'>Image Successfully Uploaded!</span>
          ) : (
            ''
          )}
        </div>
        
        <input 
          type="text" 
          placeholder='username' 
          defaultValue={currentUser.username}
          id='username' 
          className='border p-3 rounded-lg' 
          onChange={handleChange}
        />
        <input 
          type="email" 
          placeholder='email' 
          defaultValue={currentUser.email}
          id='email' 
          className='border p-3 rounded-lg' 
          onChange={handleChange}
        />
        <input 
          type="password" 
          placeholder='password' 
          id='password' 
          className='border p-3 rounded-lg' 
          onChange={handleChange}
        />
        
        <button 
          disabled={loading} 
          className='bg-slate-700 text-white rounded-lg p-3 uppercase hover:opacity-95 disabled:opacity-80'
        >
          {loading ? 'Loading...' : 'Update'}
        </button>

        {/* 3. Fixed: Changed to capitalized Link and className */}
        <Link 
          className='bg-green-700 text-white p-3 rounded-lg uppercase text-center hover:opacity-95'  
          to={'/create-listing'}
        >
          Create Listing
        </Link>
      </form>
      
      <div className='flex justify-between mt-5'>
        <span onClick={handleDeleteUser} className='text-red-700 cursor-pointer'>Delete Account</span>
        <span onClick={handleSignOut} className='text-red-700 cursor-pointer'>Sign Out</span>
      </div>

      <p className='text-red-700 mt-5'>{error ? error : ''}</p>
      <p className='text-green-700 mt-5'>{updateSuccess ? 'Profile updated successfully!' : ''}</p>
    </div>
  );
}