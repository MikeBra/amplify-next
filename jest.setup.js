// Mock environment variables
process.env.NEXT_PUBLIC_API_URL = "http://localhost:3000/api"

// Mock fetch globally
global.fetch = jest.fn()

// Mock AWS Amplify auth
jest.mock("aws-amplify/auth", () => ({
	fetchAuthSession: jest.fn(),
}))

// Reset all mocks before each test
beforeEach(() => {
	jest.clearAllMocks()
})

// Add global test utilities
global.console = {
	...console,
	// Keep console.error from cluttering test output
	error: jest.fn(),
}
