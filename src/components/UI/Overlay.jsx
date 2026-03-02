import React from 'react';

const Overlay = () => {
    return (
        <div className="overlay-container">
            {/* Navbar */}
            <nav className="navbar">
                <div className="logo">MALDIVE NOVA</div>
                <ul className="nav-links">
                    <li>SUITES</li>
                    <li>DINING</li>
                    <li>EXPERIENCE</li>
                    <li>CONTACT</li>
                </ul>
                <button className="book-btn">BOOK NOW</button>
            </nav>

            {/* Hero Section */}
            <section className="hero">
                <div className="hero-content">
                    <h2 className="subtitle">THE ART OF VOYAGE</h2>
                    <h1 className="title">Redefining <br /> Luxury at Sea</h1>
                    <p className="description">
                        Experience the pinnacle of maritime engineering and elegance.
                        A sanctuary on the waves, designed for the modern explorer.
                    </p>
                    <div className="cta-group">
                        <button className="primary-btn">EXPLORE THE SHIP</button>
                        <button className="secondary-btn">WATCH FILM</button>
                    </div>
                </div>
            </section>

            {/* Footer / Stats (Optional decoration) */}
            <div className="stats">
                <div className="stat-item">
                    <span className="number">320</span>
                    <span className="label">METERS LENGTH</span>
                </div>
                <div className="stat-item">
                    <span className="number">24</span>
                    <span className="label">KNOTS SPEED</span>
                </div>
                <div className="stat-item">
                    <span className="number">120</span>
                    <span className="label">LUXURY SUITES</span>
                </div>
            </div>
        </div>
    );
};

export default Overlay;
