import React, { useState, useEffect } from 'react';
import { 
  X, Copy, Check, Mail, QrCode, Download, Sparkles, 
  Globe, MessageCircle, Share2, Link2, Send 
} from 'lucide-react';
import './ShareModal.css';

const ShareModal = ({ isOpen, onClose, shareUrl = '', title = '', role = 'Visitor' }) => {
  const [copied, setCopied] = useState(false);
  const [showToast, setShowToast] = useState(false);
  const [showQR, setShowQR] = useState(false);
  const [qrDownloaded, setQrDownloaded] = useState(false);

  // Fallback to current browser URL if shareUrl is empty
  const activeUrl = shareUrl || (typeof window !== 'undefined' ? window.location.origin : 'https://valdez-elementary.edu');
  const activeTitle = title || 'Valdez Elementary School Portal';

  // Autoclose toast after 3 seconds
  useEffect(() => {
    let timer;
    if (showToast) {
      timer = setTimeout(() => {
        setShowToast(false);
      }, 3000);
    }
    return () => clearTimeout(timer);
  }, [showToast]);

  if (!isOpen) return null;

  const handleCopyLink = async () => {
    try {
      await navigator.clipboard.writeText(activeUrl);
      setCopied(true);
      setShowToast(true);
      setTimeout(() => setCopied(false), 2000);
    } catch (err) {
      // Fallback if clipboard API is not available
      const textArea = document.createElement('textarea');
      textArea.value = activeUrl;
      textArea.style.position = 'fixed';
      textArea.style.opacity = '0';
      document.body.appendChild(textArea);
      textArea.focus();
      textArea.select();
      try {
        document.execCommand('copy');
        setCopied(true);
        setShowToast(true);
        setTimeout(() => setCopied(false), 2000);
      } catch (e) {
        console.error('Failed to copy text: ', e);
      }
      document.body.removeChild(textArea);
    }
  };

  const handleDownloadQR = () => {
    setQrDownloaded(true);
    setShowToast(true);
    setTimeout(() => setQrDownloaded(false), 3000);
  };

  // Social sharing handlers
  const shareLinks = {
    facebook: `https://www.facebook.com/sharer/sharer.php?u=${encodeURIComponent(activeUrl)}`,
    twitter: `https://twitter.com/intent/tweet?url=${encodeURIComponent(activeUrl)}&text=${encodeURIComponent(`Check out the ${activeTitle}!`)}`,
    whatsapp: `https://api.whatsapp.com/send?text=${encodeURIComponent(`Join me at the ${activeTitle}: ${activeUrl}`)}`,
    linkedin: `https://www.linkedin.com/sharing/share-offsite/?url=${encodeURIComponent(activeUrl)}`,
    email: `mailto:?subject=${encodeURIComponent(activeTitle)}&body=${encodeURIComponent(`Hi,\n\nI want to share the ${activeTitle} with you. Access it here: ${activeUrl}\n\nBest regards,\nValdez Portal`)}`
  };

  return (
    <>
      <div className="share-modal-overlay" onClick={onClose}>
        <div className="share-modal-container" onClick={e => e.stopPropagation()}>
          {/* Decorative Glowing Elements */}
          <div className="share-modal-glow-1"></div>
          <div className="share-modal-glow-2"></div>

          {/* Modal Header */}
          <div className="share-modal-header">
            <h2 className="share-modal-title">
              <Share2 size={22} className="text-cyan-400" />
              Share Valdez Portal
            </h2>
            <button className="share-modal-close-btn" onClick={onClose} aria-label="Close Share Modal">
              <X size={18} />
            </button>
          </div>

          {/* Modal Body */}
          <div className="share-modal-content">
            {/* Visual Glassmorphic Preview */}
            <div className="share-preview-card">
              <div className="share-preview-logo">
                <Sparkles size={24} className="text-white animate-pulse" />
              </div>
              <div className="share-preview-text">
                <div className="share-preview-title">{activeTitle}</div>
                <div className="share-preview-desc">
                  Empowering academic growth through advanced STEM, immersive dual-language curriculum, and live performance dashboards.
                </div>
              </div>
            </div>

            {/* Link Copy Widget */}
            <div className="share-copy-box">
              <input 
                type="text" 
                readOnly 
                value={activeUrl} 
                className="share-link-input"
                onClick={e => e.target.select()}
              />
              <button 
                className={`share-copy-btn ${copied ? 'copied' : ''}`}
                onClick={handleCopyLink}
              >
                {copied ? <Check size={16} /> : <Copy size={16} />}
                {copied ? 'Copied!' : 'Copy'}
              </button>
            </div>

            {/* Quick Social Share Options */}
            <div>
              <div className="share-socials-title">Quick Share</div>
              <div className="share-socials-grid">
                <a href={shareLinks.facebook} target="_blank" rel="noopener noreferrer" className="share-social-item facebook" style={{ textDecoration: 'none' }}>
                  <svg width="20" height="20" viewBox="0 0 24 24" fill="#1877f2"><path d="M24 12.073c0-6.627-5.373-12-12-12s-12 5.373-12 12c0 5.99 4.388 10.954 10.125 11.854v-8.385H7.078v-3.47h3.047V9.43c0-3.007 1.792-4.669 4.533-4.669 1.312 0 2.686.235 2.686.235v2.953H15.83c-1.491 0-1.956.925-1.956 1.874v2.25h3.328l-.532 3.47h-2.796v8.385C19.612 23.027 24 18.062 24 12.073z"/></svg>
                  <span>Facebook</span>
                </a>
                <a href={shareLinks.twitter} target="_blank" rel="noopener noreferrer" className="share-social-item twitter" style={{ textDecoration: 'none' }}>
                  <svg width="18" height="18" viewBox="0 0 24 24" fill="currentColor"><path d="M18.244 2.25h3.308l-7.227 8.26 8.502 11.24H16.17l-5.214-6.817L4.99 21.75H1.68l7.73-8.835L1.254 2.25H8.08l4.713 6.231zm-1.161 17.52h1.833L7.084 4.126H5.117z"/></svg>
                  <span>Twitter</span>
                </a>
                <a href={shareLinks.whatsapp} target="_blank" rel="noopener noreferrer" className="share-social-item whatsapp" style={{ textDecoration: 'none' }}>
                  <MessageCircle size={20} color="#25d366" />
                  <span>WhatsApp</span>
                </a>
                <a href={shareLinks.linkedin} target="_blank" rel="noopener noreferrer" className="share-social-item linkedin" style={{ textDecoration: 'none' }}>
                  <svg width="20" height="20" viewBox="0 0 24 24" fill="#0a66c2"><path d="M20.447 20.452h-3.554v-5.569c0-1.328-.027-3.037-1.852-3.037-1.853 0-2.136 1.445-2.136 2.939v5.667H9.351V9h3.414v1.561h.046c.477-.9 1.637-1.85 3.37-1.85 3.601 0 4.267 2.37 4.267 5.455v6.286zM5.337 7.433c-1.144 0-2.063-.926-2.063-2.065 0-1.138.92-2.063 2.063-2.063 1.14 0 2.064.925 2.064 2.063 0 1.139-.925 2.065-2.064 2.065zm1.782 13.019H3.555V9h3.564v11.452zM22.225 0H1.771C.792 0 0 .774 0 1.729v20.542C0 23.227.792 24 1.771 24h20.451C23.2 24 24 23.227 24 22.271V1.729C24 .774 23.2 0 22.222 0h.003z"/></svg>
                  <span>LinkedIn</span>
                </a>
                <a href={shareLinks.email} className="share-social-item email" style={{ textDecoration: 'none' }}>
                  <Mail size={20} color="#a855f7" />
                  <span>Email</span>
                </a>
              </div>
            </div>

            {/* Interactive QR Code Section */}
            <div className="share-qr-section">
              <button 
                className="share-qr-btn-toggle"
                onClick={() => setShowQR(!showQR)}
              >
                <QrCode size={16} />
                {showQR ? 'Hide QR Code' : 'Generate QR Code'}
              </button>

              {showQR && (
                <div className="share-qr-display">
                  <div className="share-qr-card" onClick={handleDownloadQR}>
                    {/* Exquisite SVG QR Code with School Icon in Center */}
                    <svg width="150" height="150" viewBox="0 0 29 29" style={{ display: 'block' }}>
                      <rect width="29" height="29" fill="white"/>
                      {/* Top-Left Finder Pattern */}
                      <rect x="0" y="0" width="7" height="7" fill="black"/>
                      <rect x="1" y="1" width="5" height="5" fill="white"/>
                      <rect x="2" y="2" width="3" height="3" fill="black"/>
                      {/* Top-Right Finder Pattern */}
                      <rect x="22" y="0" width="7" height="7" fill="black"/>
                      <rect x="23" y="1" width="5" height="5" fill="white"/>
                      <rect x="24" y="2" width="3" height="3" fill="black"/>
                      {/* Bottom-Left Finder Pattern */}
                      <rect x="0" y="22" width="7" height="7" fill="black"/>
                      <rect x="1" y="23" width="5" height="5" fill="white"/>
                      <rect x="2" y="24" width="3" height="3" fill="black"/>
                      {/* Alignment pattern */}
                      <rect x="20" y="20" width="5" height="5" fill="black"/>
                      <rect x="21" y="21" width="3" height="3" fill="white"/>
                      <rect x="22" y="22" width="1" height="1" fill="black"/>
                      {/* Random styling squares for QR look */}
                      <rect x="9" y="1" width="1" height="3" fill="black"/>
                      <rect x="11" y="0" width="2" height="1" fill="black"/>
                      <rect x="15" y="1" width="1" height="1" fill="black"/>
                      <rect x="17" y="0" width="1" height="2" fill="black"/>
                      <rect x="19" y="2" width="2" height="1" fill="black"/>
                      
                      <rect x="9" y="4" width="2" height="2" fill="black"/>
                      <rect x="13" y="4" width="1" height="3" fill="black"/>
                      <rect x="16" y="5" width="2" height="1" fill="black"/>
                      
                      <rect x="1" y="9" width="3" height="1" fill="black"/>
                      <rect x="5" y="8" width="1" height="2" fill="black"/>
                      <rect x="8" y="9" width="2" height="1" fill="black"/>
                      <rect x="11" y="8" width="1" height="3" fill="black"/>
                      <rect x="15" y="9" width="3" height="1" fill="black"/>
                      <rect x="19" y="8" width="1" height="2" fill="black"/>
                      <rect x="21" y="9" width="1" height="3" fill="black"/>
                      
                      <rect x="0" y="12" width="2" height="1" fill="black"/>
                      <rect x="3" y="13" width="1" height="2" fill="black"/>
                      <rect x="6" y="12" width="3" height="1" fill="black"/>
                      <rect x="10" y="13" width="2" height="1" fill="black"/>
                      <rect x="14" y="12" width="1" height="2" fill="black"/>
                      <rect x="17" y="13" width="3" height="1" fill="black"/>
                      
                      <rect x="2" y="16" width="1" height="2" fill="black"/>
                      <rect x="5" y="17" width="2" height="1" fill="black"/>
                      <rect x="9" y="16" width="1" height="3" fill="black"/>
                      <rect x="12" y="17" width="3" height="1" fill="black"/>
                      <rect x="16" y="16" width="1" height="2" fill="black"/>
                      <rect x="19" y="17" width="2" height="1" fill="black"/>
                      
                      <rect x="8" y="21" width="2" height="2" fill="black"/>
                      <rect x="12" y="22" width="1" height="3" fill="black"/>
                      <rect x="15" y="21" width="3" height="1" fill="black"/>
                      
                      <rect x="9" y="26" width="3" height="1" fill="black"/>
                      <rect x="14" y="25" width="2" height="2" fill="black"/>
                      <rect x="18" y="26" width="1" height="3" fill="black"/>
                      
                      {/* Visual Centerpiece (Graduation Cap Badge Overlay) */}
                      <rect x="11" y="11" width="7" height="7" fill="white"/>
                      <rect x="12" y="12" width="5" height="5" fill="#0ea5e9" rx="1"/>
                      {/* SVG Cap drawing in miniature */}
                      <path d="M 14.5 13 L 16.5 14 L 14.5 15 L 12.5 14 Z" fill="white"/>
                      <path d="M 13.5 14.5 L 13.5 15.5 C 13.5 16, 15.5 16, 15.5 15.5 L 15.5 14.5" stroke="white" strokeWidth="0.5" fill="none"/>
                      <path d="M 15.8 14.2 L 15.8 15.8" stroke="white" strokeWidth="0.4"/>
                    </svg>
                  </div>
                  <button className="share-qr-download-btn" onClick={handleDownloadQR}>
                    <Download size={14} />
                    Download QR Code
                  </button>
                </div>
              )}
            </div>
          </div>
        </div>
      </div>

      {/* Floating Action Toast Notification */}
      {showToast && (
        <div className="share-toast-notification">
          <div className="share-toast-icon">✓</div>
          <div className="share-toast-content">
            <span className="share-toast-title">
              {qrDownloaded ? 'QR Code Saved!' : 'Link Copied!'}
            </span>
            <span className="share-toast-message">
              {qrDownloaded ? 'The school portal QR badge is ready for print/share.' : 'Ready to be shared with teachers, parents, and friends.'}
            </span>
          </div>
          <div className="share-toast-progress"></div>
        </div>
      )}
    </>
  );
};

export default ShareModal;
