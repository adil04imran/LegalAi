import { Link } from 'react-router-dom';
import './home.css';
import submitIcon from '../assets/submit.png';
import { useEffect, useState } from 'react';
import { useTranslation } from 'react-i18next';

export default function Home() {
    const [animateDoc, setAnimateDoc] = useState(false);
    const { t } = useTranslation(); // useTranslation hook to get translations

    useEffect(() => {
        setAnimateDoc(true);

        const scrollHandler = () => {
            const elements = document.querySelectorAll('.animate-on-scroll');
            elements.forEach(el => {
                const rect = el.getBoundingClientRect();
                const isVisible = rect.top <= window.innerHeight * 0.8;
                if (isVisible) {
                    el.classList.add('visible');
                }
            });
        };

        window.addEventListener('scroll', scrollHandler);
        setTimeout(scrollHandler, 300);

        return () => window.removeEventListener('scroll', scrollHandler);
    }, []);

    return (
        <div className="home-main">
            <div className="hero-section">
                <div className="hero-content">
                    <h1>{t('heroSection.title')}</h1>
                    <p className="tagline">{t('heroSection.tagline')}</p>
                    <p className="description">{t('heroSection.description')}</p>
                    <Link to="/analyze" className="cta-button">
                        <span>{t('heroSection.ctaText')}</span>
                        <img src={submitIcon} alt="Upload" />
                    </Link>
                </div>

                <div className={`document-illustration ${animateDoc ? 'animate' : ''}`}>
                    <div className="doc-paper">
                        <div className="doc-line"></div>
                        <div className="doc-line"></div>
                        <div className="doc-line"></div>
                        <div className="doc-line short"></div>
                        <div className="doc-highlight"></div>
                        <div className="doc-line"></div>
                        <div className="doc-line short"></div>
                        <div className="doc-highlight"></div>
                        <div className="doc-line"></div>
                    </div>
                    <div className="doc-scan-line"></div>
                </div>
            </div>

            <div className="stats-section animate-on-scroll">
                <div className="stat-item">
                    <span className="stat-number">15+</span>
                    <span className="stat-label">{t('statsSection.languagesSupported')}</span>
                </div>
                <div className="stat-item">
                    <span className="stat-number">98%</span>
                    <span className="stat-label">{t('statsSection.accuracyRate')}</span>
                </div>
                <div className="stat-item">
                    <span className="stat-number">75%</span>
                    <span className="stat-label">{t('statsSection.timeSaved')}</span>
                </div>
                <div className="stat-item">
                    <span className="stat-number">6 Seconds</span>
                    <span className="stat-label">{t('statsSection.averageProcessTime')}</span>
                </div>
            </div>

            <div className="features-section">
                <h2>{t('featuresSection.howItWorks')}</h2>
                <div className="features-grid">
                    <div className="feature-card animate-on-scroll">
                        <div className="feature-icon upload"></div>
                        <h3>{t('featuresSection.upload')}</h3>
                        <p>{t('featuresSection.uploadDescription')}</p>
                    </div>
                    <div className="feature-card animate-on-scroll">
                        <div className="feature-icon analyze"></div>
                        <h3>{t('featuresSection.analyze')}</h3>
                        <p>{t('featuresSection.analyzeDescription')}</p>
                    </div>
                    <div className="feature-card animate-on-scroll">
                        <div className="feature-icon structure"></div>
                        <h3>{t('featuresSection.structure')}</h3>
                        <p>{t('featuresSection.structureDescription')}</p>
                    </div>
                </div>
            </div>

            <div className="info-section">
                <div className="info-card animate-on-scroll">
                    <h2>{t('infoSection.whatWeExtract')}</h2>
                    <ul className="extraction-list">
                        <li><span>✓</span> {t('infoSection.clientName')}</li>
                        <li><span>✓</span> {t('infoSection.piiData')}</li>
                        <li><span>✓</span> {t('infoSection.natureOfNotice')}</li>
                        <li><span>✓</span> {t('infoSection.deadlines')}</li>
                        <li><span>✓</span> {t('infoSection.reportingOfficer')}</li>
                        <li><span>✓</span> {t('infoSection.legalSections')}</li>
                    </ul>
                </div>
                <div className="info-card support-card animate-on-scroll">
                    <h2>{t('infoSection.supportedLanguages')}</h2>
                    <div className="language-grid">
                        <span className="language-tag">English</span>
                        <span className="language-tag">Hindi</span>
                        <span className="language-tag">Telugu</span>
                        <span className="language-tag">Tamil</span>
                        <span className="language-tag">Kannada</span>
                        <span className="language-tag">Bengali</span>
                    </div>
                </div>
            </div>

            <div className="cta-section">
                <h2>{t('ctaSection.readyText')}</h2>
                <Link to="/analyze" className="cta-button-large">{t('ctaSection.ctaButtonText')}</Link>
                <button 
                    className="email-notification-button"
                    onClick={async () => {
                        try {
                            const token = localStorage.getItem('authToken');
                            if (!token) {
                                alert('You need to be logged in to receive email notifications');
                                return;
                            }
                            
                            const response = await fetch('http://localhost:3000/api/auth/msg', {
                                method: 'POST',
                                headers: {
                                    'Content-Type': 'application/json',
                                    'Authorization': token
                                },
                                body: JSON.stringify({})
                            });
                            
                            if (response.ok) {
                                alert('Email notification sent successfully!');
                            } else {
                                const errorData = await response.json();
                                alert(`Failed to send email: ${JSON.stringify(errorData)}`);
                            }
                        } catch (error) {
                            console.error('Error:', error);
                            alert('An error occurred while sending the email notification');
                        }
                    }}
                >
                    Send Email Notification
                </button>
                
                {/* Test token button */}
                <button 
                    className="test-token-button"
                    onClick={async () => {
                        try {
                            const token = localStorage.getItem('authToken');
                            if (!token) {
                                alert('No token found in localStorage');
                                return;
                            }

                            console.log("Token from localStorage:", token);
                            
                            const response = await fetch('http://localhost:3000/api/auth/test-token', {
                                method: 'POST',
                                headers: {
                                    'Content-Type': 'application/json',
                                    'Authorization': token
                                }
                            });
                            
                            const data = await response.json();
                            console.log("Token test response:", data);
                            alert(JSON.stringify(data, null, 2));
                        } catch (error) {
                            console.error('Error testing token:', error);
                            alert('Error testing token: ' + error.message);
                        }
                    }}
                >
                    Test Token
                </button>
            </div>
        </div>
    );
}
