export const formatPrice = (price: number, currency: string = 'USD'): string => {
	return new Intl.NumberFormat('en-US', {
		style: 'currency',
		currency,
		minimumFractionDigits: 2,
		maximumFractionDigits: 2,
	}).format(price / 100) // Assuming price is in cents
}
