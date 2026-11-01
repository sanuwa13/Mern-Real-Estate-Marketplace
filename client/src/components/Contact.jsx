import {useEffect, useState} from 'react'

export default function Contact({listing}) {
    const [LandOwner, setLandOwner] = useState(null);
    const [message, setMessage] = useState('');
    const [error, setError] = useState(false);


    useEffect(() => {
        const fetchLandOwner = async () => {
            try {
                const res = await fetch(`/api/user/${listing.userRef}`);
                const data = await res.json();
                if (data.success === false) {
                    setError(true);
                    return;
                }
                setLandOwner(data);
            } catch (error) {
                console.error("Error fetching land owner:", error);
                setError(true);
            }
        };

        fetchLandOwner();


    }, [listing.userRef])

    if (error) {
        return <p className="text-red-700 text-sm mt-3">Could not load the owner's contact details.</p>;
    }

  return (
    <>
    {LandOwner && (
        <div className="flex flex-col gap-2 mt-3">
            <p>Contact <span className="font-semibold">{LandOwner.username}</span> for{' '}
            <span className="font-semibold">{listing.name.toLowerCase()}</span></p>
            <textarea
                name="message"
                id="message"
                rows="3"
                value={message}
                onChange={(e) => setMessage(e.target.value)}
                placeholder="Enter your message here..."
                className="w-full border p-3 rounded-lg"
            ></textarea>
            <a
                href={`mailto:${LandOwner.email}?subject=${encodeURIComponent(`Regarding ${listing.name}`)}&body=${encodeURIComponent(message)}`}
                className="bg-slate-700 text-white text-center p-3 uppercase rounded-lg hover:opacity-95"
            >
                Send Message
            </a>
        </div>
    )}
    </>
  )
}
