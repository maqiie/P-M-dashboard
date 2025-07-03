import React from 'react';
import { Link } from 'react-router-dom';

export default function NotFound() {
  return (
    <div className="min-h-screen flex flex-col items-center justify-center bg-gray-50 px-4">
      <h1 className="text-6xl font-bold text-gray-800 mb-4">404</h1>
      <p className="text-xl text-gray-600 mb-8">Oops! The page you are looking for does not exist.</p>
      <Link
        to="/"
        className="text-indigo-600 hover:text-indigo-800 font-semibold"
      >
        Go back home
      </Link>
    </div>
  );
}
