'use client';

import { useEffect } from 'react';

/**
 * A component that applies iOS-specific fixes for better mobile experience
 */
export default function IOSFixes() {
  useEffect(() => {
    // Function to detect iOS
    const isIOS = () => {
      return /iPad|iPhone|iPod/.test(navigator.userAgent) || 
        (navigator.platform === 'MacIntel' && navigator.maxTouchPoints > 1);
    };

    // Apply iOS specific fixes
    const applyIOSFixes = () => {
      if (!isIOS()) return;
      
      // Add iOS-specific class to body for CSS targeting
      document.body.classList.add('ios-device');
      
      // Fix 100vh issue on iOS (viewport height is incorrectly calculated)
      const fixIOSHeight = () => {
        const vh = window.innerHeight * 0.01;
        document.documentElement.style.setProperty('--vh', `${vh}px`);
        
        // Apply the custom height to min-height elements
        document.querySelectorAll('.min-h-screen').forEach(el => {
          if (el instanceof HTMLElement) {
            el.style.minHeight = `calc(var(--vh, 1vh) * 100)`;
          }
        });
      };
      
      // Apply height fix
      fixIOSHeight();
      window.addEventListener('resize', fixIOSHeight);
      
      // Fix input focus scrolling
      document.querySelectorAll('input, textarea, select').forEach(input => {
        input.addEventListener('focus', () => {
          // Add padding to bottom when keyboard appears
          document.body.style.paddingBottom = '150px';
        });
        
        input.addEventListener('blur', () => {
          // Remove padding when keyboard disappears
          document.body.style.paddingBottom = '0';
        });
      });
      
      // Fix for iOS momentum scrolling
      document.querySelectorAll('.overflow-auto, .overflow-y-auto, .overflow-x-auto').forEach(el => {
        if (el instanceof HTMLElement) {
          el.setAttribute('style', el.getAttribute('style') || '' + '; -webkit-overflow-scrolling: touch;');
        }
      });
      
      // Fix to prevent double-tap zoom
      const createFastClickStyle = () => {
        const style = document.createElement('style');
        style.innerHTML = `
          button, a, [role="button"] {
            touch-action: manipulation;
          }
        `;
        document.head.appendChild(style);
      };
      
      createFastClickStyle();
      
      console.log('iOS-specific fixes applied');
    };
    
    // Apply fixes on mount
    applyIOSFixes();
    
    // Cleanup function
    return () => {
      if (isIOS()) {
        window.removeEventListener('resize', () => {
          const vh = window.innerHeight * 0.01;
          document.documentElement.style.setProperty('--vh', `${vh}px`);
        });
      }
    };
  }, []);
  
  return null;
} 