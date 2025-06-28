import React, { useState } from 'react';
import { FaFacebook, FaInstagram, FaTwitter } from 'react-icons/fa';

const Footer = () => {
  const [email, setEmail] = useState('');

  const handleNewsletterSubmit = (e) => {
    e.preventDefault();
    // Handle newsletter signup logic here
    console.log('Newsletter signup:', email);
    alert('Thank you for subscribing to our newsletter!');
    setEmail('');
  };

  return (
    <footer className="py-4" style={{ backgroundColor: '#000000', color: 'white' }}>
      <div className="container">
        {/* Newsletter Section */}
        <div className="row justify-content-center mb-4">
          <div className="col-md-6 text-center">
            <h5 className="mb-3">Stay Updated</h5>
            <p className="small mb-3">Subscribe to our newsletter for the latest updates and exclusive offers!</p>
            <form onSubmit={handleNewsletterSubmit} className="d-flex gap-2 justify-content-center">
              <input
                type="email"
                className="form-control"
                placeholder="Enter your email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                required
                style={{ maxWidth: '250px' }}
              />
              <button
                type="submit"
                className="btn btn-light btn-sm px-3"
                style={{ whiteSpace: 'nowrap' }}
              >
                Subscribe
              </button>
            </form>
          </div>
        </div>

        {/* Divider */}
        <hr className="border-secondary" />

        <div className="text-center">
          {/* Quick Links Section */}
          <div className="mb-3">
            <a href="#" className="text-white text-decoration-none mx-2">Home</a>
            <a href="#" className="text-white text-decoration-none mx-2">About</a>
            <a href="#" className="text-white text-decoration-none mx-2">Shop</a>
            <a href="#" className="text-white text-decoration-none mx-2">Contact</a>
          </div>

          {/* Social Media Icons Section */}
          <div className="mb-3">
            <a href="#" className="text-white mx-2" style={{ fontSize: '1.2rem' }}>
              <FaFacebook />
            </a>
            <a href="#" className="text-white mx-2" style={{ fontSize: '1.2rem' }}>
              <FaTwitter />
            </a>
            <a href="#" className="text-white mx-2" style={{ fontSize: '1.2rem' }}>
              <FaInstagram />
            </a>
          </div>

          {/* Copyright Section */}
          <p className="small mb-0">&copy; 2024 SHOPSPHERE</p>
        </div>
      </div>
    </footer>
  );
};

export default Footer;