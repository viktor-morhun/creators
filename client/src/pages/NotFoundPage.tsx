import React from "react";
import { Link } from "react-router-dom";

const NotFoundPage: React.FC = () => {
  return (
    <div className="min-h-screen bg-gray-900 flex items-center justify-center px-4">
      <div className="max-w-md w-full text-center">
        <div className="relative mb-8">
          <div className="absolute inset-0 bg-gradient-to-r from-purple-600 to-blue-600 opacity-20 blur-3xl rounded-full"></div>
          <h1 className="text-9xl font-bold text-white relative z-10">
            <span className="inline-block transform -rotate-12 text-transparent bg-clip-text bg-gradient-to-r from-purple-400 to-blue-500">
              4
            </span>
            <span className="inline-block transform rotate-12 text-transparent bg-clip-text bg-gradient-to-r from-blue-400 to-purple-500">
              0
            </span>
            <span className="inline-block transform -rotate-6 text-transparent bg-clip-text bg-gradient-to-r from-purple-400 to-blue-500">
              4
            </span>
          </h1>
          <div className="absolute -bottom-4 left-1/2 transform -translate-x-1/2 w-24 h-1 bg-gradient-to-r from-purple-500 to-blue-500 rounded-full"></div>
        </div>

        <h2 className="text-2xl md:text-3xl font-bold mb-4 text-white">
          Page Not Found
        </h2>

        <p className="text-gray-300 mb-8 text-lg">
          The auction you're looking for may have ended or the page doesn't
          exist.
        </p>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <Link
            to="/"
            className="px-6 py-3 bg-gradient-to-r from-purple-600 to-blue-500 hover:from-purple-700 hover:to-blue-600 text-white font-medium rounded-lg transition-all transform hover:scale-105"
          >
            Return Home
          </Link>
          <Link
            to="/auctions"
            className="px-6 py-3 bg-gray-800 hover:bg-gray-700 text-white font-medium rounded-lg transition-all transform hover:scale-105 border border-gray-700"
          >
            Browse Auctions
          </Link>
        </div>

        <div className="mt-12 text-gray-400 flex items-center justify-center">
          <div className="w-8 h-8 mr-3">
            <svg
              viewBox="0 0 24 24"
              fill="none"
              xmlns="http://www.w3.org/2000/svg"
            >
              <path
                d="M21 12C21 16.9706 16.9706 21 12 21C7.02944 21 3 16.9706 3 12C3 7.02944 7.02944 3 12 3C16.9706 3 21 7.02944 21 12Z"
                stroke="currentColor"
                strokeWidth="2"
              />
              <path
                d="M12 8V12L14 14"
                stroke="currentColor"
                strokeWidth="2"
                strokeLinecap="round"
                strokeLinejoin="round"
              />
            </svg>
          </div>
          <span className="text-sm">
            Lost? Maybe try a{" "}
            <Link
              to="/faq"
              className="text-purple-400 hover:text-purple-300 underline"
            >
              look at our FAQ
            </Link>
          </span>
        </div>

        <div className="hidden md:block absolute right-12 top-1/4 w-12 h-12 rounded-full bg-blue-500 opacity-20 blur-xl"></div>
        <div className="hidden md:block absolute left-12 bottom-1/4 w-16 h-16 rounded-full bg-purple-500 opacity-20 blur-xl"></div>

        <div className="absolute top-1/2 left-[15%] w-2 h-2 rounded-full bg-purple-400 animate-pulse"></div>
        <div className="absolute top-1/3 right-[15%] w-2 h-2 rounded-full bg-blue-400 animate-pulse delay-300"></div>
        <div className="absolute bottom-1/3 left-[40%] w-2 h-2 rounded-full bg-indigo-400 animate-pulse delay-700"></div>
      </div>
    </div>
  );
};

export default NotFoundPage;
