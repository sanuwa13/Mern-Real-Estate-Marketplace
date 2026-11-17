import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useDispatch, useSelector } from 'react-redux';
import {
   signInStart,
   signInSuccess,
   signInFailure,
  } from '../redux/user/userSlice';

export default function SignIn() {
  const [formData, setFormData] = useState({});
  const { loading, error } = useSelector((state) => state.user);
  const navigate = useNavigate();
  const dispatch = useDispatch();

  const handleChange = (e) => {
    setFormData({
      ...formData,
      [e.target.id]: e.target.value,
    });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (!formData.email || !formData.password || formData.email.trim() === '' || formData.password.trim() === '') {
      dispatch(signInFailure('Please enter your email and password'));
      return;
    }

    try {
      dispatch(signInStart());
      const res = await fetch('/api/auth/signin', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(formData),
      });

      const data = await res.json();

      if (data.success === false) {
        dispatch(signInFailure(data.message));
        return;
      }

      dispatch(signInSuccess(data));
      navigate('/profile');
    } catch (error) {
      dispatch(signInFailure(error.message));
    }
  };

  return (
    <div className="grid min-h-[calc(100vh-5rem)] lg:grid-cols-2">
      <div className="hidden flex-col justify-end bg-ink p-12 text-white lg:flex">
        <p className="eyebrow text-neutral-500">Owner area</p>
        <p className="heading mt-4 max-w-md text-5xl text-white">
          Manage your listings in one place.
        </p>
      </div>

      <div className="flex items-center justify-center px-4 py-16 sm:px-6">
        <div className="w-full max-w-sm">
          <p className="eyebrow">Owner sign in</p>
          <h1 className="heading mt-3 text-5xl">Welcome back.</h1>
          <p className="mt-3 text-sm text-neutral-500">
            This area is for the site owner only.
          </p>

          <form onSubmit={handleSubmit} className="mt-10 flex flex-col gap-6" noValidate>
            <div>
              <label htmlFor="email" className="label">Email</label>
              <input
                type="email"
                id="email"
                autoComplete="email"
                className="input"
                onChange={handleChange}
              />
            </div>
            <div>
              <label htmlFor="password" className="label">Password</label>
              <input
                type="password"
                id="password"
                autoComplete="current-password"
                className="input"
                onChange={handleChange}
              />
            </div>

            {error && <p className="error-text" role="alert">{error}</p>}

            <button disabled={loading} className="btn-primary w-full">
              {loading ? 'Signing in…' : 'Sign in'}
            </button>
          </form>
        </div>
      </div>
    </div>
  );
}
