'use client';

import { useEffect } from 'react';

/**
 * A component that applies responsive fixes immediately when mounted
 * This component should be placed in the dashboard layout
 */
export default function ResponsiveFixesLoader() {
  useEffect(() => {
    // Apply all responsive fixes
    const applyResponsiveFixes = () => {
      // Fix viewport meta tag if needed
      let viewportMeta = document.querySelector('meta[name="viewport"]');
      if (!viewportMeta) {
        viewportMeta = document.createElement('meta');
        viewportMeta.setAttribute('name', 'viewport');
        document.head.appendChild(viewportMeta);
      }
      viewportMeta.setAttribute('content', 'width=device-width, initial-scale=1, maximum-scale=5, user-scalable=yes');
      
      // Fix body overflow
      document.body.style.overflow = 'auto';
      document.body.style.maxWidth = '100vw';
      document.body.style.overflowX = 'hidden';
      
      // Apply fixes for mobile viewport
      if (window.innerWidth <= 640) {
        // Apply mobile-specific fixes
        
        // Fix padding on containers
        document.querySelectorAll('.max-w-7xl').forEach(el => {
          if (el instanceof HTMLElement) {
            el.style.paddingLeft = '1rem';
            el.style.paddingRight = '1rem';
            el.style.width = '100%';
            el.style.boxSizing = 'border-box';
          }
        });
        
        // Fix cards and panels
        document.querySelectorAll('.bg-white.shadow, .bg-white.shadow-sm, .bg-white.rounded-lg').forEach(el => {
          if (el instanceof HTMLElement) {
            el.style.padding = '0.75rem';
            el.style.marginBottom = '1rem';
            el.style.borderRadius = '0.375rem';
          }
        });
        
        // Fix form inputs
        document.querySelectorAll('input, select, textarea').forEach(el => {
          if (el instanceof HTMLElement) {
            el.style.width = '100%';
            el.style.fontSize = '16px'; // Prevents iOS zoom
            el.style.boxSizing = 'border-box';
          }
        });
        
        // Fix buttons
        document.querySelectorAll('button, [role="button"], a.bg-indigo-600, a.bg-blue-600').forEach(el => {
          if (el instanceof HTMLElement) {
            const height = parseInt(getComputedStyle(el).height);
            if (height < 44) {
              el.style.minHeight = '44px';
              el.style.minWidth = '44px';
            }
          }
        });
        
        // Fix grids
        document.querySelectorAll('.grid').forEach(el => {
          if (el instanceof HTMLElement && !el.classList.contains('grid-fixed')) {
            el.style.display = 'flex';
            el.style.flexDirection = 'column';
            el.style.gap = '1rem';
          }
        });
        
        // Fix any tables
        const fixTables = () => {
          document.querySelectorAll('table').forEach(table => {
            // Skip if already in scrollable container
            if (table.closest('.overflow-x-auto, .table-responsive')) {
              return;
            }
            
            // Create scrollable wrapper
            const wrapper = document.createElement('div');
            wrapper.className = 'table-responsive';
            wrapper.style.overflowX = 'auto';
            wrapper.style.width = '100%';
            wrapper.style.maxWidth = '100%';
            
            // Use setAttribute for non-standard style properties
            wrapper.setAttribute('style', 
              `overflow-x: auto; width: 100%; max-width: 100%; -webkit-overflow-scrolling: touch;`
            );
            
            // Wrap table
            if (table.parentNode) {
              table.parentNode.insertBefore(wrapper, table);
              wrapper.appendChild(table);
              
              // Set table width
              table.style.minWidth = '1000px';
            }
          });
        };
        
        fixTables();
      }
    };
    
    // Apply fixes immediately
    applyResponsiveFixes();
    
    // Apply fixes when window resizes
    window.addEventListener('resize', applyResponsiveFixes);
    
    // Apply fixes when content changes
    const observer = new MutationObserver(() => {
      applyResponsiveFixes();
    });
    
    observer.observe(document.body, {
      childList: true,
      subtree: true,
      attributes: true,
      attributeFilter: ['class', 'style']
    });
    
    // Add global function for manual fix
    if (typeof window !== 'undefined') {
      (window as any).applyResponsiveFixes = applyResponsiveFixes;
    }
    
    // Cleanup
    return () => {
      window.removeEventListener('resize', applyResponsiveFixes);
      observer.disconnect();
    };
  }, []);
  
  return null;
} 