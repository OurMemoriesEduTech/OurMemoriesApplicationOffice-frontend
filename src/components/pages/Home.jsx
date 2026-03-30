// src/components/Home.js
// Simple home page for non-logged in users.

import React from 'react';

const Home = () => {
    return (
        <div style={{ padding: '2rem' }}>
            <h1>Welcome to Varsity & College Applications</h1>
            <p>Explore services for college applications. Click "App" to get started (login required).</p>
            {/* Add more content about services here */}
        </div>
    );
};

export default Home;