'use client'

import React, { useState, useEffect } from 'react'
import { useField, FieldLabel } from '@payloadcms/ui'
import { Icon } from '@iconify/react'

// Popular icon sets to include by default
const popularIconSets = [
	'heroicons',
	'material-symbols',
	'solar',
	'tabler',
	'lucide',
	'ph',
	'mdi',
	'fa6-solid',
	'bi',
	'carbon',
]

// Define the icon set type
interface IconSet {
	name: string
	prefix: string
	icons: string[]
	total: number
}

// Component for the icon selector
const IconSelector = (props: any) => {
	const { path, field } = props
	const { value = '', setValue } = useField<string>({ path })

	const [searchTerm, setSearchTerm] = useState('')
	const [selectedSet, setSelectedSet] = useState('all')
	const [showSelector, setShowSelector] = useState(false)
	const [currentIcon, setCurrentIcon] = useState(value || 'heroicons:sparkles')
	const [iconSets, setIconSets] = useState<IconSet[]>([])
	const [loading, setLoading] = useState(false)
	const [loadingIcons, setLoadingIcons] = useState(false)
	const [initialLoadComplete, setInitialLoadComplete] = useState(false)

	// Update the current icon when the value changes
	useEffect(() => {
		if (value) {
			setCurrentIcon(value)
		}
	}, [value])

	// Set default search term when selector is opened
	useEffect(() => {
		if (showSelector && !searchTerm && !initialLoadComplete) {
			// Set a default search term to show relevant icons immediately
			setSearchTerm('home')
		}
	}, [showSelector, searchTerm, initialLoadComplete])

	// Explicitly trigger search when search term changes
	useEffect(() => {
		if (searchTerm) {
			// Immediate search for initial load
			const timer = setTimeout(() => {
				searchIcons()
			}, 300)

			return () => clearTimeout(timer)
		}
	}, [searchTerm])

	// Fetch icon sets when the component mounts or when the selector is opened
	useEffect(() => {
		if (showSelector) {
			fetchIconSets()
		}
	}, [showSelector])

	// Fetch icon sets function
	const fetchIconSets = async () => {
		// Only fetch if we haven't loaded icons yet or if the selector is opened
		if ((!initialLoadComplete || showSelector) && iconSets.length === 0) {
			setLoading(true)
			try {
				// Start with popular icon sets
				const initialSets = await Promise.all(
					popularIconSets.map(async (prefix) => {
						try {
							// Get collection info
							const response = await fetch(`https://api.iconify.design/${prefix}.json?info=true`)
							const data = await response.json()

							// Get a sample of icons (first 100)
							const iconsResponse = await fetch(`https://api.iconify.design/${prefix}.json?icons=`)
							const iconsData = await iconsResponse.json()

							const iconNames = iconsData.icons ? Object.keys(iconsData.icons).slice(0, 100) : []

							return {
								name: data.info?.name || prefix,
								prefix,
								icons: iconNames,
								total: data.info?.total || iconNames.length,
							}
						} catch (error) {
							console.error(`Error fetching icons for ${prefix}:`, error)
							return {
								name: prefix,
								prefix,
								icons: [],
								total: 0,
							}
						}
					}),
				)

				setIconSets(initialSets.filter((set) => set.icons.length > 0))
				setInitialLoadComplete(true)
			} catch (error) {
				console.error('Error fetching icon sets:', error)
			} finally {
				setLoading(false)
			}
		}
	}

	// Load more icons for a specific set when needed
	const loadMoreIcons = async (prefix: string) => {
		setLoadingIcons(true)
		try {
			const response = await fetch(`https://api.iconify.design/${prefix}.json?icons=`)
			const data = await response.json()

			if (data.icons) {
				const iconNames = Object.keys(data.icons).slice(0, 200) // Get more icons

				setIconSets((prevSets) =>
					prevSets.map((set) => (set.prefix === prefix ? { ...set, icons: iconNames } : set)),
				)
			}
		} catch (error) {
			console.error(`Error loading more icons for ${prefix}:`, error)
		} finally {
			setLoadingIcons(false)
		}
	}

	// Search for icons
	const searchIcons = async () => {
		if (!searchTerm) {
			// If search term is cleared and we have icons loaded, just return
			if (initialLoadComplete && iconSets.length > 0) {
				return
			}

			// If no icons are loaded yet, fetch the default icons
			fetchIconSets()
			return
		}

		setLoading(true)
		try {
			// If we don't have any icon sets loaded yet, fetch them first
			if (iconSets.length === 0) {
				await fetchIconSets()
			}

			// Search in current sets first
			const filteredSets = iconSets.map((set) => ({
				...set,
				icons: set.icons.filter((icon) => icon.toLowerCase().includes(searchTerm.toLowerCase())),
			}))

			// If we're searching in all sets, try to find new matching icon sets
			if (selectedSet === 'all' && searchTerm.length > 2) {
				try {
					const response = await fetch(
						`https://api.iconify.design/search?query=${searchTerm}&limit=10`,
					)
					const data = await response.json()

					if (data.icons && data.icons.length > 0) {
						// Group icons by prefix
						const prefixGroups: Record<string, string[]> = {}

						data.icons.forEach((icon: string) => {
							const [prefix, name] = icon.split(':')
							if (!prefixGroups[prefix]) {
								prefixGroups[prefix] = []
							}
							prefixGroups[prefix].push(name)
						})

						// Add new icon sets that weren't in our original list
						const newSets = Object.entries(prefixGroups)
							.filter(([prefix]) => !iconSets.some((set) => set.prefix === prefix))
							.map(([prefix, icons]) => ({
								name: prefix,
								prefix,
								icons,
								total: icons.length,
							}))

						if (newSets.length > 0) {
							setIconSets((prev) => [...prev, ...newSets])
						}
					}
				} catch (error) {
					console.error('Error searching for icons:', error)
				}
			}

			// Update the filtered sets
			setIconSets((prev) =>
				prev.map((set) => {
					const existingSet = filteredSets.find((fs) => fs.prefix === set.prefix)
					return existingSet || set
				}),
			)
		} catch (error) {
			console.error('Error searching icons:', error)
		} finally {
			setLoading(false)
		}
	}

	// Filter icons based on search term and selected set
	const getFilteredIcons = () => {
		let filteredSets = iconSets

		if (selectedSet !== 'all') {
			filteredSets = filteredSets.filter((set) => set.prefix === selectedSet)
		}

		// Sort sets so that those with icons appear first
		if (searchTerm) {
			filteredSets = [...filteredSets].sort((a, b) => {
				// Sets with more matching icons should appear first
				const aMatchCount = a.icons.length
				const bMatchCount = b.icons.length

				// Sort by number of matching icons (descending)
				return bMatchCount - aMatchCount
			})

			// Filter out empty sets if we have at least some results
			const setsWithIcons = filteredSets.filter((set) => set.icons.length > 0)
			if (setsWithIcons.length > 0) {
				return setsWithIcons
			}
		}

		return filteredSets
	}

	// Handle icon selection
	const handleSelectIcon = (prefix: string, icon: string) => {
		const iconValue = `${prefix}:${icon}`
		setValue(iconValue)
		setCurrentIcon(iconValue)
		setShowSelector(false)
	}

	// Toggle the selector and handle search term
	const toggleSelector = () => {
		const newShowSelector = !showSelector
		setShowSelector(newShowSelector)

		// When opening, set default search term if none exists
		if (newShowSelector && !searchTerm) {
			setSearchTerm('home')
		}

		// Clear search term when closing
		if (!newShowSelector) {
			setSearchTerm('')
		}
	}

	return (
		<div className="icon-selector">
			<div className="icon-selector__header">
				<FieldLabel htmlFor={`field-${path}`} label={field.label} required={field.required} />

				<div className="icon-selector__preview" onClick={toggleSelector}>
					<div className="icon-selector__current-icon">
						{currentIcon && <Icon icon={currentIcon} width={24} height={24} />}
					</div>
					<div className="icon-selector__current-name">{currentIcon}</div>
					<button type="button" className="icon-selector__toggle-button">
						{showSelector ? 'Close' : 'Browse Icons'}
					</button>
				</div>
			</div>

			{showSelector && (
				<div className="icon-selector__panel">
					<div className="icon-selector__controls">
						<input
							type="text"
							value={searchTerm}
							onChange={(e) => setSearchTerm(e.target.value)}
							placeholder="Search icons..."
							className="icon-selector__search"
						/>

						<select
							value={selectedSet}
							onChange={(e) => setSelectedSet(e.target.value)}
							className="icon-selector__set-selector"
						>
							<option value="all">All Icon Sets</option>
							{iconSets.map((set) => (
								<option key={set.prefix} value={set.prefix}>
									{set.name}
								</option>
							))}
						</select>
					</div>

					{loading ? (
						<div className="icon-selector__loading">Loading icons...</div>
					) : (
						<div className="icon-selector__sets">
							{getFilteredIcons().length > 0 ? (
								getFilteredIcons().map((set) => (
									<div key={set.prefix} className="icon-selector__set">
										<h4 className="icon-selector__set-title">{set.name}</h4>
										<div className="icon-selector__icons">
											{set.icons.slice(0, 100).map((icon) => (
												<button
													key={`${set.prefix}:${icon}`}
													type="button"
													className={`icon-selector__icon ${
														currentIcon === `${set.prefix}:${icon}`
															? 'icon-selector__icon--selected'
															: ''
													}`}
													onClick={() => handleSelectIcon(set.prefix, icon)}
													title={`${set.prefix}:${icon}`}
												>
													<Icon icon={`${set.prefix}:${icon}`} width={20} height={20} />
												</button>
											))}
											{set.icons.length === 100 && set.total > 100 && (
												<button
													className="icon-selector__load-more"
													onClick={() => loadMoreIcons(set.prefix)}
													disabled={loadingIcons}
												>
													{loadingIcons ? 'Loading...' : `Load more (${set.total - 100} remaining)`}
												</button>
											)}
										</div>
									</div>
								))
							) : searchTerm ? (
								<div className="icon-selector__no-results">
									No icons found matching "{searchTerm}". Try a different search term.
								</div>
							) : (
								<div className="icon-selector__loading">Loading icon sets... Please wait.</div>
							)}
						</div>
					)}
				</div>
			)}

			<style jsx>{`
				.icon-selector {
					margin-bottom: 16px;
				}
				
				.icon-selector__header {
					margin-bottom: 8px;
				}
				
				.icon-selector__preview {
					display: flex;
					align-items: center;
					gap: 8px;
					padding: 8px;
					border: 1px solid var(--theme-border-color);
					border-radius: 4px;
					background-color: var(--theme-input-bg);
					cursor: pointer;
					margin-top: 4px;
				}
				
				.icon-selector__current-icon {
					display: flex;
					align-items: center;
					justify-content: center;
					width: 32px;
					height: 32px;
					background-color: var(--theme-elevation-100);
					border-radius: 4px;
				}
				
				.icon-selector__current-name {
					flex: 1;
					font-family: monospace;
					font-size: 14px;
					color: var(--theme-text);
				}
				
				.icon-selector__toggle-button {
					padding: 4px 8px;
					background-color: var(--theme-elevation-200);
					border: none;
					border-radius: 4px;
					color: var(--theme-text);
					cursor: pointer;
					font-size: 12px;
				}
				
				.icon-selector__toggle-button:hover {
					background-color: var(--theme-elevation-300);
				}
				
				.icon-selector__panel {
					border: 1px solid var(--theme-border-color);
					border-radius: 4px;
					background-color: var(--theme-elevation-100);
					padding: 16px;
					margin-top: 8px;
					max-height: 400px;
					overflow-y: auto;
				}
				
				.icon-selector__controls {
					display: flex;
					gap: 8px;
					margin-bottom: 16px;
				}
				
				.icon-selector__search {
					flex: 1;
					padding: 8px;
					border: 1px solid var(--theme-border-color);
					border-radius: 4px;
					background-color: var(--theme-input-bg);
					color: var(--theme-text);
				}
				
				.icon-selector__set-selector {
					padding: 8px;
					border: 1px solid var(--theme-border-color);
					border-radius: 4px;
					background-color: var(--theme-input-bg);
					color: var(--theme-text);
				}
				
				.icon-selector__sets {
					display: flex;
					flex-direction: column;
					gap: 24px;
				}
				
				.icon-selector__set-title {
					margin: 0 0 8px 0;
					font-size: 14px;
					color: var(--theme-text);
				}
				
				.icon-selector__icons {
					display: flex;
					flex-wrap: wrap;
					gap: 8px;
				}
				
				.icon-selector__icon {
					display: flex;
					align-items: center;
					justify-content: center;
					width: 36px;
					height: 36px;
					border: 1px solid var(--theme-border-color);
					border-radius: 4px;
					background-color: var(--theme-input-bg);
					cursor: pointer;
					transition: all 0.2s;
				}
				
				.icon-selector__icon:hover {
					background-color: var(--theme-elevation-200);
				}
				
				.icon-selector__icon--selected {
					border-color: var(--theme-success-500);
					background-color: var(--theme-success-100);
				}
				
				.icon-selector__loading,
				.icon-selector__no-results {
					padding: 16px;
					text-align: center;
					color: var(--theme-text);
				}
				
				.icon-selector__load-more {
					padding: 8px 12px;
					background-color: var(--theme-elevation-200);
					border: none;
					border-radius: 4px;
					color: var(--theme-text);
					cursor: pointer;
					font-size: 12px;
					margin-top: 8px;
					width: 100%;
				}
				
				.icon-selector__load-more:hover {
					background-color: var(--theme-elevation-300);
				}
				
				.icon-selector__load-more:disabled {
					opacity: 0.5;
					cursor: not-allowed;
				}
			`}</style>
		</div>
	)
}

export default IconSelector
