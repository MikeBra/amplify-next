/// <reference types="jest" />

import { todoApi } from "../todoApi"
import { fetchAuthSession } from "aws-amplify/auth"

// Mock AWS Amplify auth
jest.mock("aws-amplify/auth", () => ({
	fetchAuthSession: jest.fn(),
}))

// Mock fetch globally
global.fetch = jest.fn()

describe("todoApi", () => {
	const mockTodo = {
		id: "1",
		content: "Test Todo",
		completed: false,
		createdAt: new Date().toISOString(),
		updatedAt: new Date().toISOString(),
	}

	const mockAuthToken = "mock-auth-token"

	beforeEach(() => {
		// Reset all mocks before each test
		jest.clearAllMocks()

		// Setup default auth token mock
		;(fetchAuthSession as jest.Mock).mockResolvedValue({
			tokens: {
				accessToken: {
					toString: () => mockAuthToken,
				},
			},
		})
	})

	describe("list", () => {
		it("should fetch todos successfully", async () => {
			const mockResponse = [mockTodo]
			;(global.fetch as jest.Mock).mockResolvedValueOnce({
				ok: true,
				json: () => Promise.resolve(mockResponse),
			})

			const result = await todoApi.list()
			expect(result).toEqual(mockResponse)
			expect(global.fetch).toHaveBeenCalledWith(
				`${process.env.NEXT_PUBLIC_API_URL}/todos`,
				expect.objectContaining({
					headers: {
						Authorization: `Bearer ${mockAuthToken}`,
					},
				})
			)
		})

		it("should handle auth token error", async () => {
			;(fetchAuthSession as jest.Mock).mockRejectedValueOnce(
				new Error("Auth error")
			)

			await expect(todoApi.list()).rejects.toThrow("Auth error")
			expect(global.fetch).not.toHaveBeenCalled()
		})

		it("should handle fetch error", async () => {
			;(global.fetch as jest.Mock).mockResolvedValueOnce({
				ok: false,
				status: 500,
			})

			await expect(todoApi.list()).rejects.toThrow("Failed to fetch todos")
		})
	})

	describe("create", () => {
		it("should create a todo successfully", async () => {
			const newTodoContent = "New Todo"
			;(global.fetch as jest.Mock).mockResolvedValueOnce({
				ok: true,
				json: () => Promise.resolve(mockTodo),
			})

			const result = await todoApi.create(newTodoContent)
			expect(result).toEqual(mockTodo)
			expect(global.fetch).toHaveBeenCalledWith(
				`${process.env.NEXT_PUBLIC_API_URL}/todos`,
				expect.objectContaining({
					method: "POST",
					headers: {
						"Content-Type": "application/json",
						Authorization: `Bearer ${mockAuthToken}`,
					},
					body: JSON.stringify({ content: newTodoContent }),
				})
			)
		})

		it("should handle auth token error", async () => {
			;(fetchAuthSession as jest.Mock).mockRejectedValueOnce(
				new Error("Auth error")
			)

			await expect(todoApi.create("New Todo")).rejects.toThrow("Auth error")
			expect(global.fetch).not.toHaveBeenCalled()
		})

		it("should handle fetch error", async () => {
			;(global.fetch as jest.Mock).mockResolvedValueOnce({
				ok: false,
				status: 400,
			})

			await expect(todoApi.create("New Todo")).rejects.toThrow(
				"Failed to create todo"
			)
		})
	})

	describe("delete", () => {
		it("should delete a todo successfully", async () => {
			;(global.fetch as jest.Mock).mockResolvedValueOnce({
				ok: true,
			})

			await todoApi.delete(mockTodo.id)
			expect(global.fetch).toHaveBeenCalledWith(
				`${process.env.NEXT_PUBLIC_API_URL}/todos/${mockTodo.id}`,
				expect.objectContaining({
					method: "DELETE",
					headers: {
						Authorization: `Bearer ${mockAuthToken}`,
					},
				})
			)
		})

		it("should handle auth token error", async () => {
			;(fetchAuthSession as jest.Mock).mockRejectedValueOnce(
				new Error("Auth error")
			)

			await expect(todoApi.delete(mockTodo.id)).rejects.toThrow("Auth error")
			expect(global.fetch).not.toHaveBeenCalled()
		})

		it("should handle fetch error", async () => {
			;(global.fetch as jest.Mock).mockResolvedValueOnce({
				ok: false,
				status: 404,
			})

			await expect(todoApi.delete(mockTodo.id)).rejects.toThrow(
				"Failed to delete todo"
			)
		})
	})
})
