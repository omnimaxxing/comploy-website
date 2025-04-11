/**
 * Generates a random alphanumeric slug of specified length
 * @param length The length of the slug to generate (default: 6)
 * @returns A random alphanumeric string
 */
export function generateRandomSlug(length: number = 6): string {
	const chars = 'abcdefghijklmnopqrstuvwxyz0123456789'
	return Array.from({ length }, () => chars[Math.floor(Math.random() * chars.length)]).join('')
}
