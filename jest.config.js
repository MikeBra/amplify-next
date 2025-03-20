/** @type {import('ts-jest').JestConfigWithTsJest} */
module.exports = {
	preset: "ts-jest",
	testEnvironment: "jsdom",
	moduleNameMapper: {
		"^@/(.*)$": "<rootDir>/app/$1",
	},
	testMatch: ["**/__tests__/**/*.test.ts"],
	setupFiles: ["<rootDir>/jest.setup.js"],
	globals: {
		"ts-jest": {
			tsconfig: "tsconfig.json",
		},
	},
	moduleFileExtensions: ["ts", "tsx", "js", "jsx", "json", "node"],
	transform: {
		"^.+\\.(ts|tsx)$": "ts-jest",
	},
}
