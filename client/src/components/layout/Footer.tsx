import React from "react";

const Footer: React.FC = () => {
  return (
    <footer className="bg-gray-900 text-white">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-8">
          {/* Logo and Description */}
          <div className="col-span-1 md:col-span-1">
            <h3 className="text-xl font-bold text-indigo-400">
              On-Chain Auctions
            </h3>
            <p className="mt-2 text-gray-300 text-sm">
              Decentralized platform for secure, transparent, and trustless
              auctions for digital and physical assets.
            </p>
          </div>

          {/* Quick Links */}
          <div>
            <h4 className="text-lg font-semibold mb-4 text-gray-100">
              Quick Links
            </h4>
            <ul className="space-y-2">
              <li>
                <a
                  href="/auctions"
                  className="text-gray-300 hover:text-indigo-400 transition"
                >
                  All Auctions
                </a>
              </li>
              <li>
                <a
                  href="/create"
                  className="text-gray-300 hover:text-indigo-400 transition"
                >
                  Create Auction
                </a>
              </li>
              <li>
                <a
                  href="/my-bids"
                  className="text-gray-300 hover:text-indigo-400 transition"
                >
                  My Bids
                </a>
              </li>
              <li>
                <a
                  href="/faq"
                  className="text-gray-300 hover:text-indigo-400 transition"
                >
                  FAQ
                </a>
              </li>
            </ul>
          </div>

          {/* Resources */}
          <div>
            <h4 className="text-lg font-semibold mb-4 text-gray-100">
              Resources
            </h4>
            <ul className="space-y-2">
              <li>
                <a
                  href="/docs"
                  className="text-gray-300 hover:text-indigo-400 transition"
                >
                  Documentation
                </a>
              </li>
              <li>
                <a
                  href="/tutorials"
                  className="text-gray-300 hover:text-indigo-400 transition"
                >
                  Tutorials
                </a>
              </li>
              <li>
                <a
                  href="/api"
                  className="text-gray-300 hover:text-indigo-400 transition"
                >
                  API
                </a>
              </li>
              <li>
                <a
                  href="/support"
                  className="text-gray-300 hover:text-indigo-400 transition"
                >
                  Support
                </a>
              </li>
            </ul>
          </div>

          {/* Connect */}
          <div>
            <h4 className="text-lg font-semibold mb-4 text-gray-100">
              Connect With Us
            </h4>
            <div className="flex space-x-4">
              <a
                href="https://twitter.com"
                target="_blank"
                rel="noopener noreferrer"
                className="text-gray-300 hover:text-blue-400 transition"
              >
                <div className="h-6 w-6 bg-amber-600 rounded-full" />
              </a>
              <a
                href="https://discord.com"
                target="_blank"
                rel="noopener noreferrer"
                className="text-gray-300 hover:text-indigo-500 transition"
              >
                <div className="h-6 w-6 bg-amber-600 rounded-full" />
              </a>
              <a
                href="https://github.com"
                target="_blank"
                rel="noopener noreferrer"
                className="text-gray-300 hover:text-gray-400 transition"
              >
                <div className="h-6 w-6 bg-amber-600 rounded-full" />
              </a>
              <a
                href="https://linkedin.com"
                target="_blank"
                rel="noopener noreferrer"
                className="text-gray-300 hover:text-blue-600 transition"
              >
                <div className="h-6 w-6 bg-amber-600 rounded-full" />
              </a>
            </div>
            <p className="mt-4 text-sm text-gray-400">
              Subscribe to our newsletter for updates on new auctions and
              features.
            </p>
            <div className="mt-2 flex">
              <input
                type="email"
                placeholder="Your email"
                className="px-4 py-2 text-sm rounded-l focus:outline-none bg-gray-800 text-white"
              />
              <button className="bg-indigo-600 text-white px-4 py-2 text-sm rounded-r hover:bg-indigo-700 transition">
                Subscribe
              </button>
            </div>
          </div>
        </div>

        {/* Divider */}
        <div className="border-t border-gray-700 mt-8 pt-8 flex flex-col md:flex-row justify-between items-center">
          <p className="text-sm text-gray-400">
            © {new Date().getFullYear()} On-Chain Auctions. All rights reserved.
          </p>
          <div className="mt-4 md:mt-0">
            <ul className="flex space-x-6 text-sm">
              <li>
                <a
                  href="/terms"
                  className="text-gray-400 hover:text-indigo-400 transition"
                >
                  Terms
                </a>
              </li>
              <li>
                <a
                  href="/privacy"
                  className="text-gray-400 hover:text-indigo-400 transition"
                >
                  Privacy
                </a>
              </li>
              <li>
                <a
                  href="/cookies"
                  className="text-gray-400 hover:text-indigo-400 transition"
                >
                  Cookies
                </a>
              </li>
            </ul>
          </div>
        </div>
      </div>
    </footer>
  );
};

export default Footer;
