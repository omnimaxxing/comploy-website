import { heroui } from '@heroui/theme'
import svgToDataUri from 'mini-svg-data-uri'
import type { Config } from 'tailwindcss'
import colors from 'tailwindcss/colors'
import defaultTheme from 'tailwindcss/defaultTheme'
import flattenColorPalette from 'tailwindcss/lib/util/flattenColorPalette'
const config: Config = {
	content: {
		files: [
			'./src/pages/**/*.{js,ts,jsx,tsx,mdx}',
			'./src/components/**/*.{js,ts,jsx,tsx,mdx}',
			'./src/app/**/*.{js,ts,jsx,tsx,mdx}',
			'./src/**/*.{js,ts,jsx,tsx,mdx}',
			'./node_modules/@heroui/theme/dist/**/*.{js,ts,jsx,tsx}',
		],
	},
	darkMode: 'selector',
	theme: {
		extend: {
			dropShadow: {
				'3xl': '0 35px 35px rgba(0, 0, 0, 0.25)',
				'4xl': ['0 35px 35px rgba(0, 0, 0, 0.75)', '0 45px 65px rgba(0, 0, 0, 0.35)'],
			},
			clipPath: {
				slanted: 'polygon(25% 0%, 100% 0%, 75% 100%, 0% 100%)',
			},
			animation: {
				'meteor-effect': 'meteor 5s linear infinite',
				'meteor-effect-fast': 'meteor-fast 2.5s linear infinite',
				'meteor-effect-squiggly': 'meteor-squiggly 7s linear infinite',
				'meteor-effect-spectacular': 'meteor-spectacular 6s linear infinite',
				'meteor-effect-elegant': 'meteor-elegant 8s linear infinite',
				'twinkle-star': 'twinkle 4s ease-in-out infinite',
				'twinkle-slow': 'twinkle 8s ease-in-out infinite',
				'orbit-particle': 'orbit-particle 30s linear infinite',
				'orbit-particle-reverse': 'orbit-particle 25s linear reverse infinite',
				'nebula-pulse': 'nebula-pulse 8s ease-in-out infinite',
				'star-shimmer': 'star-shimmer 6s ease-in-out infinite',
				'cosmic-rotation': 'cosmic-rotation 120s linear infinite',
				'cosmic-drift': 'cosmic-drift 15s ease-in-out infinite',
				'cosmic-drift-slow': 'cosmic-drift 25s ease-in-out infinite',
				'cosmic-glow': 'cosmic-glow 6s ease-in-out infinite',
				'float-slow': 'float 6s ease-in-out infinite',
				'float-reverse-slow': 'float-reverse 8s ease-in-out infinite',
				'pulse-slow': 'pulse 3s ease-in-out infinite',
				'pulse-subtle': 'pulse-subtle 2.5s cubic-bezier(0.4, 0, 0.2, 1) infinite',
				'draw-line': 'draw-line 2s ease-out forwards',
				aurora: 'aurora 60s linear infinite',
				first: 'moveVertical 30s ease infinite',
				second: 'moveInCircle 20s reverse infinite',
				third: 'moveInCircle 40s linear infinite',
				fourth: 'moveHorizontal 40s ease infinite',
				fifth: 'moveInCircle 20s ease infinite',
				'wave-pulse': 'wave-pulse 4s ease-in-out infinite',
				'rainbow-text': 'rainbow-text 3s linear infinite',
				'rainbow-border': 'rainbow-border 3s linear infinite',
				float: 'float 3s ease-in-out infinite',
				'ping-slow': 'ping 3s cubic-bezier(0, 0, 0.2, 1) infinite',
				'fade-in': 'fade-in 0.2s ease-out',
				pulse: 'pulse 1s ease-in-out infinite',
				'rotate-3d': 'rotate3d 15s cubic-bezier(0.4, 0, 0.2, 1) infinite',
				'float-3d': 'float3d 4s cubic-bezier(0.4, 0, 0.2, 1) infinite',
				'pulse-3d': 'pulse3d 2s cubic-bezier(0.4, 0, 0.2, 1) infinite',
				shimmer: 'shimmer 3s ease-in-out infinite',
				'scrolling-banner': 'scrolling-banner var(--duration) linear infinite',
				'scrolling-banner-vertical': 'scrolling-banner-vertical var(--duration) linear infinite',
				'trailLeft-8': 'moveLeftFade 8s linear infinite',
				'trailLeft-9': 'moveLeftFade 9s linear infinite',
				'trailLeft-10': 'moveLeftFade 10s linear infinite',
				'trailLeft-11': 'moveLeftFade 11s linear infinite',
				'trailLeft-12': 'moveLeftFade 12s linear infinite',
				'trailRight-7': 'moveRightFade 7s linear infinite',
				'trailRight-8': 'moveRightFade 8s linear infinite',
				'trailRight-9': 'moveRightFade 9s linear infinite',
				'trailDown-8': 'moveDownFade 8s linear infinite',
				'trailDown-9': 'moveDownFade 9s linear infinite',
				'trailDown-10': 'moveDownFade 10s linear infinite',
				'trailUp-7': 'moveUpFade 7s linear infinite',
				'trailUp-8': 'moveUpFade 8s linear infinite',
				'trailUp-9': 'moveUpFade 9s linear infinite',
				moveGradientX: 'moveGradientX 8s linear infinite',
				moveGradientY: 'moveGradientY 8s linear infinite',
				jiggle: 'jiggle 0.5s ease-in-out',
				'tail-wag': 'tail-wag 0.5s ease-in-out',
			},
			keyframes: {
				meteor: {
					'0%': { transform: 'rotate(215deg) translateX(0)', opacity: '0' },
					'5%': { transform: 'rotate(215deg) translateX(-25px)', opacity: '0.3' },
					'10%': { transform: 'rotate(215deg) translateX(-50px)', opacity: '0.6' },
					'15%': { transform: 'rotate(215deg) translateX(-75px)', opacity: '1' },
					'70%': { transform: 'rotate(215deg) translateX(-350px)', opacity: '1' },
					'100%': {
						transform: 'rotate(215deg) translateX(-500px)',
						opacity: '0',
					},
				},
				'meteor-fast': {
					'0%': { transform: 'rotate(215deg) translateX(0)', opacity: '0' },
					'5%': { transform: 'rotate(215deg) translateX(-25px)', opacity: '0.3' },
					'10%': { transform: 'rotate(215deg) translateX(-50px)', opacity: '0.7' },
					'15%': { transform: 'rotate(215deg) translateX(-75px)', opacity: '1' },
					'50%': { transform: 'rotate(215deg) translateX(-250px)', opacity: '1' },
					'100%': {
						transform: 'rotate(215deg) translateX(-500px)',
						opacity: '0',
					},
				},
				'meteor-squiggly': {
					'0%': { transform: 'rotate(215deg) translateX(0) translateY(0)', opacity: '0' },
					'5%': { transform: 'rotate(215deg) translateX(-25px) translateY(3px)', opacity: '0.3' },
					'10%': { transform: 'rotate(215deg) translateX(-50px) translateY(6px)', opacity: '0.6' },
					'15%': { transform: 'rotate(215deg) translateX(-75px) translateY(10px)', opacity: '1' },
					'30%': { transform: 'rotate(215deg) translateX(-150px) translateY(15px)', opacity: '1' },
					'45%': { transform: 'rotate(215deg) translateX(-225px) translateY(10px)', opacity: '1' },
					'60%': { transform: 'rotate(215deg) translateX(-300px) translateY(0px)', opacity: '1' },
					'75%': {
						transform: 'rotate(215deg) translateX(-375px) translateY(-5px)',
						opacity: '0.7',
					},
					'100%': { transform: 'rotate(215deg) translateX(-500px) translateY(0)', opacity: '0' },
				},
				'meteor-elegant': {
					'0%': {
						transform: 'rotate(215deg) translateX(0) translateY(0)',
						opacity: '0',
					},
					'5%': {
						transform: 'rotate(215deg) translateX(-25px) translateY(3px)',
						opacity: '0.3',
					},
					'10%': {
						transform: 'rotate(215deg) translateX(-50px) translateY(10px)',
						opacity: '0.5',
					},
					'15%': {
						transform: 'rotate(215deg) translateX(-75px) translateY(12px)',
						opacity: '0.7',
					},
					'30%': {
						transform: 'rotate(215deg) translateX(-150px) translateY(15px)',
						opacity: '0.9',
					},
					'50%': {
						transform: 'rotate(215deg) translateX(-250px) translateY(10px)',
						opacity: '0.9',
					},
					'70%': {
						transform: 'rotate(215deg) translateX(-350px) translateY(0)',
						opacity: '0.8',
					},
					'85%': {
						transform: 'rotate(215deg) translateX(-425px) translateY(-5px)',
						opacity: '0.4',
					},
					'100%': {
						transform: 'rotate(215deg) translateX(-500px) translateY(0)',
						opacity: '0',
					},
				},
				'meteor-spectacular': {
					'0%': { transform: 'rotate(215deg) translateX(0)', opacity: '0' },
					'5%': { transform: 'rotate(215deg) translateX(-25px)', opacity: '0.3' },
					'10%': { transform: 'rotate(215deg) translateX(-50px)', opacity: '0.6' },
					'15%': { transform: 'rotate(215deg) translateX(-75px)', opacity: '0.8' },
					'30%': { transform: 'rotate(215deg) translateX(-150px)', opacity: '1.0' },
					'50%': { transform: 'rotate(215deg) translateX(-250px)', opacity: '1.0' },
					'70%': { transform: 'rotate(215deg) translateX(-350px)', opacity: '0.9' },
					'85%': { transform: 'rotate(215deg) translateX(-425px)', opacity: '0.6' },
					'100%': { transform: 'rotate(215deg) translateX(-500px)', opacity: '0' },
				},
				twinkle: {
					'0%': {
						opacity: '0.2',
						transform: 'scale(0.85)',
						filter: 'blur(1px)',
					},
					'50%': {
						opacity: '1',
						transform: 'scale(1.1)',
						filter: 'blur(0.5px)',
					},
					'100%': {
						opacity: '0.2',
						transform: 'scale(0.85)',
						filter: 'blur(1px)',
					},
				},
				'orbit-particle': {
					'0%': { transform: 'rotate(0deg) translateX(-50%)' },
					'100%': { transform: 'rotate(360deg) translateX(-50%)' },
				},
				'nebula-pulse': {
					'0%, 100%': {
						opacity: '0.4',
						transform: 'scale(1)',
						filter: 'blur(10px)',
					},
					'50%': {
						opacity: '0.8',
						transform: 'scale(1.15)',
						filter: 'blur(15px)',
					},
				},
				'star-shimmer': {
					'0%, 100%': {
						opacity: '0.2',
						transform: 'scale(0.9)',
						filter: 'blur(0.5px)',
					},
					'50%': {
						opacity: '1',
						transform: 'scale(1.1)',
						filter: 'blur(0px)',
					},
				},
				'cosmic-rotation': {
					'0%': { transform: 'rotate(0deg)' },
					'100%': { transform: 'rotate(360deg)' },
				},
				'cosmic-glow': {
					'0%, 100%': {
						opacity: '0.5',
						boxShadow:
							'0 0 15px 0px rgba(255, 255, 255, 0.4), 0 0 30px 0px rgba(128, 128, 255, 0.2)',
					},
					'50%': {
						opacity: '0.8',
						boxShadow:
							'0 0 20px 5px rgba(255, 255, 255, 0.5), 0 0 40px 5px rgba(128, 128, 255, 0.4)',
					},
				},
				'float-reverse': {
					'0%, 100%': { transform: 'translateY(0)' },
					'50%': { transform: 'translateY(5px)' },
				},
				aurora: {
					from: {
						backgroundPosition: '50% 50%, 50% 50%',
					},
					to: {
						backgroundPosition: '350% 50%, 350% 50%',
					},
				},
				'scrolling-banner': {
					from: { transform: 'translateX(0)' },
					to: { transform: 'translateX(calc(-50% - var(--gap)/2))' },
				},
				'scrolling-banner-vertical': {
					from: { transform: 'translateY(0)' },
					to: { transform: 'translateY(calc(-50% - var(--gap)/2))' },
				},
				shimmer: {
					'0%': {
						backgroundPosition: '300% 0',
					},
					'50%': {
						backgroundPosition: '0% 0',
					},
					'100%': {
						backgroundPosition: '-300% 0',
					},
				},
				scroll: {
					to: {
						transform: 'translate(calc(-50% - 0.5rem))',
					},
				},
				moveHorizontal: {
					'0%': {
						transform: 'translateX(-50%) translateY(-10%)',
					},
					'50%': {
						transform: 'translateX(50%) translateY(10%)',
					},
					'100%': {
						transform: 'translateX(-50%) translateY(-10%)',
					},
				},
				moveInCircle: {
					'0%': {
						transform: 'rotate(0deg)',
					},
					'50%': {
						transform: 'rotate(180deg)',
					},
					'100%': {
						transform: 'rotate(360deg)',
					},
				},
				moveVertical: {
					'0%': {
						transform: 'translateY(-50%)',
					},
					'50%': {
						transform: 'translateY(50%)',
					},
					'100%': {
						transform: 'translateY(-50%)',
					},
				},
				'rainbow-text': {
					'0%, 100%': {
						'background-position': '0% 50%',
					},
					'50%': {
						'background-position': '100% 50%',
					},
				},
				'rainbow-border': {
					'0%, 100%': {
						'background-position': '0% 50%',
					},
					'50%': {
						'background-position': '100% 50%',
					},
				},
				float: {
					'0%, 100%': { transform: 'translateY(0)' },
					'50%': { transform: 'translateY(-5px)' },
				},
				'fade-in': {
					'0%': { opacity: '0' },
					'100%': { opacity: '1' },
				},
				pulse: {
					'0%, 100%': {
						opacity: '0.2',
						transform: 'scale(1)',
					},
					'50%': {
						opacity: '0.6',
						transform: 'scale(1.1)',
					},
				},
				rotate3d: {
					'0%': {
						transform: 'rotateX(0deg) rotateY(0deg) rotateZ(0deg)',
						opacity: '0.3',
					},
					'25%': {
						transform: 'rotateX(25deg) rotateY(90deg) rotateZ(0deg)',
						opacity: '0.5',
					},
					'50%': {
						transform: 'rotateX(25deg) rotateY(180deg) rotateZ(5deg)',
						opacity: '0.8',
					},
					'75%': {
						transform: 'rotateX(25deg) rotateY(270deg) rotateZ(5deg)',
						opacity: '1',
					},
					'100%': {
						transform: 'rotateX(20deg) rotateY(360deg) rotateZ(0deg)',
						opacity: '0.8',
					},
				},
				float3d: {
					'0%': {
						transform: 'translate3d(0, 0, 0)',
						opacity: '0.3',
					},
					'25%': {
						transform: 'translate3d(10px, -10px, 5px)',
						opacity: '0.6',
					},
					'50%': {
						transform: 'translate3d(0, -20px, 10px)',
						opacity: '0.8',
					},
					'75%': {
						transform: 'translate3d(-10px, -10px, 5px)',
						opacity: '0.6',
					},
					'100%': {
						transform: 'translate3d(0, 0, 0)',
						opacity: '0.3',
					},
				},
				pulse3d: {
					'0%, 100%': {
						opacity: '0.2',
						transform: 'scale3d(0.95, 0.95, 1)',
					},
					'50%': {
						opacity: '0.8',
						transform: 'scale3d(1.05, 1.05, 1)',
					},
				},
				'pulse-subtle': {
					'0%, 100%': { transform: 'scale(1)', filter: 'brightness(1)' },
					'50%': { transform: 'scale(1.05)', filter: 'brightness(1.15)' },
				},
				moveLeftFade: {
					'0%': { transform: 'translateX(0)', opacity: '0' },
					'10%': { opacity: '1' },
					'90%': { opacity: '1' },
					'100%': { transform: 'translateX(-40vw)', opacity: '0' },
				},
				moveRightFade: {
					'0%': { transform: 'translateX(0)', opacity: '0' },
					'10%': { opacity: '1' },
					'90%': { opacity: '1' },
					'100%': { transform: 'translateX(20vw)', opacity: '0' },
				},
				moveDownFade: {
					'0%': { transform: 'translateY(0)', opacity: '0' },
					'10%': { opacity: '1' },
					'90%': { opacity: '1' },
					'100%': { transform: 'translateY(30vh)', opacity: '0' },
				},
				moveUpFade: {
					'0%': { transform: 'translateY(0)', opacity: '0' },
					'10%': { opacity: '1' },
					'90%': { opacity: '1' },
					'100%': { transform: 'translateY(-30vh)', opacity: '0' },
				},
				moveGradientX: {
					'0%': { transform: 'translateX(-100%)' },
					'100%': { transform: 'translateX(100%)' },
				},
				moveGradientY: {
					'0%': { transform: 'translateY(-100%)' },
					'100%': { transform: 'translateY(100%)' },
				},
				'draw-line': {
					'0%': {
						width: '0',
						opacity: '0',
					},
					'100%': {
						width: '100%',
						opacity: '1',
					},
				},
				jiggle: {
					'0%, 100%': { transform: 'translateX(0)' },
					'25%': { transform: 'translateX(-2px)' },
					'75%': { transform: 'translateX(2px)' },
				},
				'tail-wag': {
					'0%, 100%': { transform: 'rotate(0deg)' },
					'20%': { transform: 'rotate(-15deg)' },
					'40%': { transform: 'rotate(15deg)' },
					'60%': { transform: 'rotate(-10deg)' },
					'80%': { transform: 'rotate(10deg)' },
				},
			},

			colors: {
				primary: {
					50: 'oklch(99.11% 0 NaN / <alpha-value>)',
					100: 'oklch(95.51% 0 NaN / <alpha-value>)',
					200: 'oklch(87.61% 0 NaN / <alpha-value>)',
					300: 'oklch(78.89% 0 NaN / <alpha-value>)',
					400: 'oklch(70.9% 0 NaN / <alpha-value>)',
					500: 'oklch(61.67% 0 NaN / <alpha-value>)',
					600: 'oklch(52.78% 0 NaN / <alpha-value>)',
					700: 'oklch(42.76% 0 NaN / <alpha-value>)',
					800: 'oklch(32.11% 0 NaN / <alpha-value>)',
					900: 'oklch(21.78% 0 NaN / <alpha-value>)',
					950: 'oklch(15.43% 0 NaN / <alpha-value>)',
				},

				accent: {
					50: 'oklch(100% 0 NaN / <alpha-value>)',
					100: 'oklch(98.88% 0.007 312.3 / <alpha-value>)',
					200: 'oklch(87.2% 0.077 312.03 / <alpha-value>)',
					300: 'oklch(76% 0.148 311.68 / <alpha-value>)',
					400: 'oklch(65.66% 0.214 310.18 / <alpha-value>)',
					500: 'oklch(57.67% 0.26 308.02 / <alpha-value>)',
					600: 'oklch(49.69% 0.246 305.87 / <alpha-value>)',
					700: 'oklch(40.31% 0.197 306.27 / <alpha-value>)',
					800: 'oklch(30.64% 0.145 307.2 / <alpha-value>)',
					900: 'oklch(19.97% 0.087 308.29 / <alpha-value>)',
					950: 'oklch(14.77% 0.057 310.31 / <alpha-value>)',
				},
			},

			utopia: (theme) => ({
				// Minimum viewport width where fluid scaling begins
				// Below 345px, font sizes will be fixed at their minimum values
				minScreen: '320px',

				// Base font size (step-0) at minimum viewport width (345px)
				// This means text with fl-text-step-0 will be 18px when viewport is 345px or smaller
				minSize: 17,

				// Scale ratio for calculating size steps at minimum viewport
				// 1.2 means each step up multiplies size by 1.2
				// Example at 345px viewport:
				// step-0: 18px
				// step-1: 18px * 1.2 = 21.6px
				// step-2: 21.6px * 1.2 = 25.92px
				minScale: 1.2,

				// Maximum viewport width where fluid scaling stops
				// Above 1920px, font sizes will be fixed at their maximum values
				maxScreen: '2560px',

				// Base font size (step-0) at maximum viewport width (1920px)
				// This means text with fl-text-step-0 will be 20px when viewport is 1920px or larger
				maxSize: 20,

				// Scale ratio for calculating size steps at maximum viewport
				// 1.25 means each step up multiplies size by 1.25
				// Example at 1920px viewport:
				// step-0: 20px
				// step-1: 20px * 1.25 = 25px
				// step-2: 25px * 1.25 = 31.25px
				maxScale: 1.333,

				// Available text size steps
				// Negative steps go smaller than base size
				// Positive steps go larger than base size
				// Example with fl-text-step-* classes:
				// step--2: two steps smaller than base
				// step-0: base size
				// step-7: seven steps larger than base
				textSizes: [
					'step--2', // Smallest text size
					'step--1', // Smaller than base
					'step-0', // Base text size
					'step-1', // One step up
					'step-2', // Two steps up
					'step-3', // Three steps up
					'step-4', // Four steps up
					'step-5', // Five steps up
					'step-6', // Six steps up
					'step-7', // Largest text size
				],

				// Spacing sizes for margins/padding (currently commented out)
				// These would create fluid space utilities if uncommented
				spacingSizes: {
					/*
					"3xs": 0.25,  // Tiny spacing (multiplier of base size)
					"2xs": 0.5,   // Extra extra small spacing
					xs: 0.75,     // Extra small spacing
					s: 1,         // Small spacing
					m: 1.5,       // Medium spacing
					l: 2,         // Large spacing
					xl: 3,        // Extra large spacing
					"2xl": 4,     // Extra extra large spacing
					"3xl": 6,     // Huge spacing
					*/
				},

				// For defining specific spacing pairs (currently empty)
				// Could be used to create specific margin/padding combinations
				spacingPairs: {},
			}),

			fontFamily: {
				//sans: ['var(--font-body)', 'system-ui', 'sans-serif'],
				//body: ['var(--font-body)', 'system-ui', 'sans-serif'],
				sans: ['adobe-clean', 'system-ui', 'sans-serif'],
				mono: ['adobe-clean-mono', 'monospace'],
			},

			backgroundImage: {
				'gradient-dark-primary':
					'linear-gradient(to bottom, rgba(22, 22, 22, 0.6), rgba(16, 16, 16, 0.6))',
				'gradient-radial': 'radial-gradient(var(--tw-gradient-stops))',
				'home-texture': "url('/home-pattern.svg')  ",
				'footer-texture': "url('/footer-pattern.svg')",
			},

			backdropFilter: { none: 'none', blur: 'blur(20px)' },

			rotate: {
				'x-12': 'rotateX(12deg)',
				'y-12': 'rotateY(12deg)',
			},
			transformStyle: {
				'3d': 'preserve-3d',
			},
			perspective: {
				'800': '800px',
			},
		},
	},

	plugins: [
		heroui({
			themes: {
				dark: {
					colors: {
						default: {
							'50': '#e3e3e3',
							'100': '#bcbcbc',
							'200': '#949494',
							'300': '#6d6d6d',
							'400': '#454545',
							'500': '#1e1e1e',
							'600': '#191919',
							'700': '#141414',
							'800': '#0e0e0e',
							'900': '#090909',
							foreground: '#fff',
							DEFAULT: '#1e1e1e',
						},
						primary: {
							'50': '#ecdffd',
							'100': '#d2b3fa',
							'200': '#b786f6',
							'300': '#9d59f3',
							'400': '#822df0',
							'500': '#6800ed',
							'600': '#5600c4',
							'700': '#44009a',
							'800': '#310071',
							'900': '#1f0047',
							foreground: '#fff',
							DEFAULT: '#6800ed',
						},
						secondary: {
							'50': '#eee4f8',
							'100': '#d7bfef',
							'200': '#bf99e5',
							'300': '#a773db',
							'400': '#904ed2',
							'500': '#7828c8',
							'600': '#6321a5',
							'700': '#4e1a82',
							'800': '#39135f',
							'900': '#240c3c',
							foreground: '#fff',
							DEFAULT: '#7828c8',
						},
						success: {
							'50': '#e2f8ec',
							'100': '#b9efd1',
							'200': '#91e5b5',
							'300': '#68dc9a',
							'400': '#40d27f',
							'500': '#17c964',
							'600': '#13a653',
							'700': '#0f8341',
							'800': '#0b5f30',
							'900': '#073c1e',
							foreground: '#000',
							DEFAULT: '#17c964',
						},
						warning: {
							'50': '#fef4e4',
							'100': '#fce4bd',
							'200': '#fad497',
							'300': '#f9c571',
							'400': '#f7b54a',
							'500': '#f5a524',
							'600': '#ca881e',
							'700': '#9f6b17',
							'800': '#744e11',
							'900': '#4a320b',
							foreground: '#000',
							DEFAULT: '#f5a524',
						},
						danger: {
							'50': '#fee1eb',
							'100': '#fbb8cf',
							'200': '#f98eb3',
							'300': '#f76598',
							'400': '#f53b7c',
							'500': '#f31260',
							'600': '#c80f4f',
							'700': '#9e0c3e',
							'800': '#73092e',
							'900': '#49051d',
							foreground: '#000',
							DEFAULT: '#f31260',
						},
						background: '#000000',
						foreground: '#ffffff',
						content1: {
							DEFAULT: '#ffffff',
							foreground: '#000',
						},
						content2: {
							DEFAULT: '#27272a',
							foreground: '#fff',
						},
						content3: {
							DEFAULT: '#3f3f46',
							foreground: '#fff',
						},
						content4: {
							DEFAULT: '#52525b',
							foreground: '#fff',
						},
						focus: '#df00ff',
						overlay: '#f3f3f3',
					},
				},
				light: {
					colors: {
						default: {
							'50': '#090909',
							'100': '#0e0e0e',
							'200': '#141414',
							'300': '#191919',
							'400': '#1e1e1e',
							'500': '#454545',
							'600': '#6d6d6d',
							'700': '#949494',
							'800': '#bcbcbc',
							'900': '#e3e3e3',
							foreground: '#000',
							DEFAULT: '#e3e3e3',
						},
						primary: {
							'50': '#1f0047',
							'100': '#310071',
							'200': '#44009a',
							'300': '#5600c4',
							'400': '#6800ed',
							'500': '#822df0',
							'600': '#9d59f3',
							'700': '#b786f6',
							'800': '#d2b3fa',
							'900': '#ecdffd',
							foreground: '#000',
							DEFAULT: '#6800ed',
						},
						secondary: {
							'50': '#240c3c',
							'100': '#39135f',
							'200': '#4e1a82',
							'300': '#6321a5',
							'400': '#7828c8',
							'500': '#904ed2',
							'600': '#a773db',
							'700': '#bf99e5',
							'800': '#d7bfef',
							'900': '#eee4f8',
							foreground: '#000',
							DEFAULT: '#7828c8',
						},
						success: {
							'50': '#073c1e',
							'100': '#0b5f30',
							'200': '#0f8341',
							'300': '#13a653',
							'400': '#17c964',
							'500': '#40d27f',
							'600': '#68dc9a',
							'700': '#91e5b5',
							'800': '#b9efd1',
							'900': '#e2f8ec',
							foreground: '#fff',
							DEFAULT: '#17c964',
						},
						warning: {
							'50': '#4a320b',
							'100': '#744e11',
							'200': '#9f6b17',
							'300': '#ca881e',
							'400': '#f5a524',
							'500': '#f7b54a',
							'600': '#f9c571',
							'700': '#fad497',
							'800': '#fce4bd',
							'900': '#fef4e4',
							foreground: '#fff',
							DEFAULT: '#f5a524',
						},
						danger: {
							'50': '#49051d',
							'100': '#73092e',
							'200': '#9e0c3e',
							'300': '#c80f4f',
							'400': '#f31260',
							'500': '#f53b7c',
							'600': '#f76598',
							'700': '#f98eb3',
							'800': '#fbb8cf',
							'900': '#fee1eb',
							foreground: '#fff',
							DEFAULT: '#f31260',
						},
						background: '#ffffff',
						foreground: '#000000',
						content1: {
							DEFAULT: '#000000',
							foreground: '#fff',
						},
						content2: {
							DEFAULT: '#f5f5f5',
							foreground: '#000',
						},
						content3: {
							DEFAULT: '#e5e5e5',
							foreground: '#000',
						},
						content4: {
							DEFAULT: '#d4d4d8',
							foreground: '#000',
						},
						focus: '#6800ed',
						overlay: '#090909',
					},
				},
			},
			layout: {
				disabledOpacity: '0.4',
			},
		}),
		require('tailwindcss-text-fill-stroke'), // no options to configure
		require('tailwind-gradient-mask-image'),
		({ matchUtilities, theme }: any) => {
			matchUtilities(
				{
					'bg-grid': (value: any) => ({
						backgroundImage: `url("${svgToDataUri(
							`<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 32 32" width="32" height="32" fill="none" stroke="${value}"><path d="M0 .5H31.5V32"/></svg>`,
						)}")`,
					}),
					'bg-grid-small': (value: any) => ({
						backgroundImage: `url("${svgToDataUri(
							`<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 32 32" width="8" height="8" fill="none" stroke="${value}"><path d="M0 .5H31.5V32"/></svg>`,
						)}")`,
					}),
					'bg-grid-pattern': (value: any) => ({
						backgroundImage: `url("${svgToDataUri(
							`<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 32 32" width="24" height="24" fill="none" stroke="${value}" stroke-width="1"><path d="M0 0H32M0 8H32M0 16H32M0 24H32M0 32H32M0 0V32M8 0V32M16 0V32M24 0V32M32 0V32"/></svg>`,
						)}")`,
					}),
					'bg-dot': (value: any) => ({
						backgroundImage: `url("${svgToDataUri(
							`<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 32 32" width="16" height="16" fill="none"><circle fill="${value}" id="pattern-circle" cx="10" cy="10" r="2.5"></circle></svg>`,
						)}")`,
					}),
					'bg-diagonal-gradient': (value: any) => ({
						backgroundImage: `url("${svgToDataUri(
							`<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 100 100" width="100" height="100" fill="none">
            <polygon points="0,50 50,0 100,50 50,100" fill="url(#grad1)"/>
            <defs>
              <linearGradient id="grad1" x1="0%" y1="0%" x2="100%" y2="100%">
                <stop offset="0%" style="stop-color:${value};stop-opacity:0.1" />
                <stop offset="100%" style="stop-color:${value};stop-opacity:0.3" />
              </linearGradient>
            </defs>
          </svg>`,
						)}")`,
					}),
				},
				{ values: flattenColorPalette(theme('backgroundColor')), type: 'color' },
			)
		},
		addVariablesForColors,
		require('@tailwindcss/typography'),
		require('@tailwindcss/aspect-ratio'),
		require('tailwind-utopia')({
			//useClamp: true, // Use clamp function for generating styles
			prefix: 'fl-', // Prefix for utility classes
			baseTextSize: 'step-0', // Base text size step
			generateSpacing: true, // Enable fluid spacing utilities
			generateAllSpacingPairs: true, // Generate all spacing pairs
			generateFallbacks: true, // Generate fallbacks for older browsers
		}),
	],
}

export default config

// This plugin adds each Tailwind color as a global CSS variable, e.g. var(--gray-200).
function addVariablesForColors({ addBase, theme }: any) {
	let allColors = flattenColorPalette(theme('colors'))
	let newVars = Object.fromEntries(Object.entries(allColors).map(([key, val]) => [`--${key}`, val]))

	addBase({
		':root': newVars,
	})
}
