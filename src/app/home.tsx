'use client';

import React from 'react';

const Home: React.FC = () => {
  return (
    <div className="min-h-screen bg-gradient-to-br from-orange-50 to-pink-50">
      <div className="container mx-auto px-4 py-16">
        <h1 className="text-4xl font-bold text-center mb-8">BuddyBoard</h1>
        <p className="text-xl text-center mb-8">Find Trusted Pet Care Services</p>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
          <div className="bg-orange-100 p-6 rounded-xl">
            <h2 className="text-xl font-semibold mb-2">Pet Boarding</h2>
            <p className="text-gray-600">Safe and comfortable overnight stays for your pets</p>
          </div>
          <div className="bg-blue-100 p-6 rounded-xl">
            <h2 className="text-xl font-semibold mb-2">Pet Daycare</h2>
            <p className="text-gray-600">Daytime care and activities for your pets</p>
          </div>
          <div className="bg-yellow-100 p-6 rounded-xl">
            <h2 className="text-xl font-semibold mb-2">Pet Grooming</h2>
            <p className="text-gray-600">Professional grooming services for your pets</p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Home;
