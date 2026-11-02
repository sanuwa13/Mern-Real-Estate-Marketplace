import { BrowserRouter, Routes, Route } from "react-router-dom";
import Home from "./pages/Home";
import About from "./pages/About";
import SignIn from "./pages/SignIn";
import Profile from "./pages/Profile";
import Header from "./components/Header";
import PrivateRoute from "./components/PrivateRoute";
import CreateListing from "./pages/CreateListing";
import UpdateListing from "./pages/UpdateListing";
import Listing from "./pages/Listing";
import Search from "./pages/Search";
import Footer from "./components/Footer";
import { useEffect } from "react";
import { useDispatch, useSelector } from "react-redux";
import { signoutUserSuccess, updateUserSuccess } from "./redux/user/userSlice";

export default function App() {
  const { currentUser } = useSelector((state) => state.user);
  const dispatch = useDispatch();

  // the saved login can outlive the server session, so check it once when the site opens
  useEffect(() => {
    if (!currentUser) return;
    const checkSession = async () => {
      try {
        const res = await fetch(`/api/user/${currentUser._id}`);
        if (res.ok) {
          dispatch(updateUserSuccess(await res.json()));
        } else if ([401, 403, 404].includes(res.status)) {
          dispatch(signoutUserSuccess());
        }
      } catch {
        // offline or server down: keep the saved login
      }
    };
    checkSession();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  return (
    <BrowserRouter>
      {/* 👈 Added flex container so Footer stays anchored at the bottom */}
      <div className="flex flex-col min-h-screen">
        <Header />

        {/* 👈 flex-1 expands to fill available space */}
        <main className="flex-1">
          <Routes>
            <Route path="/" element={<Home />} />
            <Route path="/about" element={<About />} />
            <Route path="/sign-in" element={<SignIn />} />
            <Route path="/listing/:listingId" element={<Listing />} />
            <Route path="/search" element={<Search />} />

            {/* Protected Routes */}
            <Route element={<PrivateRoute />}>
              <Route path="/profile" element={<Profile />} />
              <Route path="/create-listing" element={<CreateListing />} />
              <Route
                path="/update-listing/:listingId"
                element={<UpdateListing />}
              />
            </Route>
          </Routes>
        </main>

        <Footer />
      </div>
    </BrowserRouter>
  );
}
