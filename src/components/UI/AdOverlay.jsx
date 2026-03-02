import React, { useState } from 'react';

const exploreBtnStyle = {
    padding: '10px 20px',
    background: 'rgba(0,0,0,0.6)',
    border: '1px solid #d4af37',
    color: '#d4af37',
    fontFamily: "'Inter', sans-serif",
    fontSize: '12px',
    fontWeight: '600',
    cursor: 'pointer',
    letterSpacing: '1px',
    backdropFilter: 'blur(5px)',
    transition: 'all 0.3s',
    pointerEvents: 'auto',
    position: 'relative',
    zIndex: 10
};

const AdOverlay = ({ onExplore, visible = true }) => {
    const [menuOpen, setMenuOpen] = useState(false);

    if (!visible) return null;
    return (
        <div className="ad-overlay">
            {/* Header / Navbar */}
            <header className="ad-header">
                <div
                    className="ad-logo"
                    onClick={() => onExplore('default')}
                >
                    <div style={{ fontSize: '24px', fontWeight: 'bold', color: '#d4af37', letterSpacing: '2px' }}>HALORA</div>
                    <div style={{ fontSize: '10px', letterSpacing: '4px', color: '#fff' }}>NOVA CRUISE</div>
                </div>

                {/* Hamburger Menu (Mobile) */}
                <div className="hamburger" onClick={() => setMenuOpen(!menuOpen)}>
                    <span></span>
                    <span></span>
                    <span></span>
                </div>

                <nav className={`ad-nav ${menuOpen ? 'open' : ''}`}>
                    <ul>
                        {['DU THUYỀN HALORA', 'CABIN', 'DỊCH VỤ', 'HÀNH TRÌNH & HOẠT ĐỘNG', 'ƯU ĐÃI', 'KHÁM PHÁ DU LỊCH', 'TIN TỨC'].map((item) => (
                            <li key={item} className="nav-item" onClick={() => setMenuOpen(false)}>
                                {item}
                            </li>
                        ))}
                    </ul>
                </nav>
            </header>

            {/* Main Title Area */}
            <div className="ad-title">
                <h1>HALORA NOVA CRUISE</h1>
            </div>

            {/* Floating Action Buttons */}
            <div className="ad-sidebar">
                {/* Explore Buttons */}
                <div className="explore-buttons">
                    <button onClick={() => onExplore('suite')} style={{ ...exploreBtnStyle, opacity: 0.4, cursor: 'not-allowed' }} disabled>
                        ROYAL SUITE <span style={{ fontSize: '8px', display: 'block', color: '#999' }}>Đang triển khai</span>
                    </button>
                    <button onClick={() => onExplore('sundeck')} style={{ ...exploreBtnStyle, opacity: 0.4, cursor: 'not-allowed' }} disabled>
                        SUN DECK <span style={{ fontSize: '8px', display: 'block', color: '#999' }}>Đang triển khai</span>
                    </button>
                    <button onClick={() => onExplore('premiumtripleroom')} style={exploreBtnStyle}>
                        PREMIUM TRIPLE
                    </button>
                    <button onClick={() => onExplore('default')} style={exploreBtnStyle}>
                        TOÀN CẢNH
                    </button>
                    <button style={{ ...exploreBtnStyle, opacity: 0.4, cursor: 'not-allowed' }} disabled>
                        TEST ROOM <span style={{ fontSize: '8px', display: 'block', color: '#999' }}>Đang triển khai</span>
                    </button>
                </div>

                {/* Social FAB Buttons */}
                <div className="social-fabs">
                    {[
                        { name: 'fb', icon: <svg width="18" height="18" viewBox="0 0 24 24" fill="white"><path d="M24 12.073c0-6.627-5.373-12-12-12s-12 5.373-12 12c0 5.99 4.388 10.954 10.125 11.854v-8.385H7.078v-3.47h3.047V9.43c0-3.007 1.792-4.669 4.533-4.669 1.312 0 2.686.235 2.686.235v2.953H15.83c-1.491 0-1.956.925-1.956 1.874v2.25h3.328l-.532 3.47h-2.796v8.385C19.612 23.027 24 18.062 24 12.073z" /></svg> },
                        { name: 'phone', icon: <svg width="18" height="18" viewBox="0 0 24 24" fill="white"><path d="M6.62 10.79c1.44 2.83 3.76 5.14 6.59 6.59l2.2-2.2c.27-.27.67-.36 1.02-.24 1.12.37 2.33.57 3.57.57.55 0 1 .45 1 1V20c0 .55-.45 1-1 1-9.39 0-17-7.61-17-17 0-.55.45-1 1-1h3.5c.55 0 1 .45 1 1 0 1.25.2 2.45.57 3.57.11.35.03.74-.25 1.02l-2.2 2.2z" /></svg> },
                        { name: 'mail', icon: <svg width="18" height="18" viewBox="0 0 24 24" fill="white"><path d="M20 4H4c-1.1 0-1.99.9-1.99 2L2 18c0 1.1.9 2 2 2h16c1.1 0 2-.9 2-2V6c0-1.1-.9-2-2-2zm0 4l-8 5-8-5V6l8 5 8-5v2z" /></svg> },
                        { name: 'zalo', icon: <svg width="18" height="18" viewBox="0 0 24 24" fill="white"><text x="2" y="18" fontSize="16" fontWeight="bold" fill="white">Z</text></svg> }
                    ].map((item, index) => (
                        <div key={index} className="fab-btn">
                            {item.icon}
                        </div>
                    ))}
                </div>
            </div>
        </div>
    );
};

export default AdOverlay;
