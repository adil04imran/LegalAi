import { Link } from 'react-router-dom';
import { useState, useEffect, useRef } from 'react';
import { useTranslation } from 'react-i18next';
import './navbar.css';

export default function Navbar() {
    const [dropdownVisible, setDropdownVisible] = useState(false);
    const [scrolled, setScrolled] = useState(false);
    const [languageDropdownVisible, setLanguageDropdownVisible] = useState(false);
    const dropdownRef = useRef(null);
    const { i18n } = useTranslation();
    
    // Set a default username since we're not fetching it anymore
    const userName = 'User';

    // Scroll effect
    useEffect(() => {
        const handleScroll = () => setScrolled(window.scrollY > 50);
        window.addEventListener('scroll', handleScroll);
        return () => window.removeEventListener('scroll', handleScroll);
    }, []);

    // Hide dropdown on outside click
    useEffect(() => {
        const handleClickOutside = (event) => {
            if (dropdownRef.current && !dropdownRef.current.contains(event.target)) {
                setDropdownVisible(false);
            }
        };

        document.addEventListener('mousedown', handleClickOutside);
        return () => document.removeEventListener('mousedown', handleClickOutside);
    }, []);

    const handleLogout = () => {
        localStorage.removeItem('authToken');
        window.location.href = '/login';
    };

    // Handle language change
    const handleLanguageChange = (lang) => {
        i18n.changeLanguage(lang);  // Change the language
        setLanguageDropdownVisible(false); // Hide dropdown after selecting a language
    };

    return (
        <div className={`nav-main ${scrolled ? 'nav-scrolled' : ''}`}>
            <div className="nav-links">
                <Link to="/" className={window.location.pathname === '/' ? 'active' : ''}>Home</Link>
                <Link to="/analyze" className={window.location.pathname === '/analyze' ? 'active' : ''}>Analyze</Link>
            </div>
            
            <div className="nav-actions">
                {/* Language Selector */}
                <div className="language-selector" ref={dropdownRef}>
                    <button 
                        className="language-button"
                        onClick={() => setLanguageDropdownVisible(!languageDropdownVisible)}
                    >
                        {i18n.language === 'fr' ? '🇫🇷' : '🇺🇸'}
                    </button>
                    {languageDropdownVisible && (
                        <div className="language-dropdown">
                            <button onClick={() => handleLanguageChange('en')}>English 🇺🇸</button>
                            <button onClick={() => handleLanguageChange('fr')}>Français 🇫🇷</button>
                        </div>
                    )}
                </div>
            </div>
        </div>
    );
}
