import {useEffect, useState} from 'react'

export default function Contact({listing}) {
    const [LandOwner, setLandOwner] = useState(null);


    useEffect(() => {
        const fetchLandOwner = async () => {
            try {
                const res = await fetch(`/api/user/${listing.userRef}`);
                const data = await res.json();
                setLandOwner(data);
            } catch (error) {
                console.error("Error fetching land owner:", error);
            }
        };

        fetchLandOwner();


    }, [listing.userRef])
  return (
    <>
    {LandOwner && (
        <div className="">
            <p>contact <span>{LandOwner.username}</span> for
            <span>{listing.name.toLowerCase()}</span></p> 
        </div>
    )}
    </>
  )
}
    
