import { GoogleAnalytics } from '@next/third-parties/google'
import type React from 'react'
import './globals.css'
import { Toaster } from '@/components/ui/sonner'
import { Providers } from '@/providers'
import { generateMetadata as generateBaseMetadata } from '@/utilities/mergeOpenGraph'
import { Analytics } from '@vercel/analytics/react'
import { SpeedInsights } from '@vercel/speed-insights/next'
import classNames from 'classnames'
import type { Metadata } from 'next/types'
import localFont from 'next/font/local'

// Define the Adobe Typekit font as a CSS variable
// You'll access the font using the CSS variable name from Typekit
// No need to import or define it since it's loaded via the Typekit CSS link

/*
                    // Your Brand //


          ██████╗ ██████╗  ██████╗      ██╗███████╗ ██████╗████████╗
          ██╔══██╗██╔══██╗██╔═══██╗     ██║██╔════╝██╔════╝╚══██╔══╝
          ██████╔╝██████╔╝██║   ██║     ██║█████╗  ██║        ██║   
          ██╔═══╝ ██╔══██╗██║   ██║██   ██║██╔══╝  ██║        ██║   
          ██║     ██║  ██║╚██████╔╝╚█████╔╝███████╗╚██████╗   ██║   
          ╚═╝     ╚═╝  ╚═╝ ╚═════╝  ╚════╝ ╚══════╝ ╚═════╝   ╚═╝   
                                                    

                           www.yourbrand.com
                                  •
                     Modern Website Template
					 
					      
                            

*/

export default async function RootLayout({ children }: { children: React.ReactNode }) {
	return (
		<html lang="en" className="antialiased" suppressHydrationWarning>
			{/* 
                    // Developed by //


          ██████╗ ███╗   ███╗███╗   ██╗██╗██████╗ ██╗██╗  ██╗███████╗██╗     
          ██╔══██╗████╗ ████║████╗  ██║██║██╔══██╗██║╚██╗██╔╝██╔════╝██║     
          ██║  ██║██╔████╔██║██╔██╗ ██║██║██████╔╝██║ ╚███╔╝ █████╗  ██║     
          ██║  ██║██║╚██╔╝██║██║╚██╗██║██║██╔═══╝ ██║ ██╔██╗ ██╔══╝  ██║     
          ██████╔╝██║ ╚═╝ ██║██║ ╚████║██║██║     ██║██╔╝ ██╗███████╗███████╗
          ╚═════╝ ╚═╝     ╚═╝╚═╝  ╚═══╝╚═╝╚═╝     ╚═╝╚═╝  ╚═╝╚══════╝╚══════╝
                                                    
                           https://omnipixel.io
			*/}
			<head>
				<meta name="viewport" content="width=device-width, initial-scale=1.0, viewport-fit=cover" />
				<style>{`
					html, body {
						touch-action: pan-y pinch-zoom;
						overscroll-behavior-y: none;
						-webkit-overflow-scrolling: touch;
					}
					@keyframes float {
						0% { transform: translateY(0px); }
						50% { transform: translateY(-10px); }
						100% { transform: translateY(0px); }
					}
					.animate-float {
						animation: float 3s ease-in-out infinite;
					}
				`}</style>
				<SpeedInsights />
				<Analytics />
				<GoogleAnalytics gaId="G-EXAMPLE123" />
				{(process.env.NODE_ENV === 'development' || process.env.VERCEL_ENV === 'preview') && (
					<script src="https://unpkg.com/react-scan/dist/auto.global.js" />
				)}
				{/* Resource hints for performance optimization */}
				<link rel="icon" type="image/png" href="/fav/favicon-96x96.png" sizes="96x96" />
				<link rel="icon" type="image/svg+xml" href="/fav/favicon.svg" />
				<link rel="shortcut icon" href="/fav/favicon.ico" />
				<link rel="apple-touch-icon" sizes="180x180" href="/fav/apple-touch-icon.png" />
				<meta name="apple-mobile-web-app-title" content="Plugins" />
				<meta name="theme-color" content="#000000" media="(prefers-color-scheme: dark)" />
				<meta name="theme-color" content="#000000" media="(prefers-color-scheme: light)" />
				<meta name="apple-mobile-web-app-capable" content="yes" />
				<meta name="apple-mobile-web-app-status-bar-style" content="black" />
				<link rel="manifest" href="/fav/site.webmanifest" />
				<link rel="stylesheet" href="https://use.typekit.net/wdj7jxv.css"></link>
			</head>

			<body
				className="relative dark transition-all bg-background text-foreground"
				suppressHydrationWarning
			>
				<Providers>
					{children}
					<Toaster />

					{/* Made with love badge */}
					<div className="fixed bottom-0 right-0 z-50 pointer-events-none">
						<div className="pointer-events-auto flex items-center justify-center px-3 py-1 rounded-tl-md bg-white/5 backdrop-blur-sm border-t border-l border-white/10">
							<span className="text-white/40 font-normal tracking-[-0.003em] fl-text-step--2 flex items-center">
								Made with
								<svg
									xmlns="http://www.w3.org/2000/svg"
									width="24"
									height="24"
									viewBox="0 0 24 24"
									fill="currentColor"
									className="h-3 w-3 mx-1 text-red-400 animate-pulse"
								>
									<path d="M12 21.35l-1.45-1.32C5.4 15.36 2 12.28 2 8.5 2 5.42 4.42 3 7.5 3c1.74 0 3.41.81 4.5 2.09C13.09 3.81 14.76 3 16.5 3 19.58 3 22 5.42 22 8.5c0 3.78-3.4 6.86-8.55 11.54L12 21.35z" />
								</svg>
								by{' '}
								<a
									href="https://omnipixel.io"
									target="_blank"
									rel="noopener noreferrer"
									className="text-white/60 hover:text-white ml-1 transition-colors duration-300 pointer-events-auto"
								>
									Omnipixel
								</a>
							</span>
						</div>
					</div>
				</Providers>
			</body>
		</html>
	)
}

export const metadata: Metadata = generateBaseMetadata(
	{
		title: 'Your Brand - Modern Website',
		description: 'A modern website built with Next.js and Payload CMS.',
		keywords: 'website, web development, next.js, payload cms',
		structuredData: {
			'@context': 'https://schema.org',
			'@type': 'Organization',
			name: 'Your Brand',
			url: process.env.NEXT_PUBLIC_SERVER_URL,
			logo: `${process.env.NEXT_PUBLIC_SERVER_URL}/logo.png`,
			description: 'A modern website built with Next.js and Payload CMS.',
			address: {
				'@type': 'PostalAddress',
				addressCountry: 'US',
			},
		},
		additionalMetaTags: [
			{
				name: 'application-name',
				content: 'Your Brand',
			},
			{
				name: 'apple-mobile-web-app-capable',
				content: 'yes',
			},
			{
				name: 'apple-mobile-web-app-status-bar-style',
				content: 'black',
			},
			{
				name: 'apple-mobile-web-app-title',
				content: 'Your Brand',
			},
			{
				name: 'format-detection',
				content: 'telephone=no',
			},
			{
				name: 'mobile-web-app-capable',
				content: 'yes',
			},
			{
				name: 'msapplication-config',
				content: '/browserconfig.xml',
			},
			{
				name: 'msapplication-TileColor',
				content: '#2B5797',
			},
			{
				name: 'msapplication-tap-highlight',
				content: 'no',
			},
			{
				name: 'theme-color',
				content: '#000000',
			},
		],
	},
	'website',
)
