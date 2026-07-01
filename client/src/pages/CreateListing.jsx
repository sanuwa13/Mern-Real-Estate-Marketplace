import { useState } from 'react';
import { getStorage, getDownloadURL, ref, uploadBytesResumable } from 'firebase/storage';
import { app } from '../firebase';

export default function CreateListing() {
  const [files, setFiles] = useState([]);
  const [formData, setFormData] = useState({
    imageUrls: [],
  });
  const [imageUploadError, setImageUploadError] = useState(false);
  const [uploading, setUploading] = useState(false);
  
  console.log(formData);

  const handleImageSubmit = (e) => {
    if (files.length > 0 && files.length + formData.imageUrls.length < 7) {
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
          setFiles([]); // Clear local selection box once uploaded
        })
        .catch((err) => {
          setImageUploadError('Image upload failed (2 MB max per image)');
          setUploading(false);
        });
    } else {
      setImageUploadError('You can only upload 6 images per listing');
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
          const progress = (snapshot.bytesTransferred / snapshot.totalBytes) * 100;
          console.log(`Upload is ${progress} % done`);
        },
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

  // Removes a local file from the queue BEFORE uploading
  const handleRemoveLocalFile = (index) => {
    setFiles(files.filter((_, i) => i !== index));
  };

  // 1. RESTORING: Removes an already uploaded image from Firebase state
  const handleRemoveUploadedImage = (index) => {
    setFormData({
      ...formData,
      imageUrls: formData.imageUrls.filter((_, i) => i !== index),
    });
  };

  return (
    <main className='p-3 max-w-4xl mx-auto'>
      <h1 className='text-3xl font-semibold text-center my-7'>
        Create Listing
      </h1>
      <form className='flex flex-col sm:flex-row gap-4'>
        <div className='flex flex-col gap-4 flex-1'>
          <input type="text" placeholder='Name' className='p-3 border rounded-lg' id='name' maxLength='62' minLength='10' required/>
          <input type="text" placeholder='Description' className='p-3 border rounded-lg' id='description' required/>
          <input type="text" placeholder='Address' className='p-3 border rounded-lg' id='address' required/>
          
          <div className='flex gap-6 flex-wrap'>
            <div className='flex gap-2'>
              <input type="checkbox" id='sale' className='w-5' />
              <span>Sell</span>
            </div>
            <div className='flex gap-2'>
              <input type="checkbox" id='rent' className='w-5' />
              <span>Rent</span>
            </div>
            <div className='flex gap-2'>
              <input type="checkbox" id='parking' className='w-5' />
              <span>Parking Spot</span>
            </div>
            <div className='flex gap-2'>
              <input type="checkbox" id='furnished' className='w-5' />
              <span>Furnished</span>
            </div>
            <div className='flex gap-2'>
              <input type="checkbox" id='offer' className='w-5' />
              <span>Offer</span>
            </div>
          </div>
          
          <div className='flex flex-wrap gap-6'>
            <div className='flex items-center gap-2'>
              <input type="number" id='bedrooms' min='1' max='15' required className='p-3 border border-gray-300 rounded-lg'/>
              <p>Beds</p>
            </div>
            <div className='flex items-center gap-2'>
              <input type="number" id='bathrooms' min='1' max='15' required className='p-3 border border-gray-300 rounded-lg'/>
              <p>Baths</p>
            </div>
            <div className='flex items-center gap-2'>
              <input type="number" id='regularPrice' min='1' required className='p-3 border border-gray-300 rounded-lg'/>
              <div className='flex flex-col items-center'>
                <p>Regular Price</p>
                <span className='text-xs'>(Rs. / month)</span>
              </div>
            </div>
            <div className='flex items-center gap-2'>
              <input type="number" id='discountPrice' min='0' required className='p-3 border border-gray-300 rounded-lg'/>
              <div className='flex flex-col items-center'>
                <p>Discounted Price</p>
                <span className='text-xs'>(Rs. / month)</span>
              </div>
            </div>
          </div>
        </div>
        
        <div className="flex flex-col flex-1 gap-4">
          <p className="font-semibold">Images:
            <span className='font-normal text-gray-600 ml-2'>The first image will be the cover (max 6)</span>
          </p>
          <div className="flex gap-4">
            <input 
              onChange={(e) => setFiles(Array.from(e.target.files))} 
              className='p-3 border border-gray-300 rounded w-full' 
              type="file" 
              id='images' 
              accept="image/*" 
              multiple 
            />
            <button 
              type='button' 
              disabled={uploading} 
              onClick={handleImageSubmit}
              className='p-3 text-green-700 border border-green-700 rounded uppercase hover:shadow-lg disabled:opacity-80'
            >
              {uploading ? 'Uploading...' : 'Upload'}
            </button>
          </div>
          
          {imageUploadError && <p className='text-red-700 text-sm'>{imageUploadError}</p>}

          {/* PREVIEW CONTAINER 1: Local Selection Previews (Before Uploading) */}
          {files.length > 0 && (
            <div className="flex flex-col gap-2 p-3 border border-dashed border-slate-300 rounded-lg bg-slate-50">
              <p className="text-xs font-semibold text-slate-500 uppercase tracking-wider">Selected (Ready to Upload):</p>
              {files.map((file, index) => (
                <div key={index} className="flex justify-between items-center bg-white p-2 rounded-md border text-sm">
                  <div className="flex items-center gap-3">
                    <img src={URL.createObjectURL(file)} alt="local preview" className="w-14 h-14 object-cover rounded" />
                    <span className="text-gray-700 truncate max-w-[180px] font-medium">{file.name}</span>
                  </div>
                  <div className="flex items-center gap-3">
                    <span className="text-xs text-gray-400">{(file.size / 1024 / 1024).toFixed(2)} MB</span>
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

          {/* PREVIEW CONTAINER 2: Permanent Uploaded Previews (Live on Firebase) */}
          {formData.imageUrls.length > 0 && (
            <div className="flex flex-col gap-2 p-3 border border-solid border-green-300 rounded-lg bg-green-50/40">
              <p className="text-xs font-semibold text-green-700 uppercase tracking-wider">Uploaded Images (Live on Cloud):</p>
              {formData.imageUrls.map((url, index) => (
                <div key={url} className="flex justify-between items-center bg-white p-2 rounded-md border text-sm">
                  <div className="flex items-center gap-3">
                    <img src={url} alt='listing image' className='w-14 h-14 object-cover rounded-lg'/>
                    <span className="text-xs text-green-600 italic font-medium">Uploaded Successfully</span>
                  </div>
                  <button 
                    type='button' 
                    onClick={() => handleRemoveUploadedImage(index)} 
                    className='p-2 text-red-700 hover:text-red-900 text-xs uppercase font-semibold border border-transparent hover:border-red-200 rounded bg-red-50 transition-all'
                  >
                    Delete From Cloud
                  </button>
                </div>
              ))}
            </div>
          )}
          
          <button type='submit' className='p-3 bg-slate-700 text-white rounded-lg uppercase hover:opacity-95 disabled:opacity-80'>
            Create Listing
          </button>
        </div>
      </form>
    </main>
  );
}