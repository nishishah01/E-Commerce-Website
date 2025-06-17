import React from 'react';
import { Link } from 'react-router-dom';
const NotFoundPage = () => {
  return (
    <header className="py-3 my-5" style={{ backgroundColor: "#000000" }}>
      <div className="container px-4 px-lg-5 my-5">
        <h1 className="display-4 fw-bold text-white">Page Not Found</h1>
        <p className="lead fw-normal text-white mb-4">
          The page you tried accessing does not exist.
        </p>
        <Link to="/" className="btn btn-light btn-lg rounded-pill px-4 py-2">
          Back Home
        </Link>
      </div>
    </header>
  );
};

export default NotFoundPage;
