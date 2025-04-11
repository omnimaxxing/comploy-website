const redirects = async () => {
	const internetExplorerRedirect = {
		destination: '/ie-incompatible.html',
		has: [
			{
				type: 'header',
				key: 'user-agent',
				value: '(.*Trident.*)', // all ie browsers
			},
		],
		permanent: false,
		source: '/:path((?!ie-incompatible.html$).*)', // all pages except the incompatibility page
	}

	// Plugins directory unified experience redirects
	const pluginsAllRedirect = {
		source: '/plugins/all',
		destination: '/plugins?view=all',
		permanent: false,
	}

	const pluginsAllPathRedirect = {
		source: '/plugins/all/:path*',
		destination: '/plugins/:path*',
		permanent: false,
	}

	const redirects = [internetExplorerRedirect, pluginsAllRedirect, pluginsAllPathRedirect]

	return redirects
}

export default redirects
