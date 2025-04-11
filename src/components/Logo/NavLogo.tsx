'use client'
import { SVGProps, forwardRef, useRef, useEffect, useCallback } from 'react'
import gsap from 'gsap'

export const NavLogo = forwardRef<SVGSVGElement, SVGProps<SVGSVGElement>>(
	({ className, ...props }, ref) => {
		const localRef = useRef<SVGSVGElement>(null)
		const svgRef = (ref as React.RefObject<SVGSVGElement>) || localRef
		const timeoutRef = useRef<NodeJS.Timeout | null>(null)
		const isAnimatingRef = useRef(false)

		const animate = useCallback(() => {
			if (svgRef.current && !isAnimatingRef.current) {
				isAnimatingRef.current = true
				gsap.to(svgRef.current, {
					rotation: 360,
					duration: 1.2,
					ease: 'elastic.out(1, 0.3)',
					transformOrigin: 'center center',
					onComplete: () => {
						gsap.set(svgRef.current, { rotation: 0 })
						isAnimatingRef.current = false
					},
				})
			}
		}, [svgRef])

		const scheduleNextAnimation = useCallback(() => {
			// Random time between 20 and 45 seconds
			const nextAnimationDelay = Math.random() * 25000 + 20000
			timeoutRef.current = setTimeout(() => {
				animate()
				scheduleNextAnimation()
			}, nextAnimationDelay)
		}, [animate])

		useEffect(() => {
			scheduleNextAnimation()

			return () => {
				if (timeoutRef.current) {
					clearTimeout(timeoutRef.current)
				}
			}
		}, [scheduleNextAnimation])

		const handleHover = useCallback(() => {
			if (svgRef.current && !isAnimatingRef.current) {
				gsap.to(svgRef.current, {
					rotation: 360,
					duration: 0.8,
					ease: 'elastic.out(1, 0.3)',
					transformOrigin: 'center center',
				})
			}
		}, [svgRef])

		const handleMouseLeave = useCallback(() => {
			if (svgRef.current && !isAnimatingRef.current) {
				gsap.to(svgRef.current, {
					rotation: 0,
					duration: 0.5,
					ease: 'power2.out',
					transformOrigin: 'center center',
				})
			}
		}, [svgRef])

		return (
			<svg
				ref={svgRef}
				className={className}
				viewBox="0 0 239 269"
				fill="none"
				xmlns="http://www.w3.org/2000/svg"
				onMouseEnter={handleHover}
				onMouseLeave={handleMouseLeave}
				{...props}
			>
				<g className="fill-current stroke-current">
					<path
						d="M115.127 1.35046C91.3093 5.08654 92.864 43.2679 119.187 43.3111C148.835 43.3543 145.963 -3.487 115.127 1.35046Z"
						strokeWidth="2"
						strokeMiterlimit="10"
					/>
					<path
						d="M95.1962 26.7903L38.6849 59.2921C37.8644 60.1127 38.6202 60.4582 39.0304 61.0629C41.4274 64.4535 45.012 66.7426 44.9256 71.7744L101.804 39.9422L96.6862 32.578L95.2178 26.7903H95.1962Z"
						strokeWidth="2"
						strokeMiterlimit="10"
					/>
					<path
						d="M199.862 59.3136L143.372 26.7903C141.321 31.5198 139.572 36.2061 135.404 39.5751L191.894 72.4223C193.189 67.1529 196.105 63.0929 199.862 59.292V59.3136Z"
						strokeWidth="2"
						strokeMiterlimit="10"
					/>
					<path
						d="M126.378 44.5853C121.238 46.6801 116.617 46.2914 111.435 44.5853V112.051C115.883 109.934 121.865 109.934 126.378 112.051V44.5853Z"
						strokeWidth="2"
						strokeMiterlimit="10"
					/>
					<path
						d="M19.4879 57.4348C-10.7219 60.8254 -1.22061 108.228 29.0325 98.0781C51.8572 90.4116 44.4937 54.6274 19.4879 57.4348Z"
						strokeWidth="2"
						strokeMiterlimit="10"
					/>
					<path
						d="M213.552 57.4132C187.165 60.8685 191.138 102.203 218.843 99.3523C246.548 96.5016 241.884 53.6987 213.552 57.4132Z"
						strokeWidth="2"
						strokeMiterlimit="10"
					/>
					<path
						d="M102.819 116.046L46.3076 83.5226C44.796 83.285 45.5086 83.7601 45.2711 84.516C43.8027 89.375 42.5286 92.9383 38.361 96.3073L94.8507 129.155C95.9952 123.777 99.0399 119.804 102.819 116.024V116.046Z"
						strokeWidth="2"
						strokeMiterlimit="10"
					/>
					<path
						d="M192.93 83.5226L136.419 116.024L142.487 125.915L143.027 129.176L199.862 96.6528C200.402 94.7956 198.674 95.3787 197.789 94.2773C195.457 91.3834 192.887 87.3666 192.93 83.5226Z"
						strokeWidth="2"
						strokeMiterlimit="10"
					/>
					<path
						d="M28.8381 100.626C24.1307 102.635 18.6026 102.635 13.8951 100.626V168.092C18.581 166.213 24.2602 165.824 28.8381 168.092V100.626Z"
						strokeWidth="2"
						strokeMiterlimit="10"
					/>
					<path
						d="M223.896 100.626C218.951 102.894 213.963 102.203 208.953 100.626V168.092C213.639 166.213 219.318 165.824 223.896 168.092V100.626Z"
						strokeWidth="2"
						strokeMiterlimit="10"
					/>
					<path
						d="M115.818 113.454C90.0568 117.169 93.6198 157.272 120.483 155.48C149.656 153.536 144.409 109.351 115.818 113.454Z"
						strokeWidth="2"
						strokeMiterlimit="10"
					/>
					<path
						d="M102.128 153.385C101.135 150.794 98.9967 149.066 97.6147 146.496C96.4054 144.25 95.6065 141.982 94.8507 139.564L38.361 173.448C42.723 175.391 44.4289 180.898 45.6382 185.217L102.128 153.385Z"
						strokeWidth="2"
						strokeMiterlimit="10"
					/>
					<path
						d="M199.862 172.087L143.372 139.564C142.357 144.466 139.723 148.915 136.095 152.37L191.894 185.217C193.405 185.455 192.714 184.98 192.93 184.202C194.55 178.803 196.083 176.32 199.84 172.087H199.862Z"
						strokeWidth="2"
						strokeMiterlimit="10"
					/>
					<path
						d="M126.378 157.359C121.001 158.676 116.79 158.87 111.435 157.359V224.111C116.92 222.492 120.893 222.492 126.378 224.111V157.359Z"
						strokeWidth="2"
						strokeMiterlimit="10"
					/>
					<path
						d="M20.2005 169.474C-8.13066 171.655 -4.04941 215.538 25.4695 211.435C50.2809 207.979 47.5816 167.358 20.2005 169.474Z"
						strokeWidth="2"
						strokeMiterlimit="10"
					/>
					<path
						d="M214.978 169.474C187.251 171.677 190.296 214.112 218.929 211.499C245.36 209.081 242.423 167.314 214.978 169.474Z"
						strokeWidth="2"
						strokeMiterlimit="10"
					/>
					<path
						d="M102.128 228.798L45.6382 196.274C44.1914 201.09 42.032 205.517 38.3826 209.081L94.1813 241.906C95.6929 242.144 94.9803 241.669 95.2178 240.913C96.8157 235.643 97.9602 232.642 102.128 228.776V228.798Z"
						strokeWidth="2"
						strokeMiterlimit="10"
					/>
					<path
						d="M199.862 209.405C195.759 205.992 193.254 201.393 191.894 196.274L135.404 229.122C139.421 232.426 141.321 237.285 143.372 241.906L199.862 209.405Z"
						strokeWidth="2"
						strokeMiterlimit="10"
					/>
					<path
						d="M117.222 225.515C92.3458 227.783 92.8425 263.956 113.616 266.785C150.239 271.752 146.093 222.88 117.222 225.515Z"
						strokeWidth="2"
						strokeMiterlimit="10"
					/>
					<path
						d="M120.483 155.458C149.656 153.515 144.409 109.33 115.818 113.433C90.0568 117.147 93.6198 157.251 120.483 155.458Z"
						strokeWidth="2"
						strokeMiterlimit="10"
					/>
					<path
						d="M119.187 43.3111C148.835 43.3543 145.963 -3.487 115.127 1.35046C91.3093 5.08654 92.864 43.2679 119.187 43.3111Z"
						strokeWidth="2"
						strokeMiterlimit="10"
					/>
					<path
						d="M29.0325 98.0781C51.8572 90.4116 44.4937 54.6274 19.4879 57.4348C-10.7219 60.8254 -1.22061 108.228 29.0325 98.0781Z"
						strokeWidth="2"
						strokeMiterlimit="10"
					/>
					<path
						d="M218.864 99.3523C246.202 96.5448 241.905 53.6987 213.574 57.4132C187.186 60.8685 191.16 102.203 218.864 99.3523Z"
						strokeWidth="2"
						strokeMiterlimit="10"
					/>
					<path
						d="M25.4695 211.435C50.2809 207.979 47.5816 167.358 20.2005 169.474C-8.13066 171.655 -4.04941 215.538 25.4695 211.435Z"
						strokeWidth="2"
						strokeMiterlimit="10"
					/>
					<path
						d="M218.929 211.478C245.36 209.059 242.423 167.293 214.978 169.452C187.251 171.655 190.296 214.091 218.929 211.478Z"
						strokeWidth="2"
						strokeMiterlimit="10"
					/>
					<path
						d="M113.616 266.785C150.239 271.752 146.093 222.88 117.222 225.515C92.3458 227.783 92.8425 263.956 113.616 266.785Z"
						strokeWidth="2"
						strokeMiterlimit="10"
					/>
					<path
						d="M46.3076 83.5226C44.796 83.285 45.5086 83.7601 45.2711 84.516C43.8027 89.375 42.5286 92.9383 38.361 96.3073L94.8507 129.155C95.9952 123.777 99.0399 119.804 102.819 116.024L46.3076 83.501V83.5226Z"
						strokeWidth="2"
						strokeMiterlimit="10"
					/>
					<path
						d="M38.6849 59.2921C37.8644 60.1127 38.6202 60.4582 39.0304 61.0629C41.4274 64.4535 45.012 66.7426 44.9256 71.7744L101.804 39.9422L96.6862 32.578L95.2178 26.7903L38.7065 59.2921H38.6849Z"
						strokeWidth="2"
						strokeMiterlimit="10"
					/>
					<path
						d="M143.372 26.7903C141.321 31.5198 139.572 36.2061 135.404 39.5751L191.894 72.4223C193.189 67.1529 196.105 63.0929 199.862 59.292L143.372 26.7687V26.7903Z"
						strokeWidth="2"
						strokeMiterlimit="10"
					/>
					<path
						d="M191.894 196.274L135.404 229.122C139.421 232.426 141.321 237.285 143.372 241.906L199.862 209.405C195.759 205.992 193.254 201.393 191.894 196.274Z"
						strokeWidth="2"
						strokeMiterlimit="10"
					/>
					<path
						d="M97.6147 146.474C96.4054 144.228 95.6065 141.961 94.8507 139.542L38.361 173.426C42.723 175.37 44.4289 180.877 45.6382 185.196L102.128 153.363C101.135 150.772 98.9967 149.044 97.6147 146.474Z"
						strokeWidth="2"
						strokeMiterlimit="10"
					/>
					<path
						d="M143.372 139.564C142.357 144.466 139.723 148.915 136.095 152.37L191.894 185.217C193.405 185.455 192.714 184.98 192.93 184.202C194.55 178.803 196.083 176.32 199.84 172.087L143.351 139.564H143.372Z"
						strokeWidth="2"
						strokeMiterlimit="10"
					/>
					<path
						d="M45.6382 196.274C44.1914 201.09 42.032 205.517 38.3826 209.081L94.1813 241.906C95.6929 242.144 94.9803 241.669 95.2178 240.913C96.8157 235.643 97.9602 232.642 102.128 228.776L45.6382 196.253V196.274Z"
						strokeWidth="2"
						strokeMiterlimit="10"
					/>
					<path
						d="M136.419 116.024L142.487 125.915L143.027 129.176L199.862 96.6528C200.402 94.7956 198.674 95.3787 197.789 94.2773C195.457 91.3834 192.887 87.3666 192.93 83.5226L136.419 116.024Z"
						strokeWidth="2"
						strokeMiterlimit="10"
					/>
					<path
						d="M111.435 44.5853V112.051C115.883 109.934 121.865 109.934 126.378 112.051V44.5853C121.238 46.6801 116.617 46.2914 111.435 44.5853Z"
						strokeWidth="2"
						strokeMiterlimit="10"
					/>
					<path
						d="M208.953 100.626V168.092C213.639 166.213 219.318 165.824 223.896 168.092V100.626C218.951 102.894 213.963 102.203 208.953 100.626Z"
						strokeWidth="2"
						strokeMiterlimit="10"
					/>
					<path
						d="M13.8951 100.626V168.092C18.581 166.213 24.2602 165.824 28.8381 168.092V100.626C24.1307 102.635 18.6026 102.635 13.8951 100.626Z"
						strokeWidth="2"
						strokeMiterlimit="10"
					/>
					<path
						d="M111.435 157.359V224.111C116.92 222.492 120.893 222.492 126.378 224.111V157.359C121.001 158.676 116.79 158.87 111.435 157.359Z"
						strokeWidth="2"
						strokeMiterlimit="10"
					/>
				</g>
			</svg>
		)
	},
)

NavLogo.displayName = 'NavLogo'
