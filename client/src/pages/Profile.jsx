import { useSelector } from 'react-redux';
import { useRef, useState, useEffect } from 'react';
import { getStorage, ref, uploadBytesResumable, getDownloadURL } from 'firebase/storage';
import { app } from '../firebase';

export default function Profile() {
  const fileRef = useRef(null);
  const { currentUser } = useSelector((state) => state.user);
  const [file, setFile] = useState(undefined);
  const [filePercent, setFilePerc] = useState(0); // State variable: filePercent
  
  // FIX HERE: Change filePerc to filePercent
  console.log(filePercent);  // ← FIXED!
  console.log(file);

  useEffect(() => {
    if(file) {
      handleFileUpload(file);
    }
  }, [file]);

  const handleFileUpload = (file) => {
    const storage = getStorage(app);
    const fileName = new Date().getTime() + file.name;
    const storageRef = ref(storage, fileName);
    const uploadTask = uploadBytesResumable(storageRef, file);

    uploadTask.on('state_changed',
      (snapshot) => {
        const progress = (snapshot.bytesTransferred / snapshot.totalBytes) * 100;
        setFilePerc(Math.round(progress)); // This updates filePercent state
      },
      (error) => {
        console.error('Upload error:', error);
      },
      () => {
        getDownloadURL(uploadTask.snapshot.ref).then((downloadURL) => {
          // Handle successful upload
        });
      }
    );
  }

  return (
    <div className='p-3 max-w-lg mx-auto'>
      <h1 className='text-3xl font-semibold text-center my-7'>Profile</h1>
      <form className='flex flex-col gap-4'>
        <input onChange={(e)=>setFile(e.target.files[0])}
          type="file" ref={fileRef} hidden accept='image/*'/>
        <img onClick={()=>fileRef.current.click()}
          src="https://encrypted-tbn0.gstatic.com/images?q=tbn:ANd9GcRcPVY5FK0TbQhg_WSDUKRuOEWDHwfvaHFCjA&s"
          alt="profile"
          className='h-24 w-24 rounded-full object-cover self-center cursor-pointer mt-2'
        />
        {/* Show upload progress */}
        {filePercent > 0 && filePercent < 100 && (
          <p className='text-center text-sm'>Uploading: {filePercent}%</p>
        )}
        {filePercent === 100 && (
          <p className='text-center text-sm text-green-600'>Upload complete!</p>
        )}
        
        <input 
          type="text" 
          placeholder='username' 
          id='username' 
          className='border p-3 rounded-lg' 
        />
        <input 
          type="email" 
          placeholder='email' 
          id='email' 
          className='border p-3 rounded-lg' 
        />
        <input 
          type="password" 
          placeholder='password' 
          id='password' 
          className='border p-3 rounded-lg' 
        />
        <button className='bg-slate-700 text-white rounded-lg p-3 uppercase hover:opacity-95 disabled:opacity-80'>
          Update
        </button>
      </form>
      <div className='flex justify-between mt-5'>
        <span className='text-red-700 cursor-pointer'>Delete Account</span>
        <span className='text-red-700 cursor-pointer'>Sign Out</span>
      </div>
    </div>
  )
}