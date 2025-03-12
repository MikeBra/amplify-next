/** @type {import('next').NextConfig} */
const nextConfig = {
	reactStrictMode: true,
	swcMinify: true,
	env: {
		NEXT_PUBLIC_AUTH0_DOMAIN: process.env.NEXT_PUBLIC_AUTH0_DOMAIN,
		NEXT_PUBLIC_AUTH0_CLIENT_ID: process.env.NEXT_PUBLIC_AUTH0_CLIENT_ID,
		NEXT_PUBLIC_API_URL: process.env.NEXT_PUBLIC_API_URL,
	},
	// Required for AWS Amplify
	webpack: (config, { isServer, dev }) => {
		config.resolve.fallback = {
			process: require.resolve("process/browser"),
			path: require.resolve("path-browserify"),
			crypto: require.resolve("crypto-browserify"),
			stream: require.resolve("stream-browserify"),
			util: require.resolve("util"),
			buffer: require.resolve("buffer"),
			asset: require.resolve("assert"),
		}

		// Modify source map generation
		if (dev) {
			config.devtool = "eval-source-map"
			config.output = {
				...config.output,
				devtoolModuleFilenameTemplate: function (info) {
					return `webpack:///${info.resourcePath}?${info.loaders}`
				},
			}
		}

		return config
	},
	experimental: {
		// Enable more detailed source maps
		outputFileTracingIncludes: {
			"**/*.map": ["**/*.map"],
		},
	},
	productionBrowserSourceMaps: true,
}

module.exports = nextConfig
