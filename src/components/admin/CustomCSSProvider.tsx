'use client'

import React from 'react'

/**
 * Component that injects custom CSS to make the dark theme background pure black
 */
const CustomCSSProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
	return (
		<>
			<style jsx global>{`
        /* Target dark theme specifically */
        [data-theme="dark"] {
          /* Main background colors */
          --theme-elevation-0: #000000 !important;
          --theme-elevation-50: #080808 !important;
          --theme-elevation-100: #101010 !important;
          --theme-elevation-150: #181818 !important;
          --theme-elevation-200: #202020 !important;
          --theme-elevation-250: #282828 !important;
          --theme-elevation-300: #303030 !important;
          --theme-elevation-350: #383838 !important;
          --theme-elevation-400: #404040 !important;
          --theme-elevation-450: #484848 !important;
          --theme-elevation-500: #505050 !important;
          --theme-elevation-550: #585858 !important;
          --theme-elevation-600: #606060 !important;
          --theme-elevation-650: #686868 !important;
          --theme-elevation-700: #707070 !important;
          --theme-elevation-750: #787878 !important;
          --theme-elevation-800: #808080 !important;
          --theme-elevation-850: #888888 !important;
          --theme-elevation-900: #909090 !important;
          --theme-elevation-950: #989898 !important;
          --theme-elevation-1000: #ffffff !important;
          
          /* Button colors */
          --theme-button-bg: #ffffff !important;
          --theme-button-text: #000000 !important;
          --theme-input-bg: #101010 !important;
        }

        /* Ensure login page has pure black background */
        [data-theme="dark"].payload-template-login {
          background-color: #000000 !important;
        }
        
      
        
        /* Ensure sidebar has pure black background */
        [data-theme="dark"] .nav {
          background-color: #000000 !important;
        }
        
        /* Fix login button styling */
        [data-theme="dark"] .template-login .btn--style-primary {
          background-color: white !important;
          color: black !important;
        }
        
        /* Primary buttons should be white with black text */
        [data-theme="dark"] .btn--style-primary {
          background-color: white !important;
          color: black !important;
        }
        
        /* Secondary buttons should have dark background */
        [data-theme="dark"] .btn:not(.btn--style-primary) {
          background-color: #101010 !important;
        }
        
        /* Make sure form fields have proper contrast */
        [data-theme="dark"] input, 
        [data-theme="dark"] textarea, 
        [data-theme="dark"] select {
          background-color: #101010 !important;
        }
      `}</style>
			{children}
		</>
	)
}

export default CustomCSSProvider
