// src/components/layout/Footer.jsx - Simple Version
import React from 'react';
import { Link } from 'react-router-dom';

const Footer = () => {
  const currentYear = new Date().getFullYear();

  return (
    <footer className="bg-gray-900 text-white">
      <div className="max-w-7xl mx-auto px-4 py-8 sm:px-6 lg:px-8">
        <div className="grid grid-cols-2 md:grid-cols-4 gap-6">
          <div>
            <h3 className="text-sm font-semibold mb-3">Product</h3>
            <ul className="space-y-1">
              <li><Link to="/features" className="text-gray-400 hover:text-white text-sm">Features</Link></li>
              <li><Link to="/resources" className="text-gray-400 hover:text-white text-sm">Resources</Link></li>
              <li><Link to="/pricing" className="text-gray-400 hover:text-white text-sm">Pricing</Link></li>
            </ul>
          </div>
          <div>
            <h3 className="text-sm font-semibold mb-3">Company</h3>
            <ul className="space-y-1">
              <li><Link to="/about" className="text-gray-400 hover:text-white text-sm">About</Link></li>
              <li><Link to="/contact" className="text-gray-400 hover:text-white text-sm">Contact</Link></li>
              <li><Link to="/careers" className="text-gray-400 hover:text-white text-sm">Careers</Link></li>
            </ul>
          </div>
          <div>
            <h3 className="text-sm font-semibold mb-3">Resources</h3>
            <ul className="space-y-1">
              <li><Link to="/blog" className="text-gray-400 hover:text-white text-sm">Blog</Link></li>
              <li><Link to="/help" className="text-gray-400 hover:text-white text-sm">Help Center</Link></li>
              <li><Link to="/community" className="text-gray-400 hover:text-white text-sm">Community</Link></li>
            </ul>
          </div>
          <div>
            <h3 className="text-sm font-semibold mb-3">Legal</h3>
            <ul className="space-y-1">
              <li><Link to="/privacy" className="text-gray-400 hover:text-white text-sm">Privacy</Link></li>
              <li><Link to="/terms" className="text-gray-400 hover:text-white text-sm">Terms</Link></li>
            </ul>
          </div>
        </div>

        <div className="border-t border-gray-800 mt-6 pt-6 text-center">
          <p className="text-gray-500 text-sm">© {currentYear} StudySphere. All rights reserved.</p>
        </div>
      </div>
    </footer>
  );
};

export default Footer;