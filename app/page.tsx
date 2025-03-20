"use client"
import { useState, useEffect } from "react"
import { signInWithRedirect, signOut } from "aws-amplify/auth"
import { Amplify } from "aws-amplify"
import outputs from "@/amplify_outputs.json"
import "@aws-amplify/ui-react/styles.css"
import { messages } from "./translations"
import { IntlProvider, FormattedMessage } from "react-intl"
import { todoApi } from "./services/todoApi"
import { Todo } from "./types/todo"
import { useAuth } from "./providers/AuthProvider"
import "./app.css"
import { parseAmplifyConfig } from "aws-amplify/utils"

const amplifyConfig = parseAmplifyConfig(outputs)

Amplify.configure({
	...amplifyConfig,
	API: {
		...amplifyConfig.API,
		REST: {
			...amplifyConfig.API?.REST,
			YourAPIName: {
				endpoint:
					"https://cgsbez671h.execute-api.us-east-1.amazonaws.com/development",
				region: "us-east-1",
			},
		},
	},
})

function App() {
	const { isAuthenticated, username, isLoading: authLoading } = useAuth()
	const [todos, setTodos] = useState<Todo[]>([])
	const [isLoading, setIsLoading] = useState(false)
	const [error, setError] = useState<string | null>(null)

	async function listTodos() {
		try {
			setIsLoading(true)
			const todoList = await todoApi.list()
			setTodos(todoList)
			setError(null)
		} catch (err) {
			setError("Failed to fetch todos")
			console.error(err)
		} finally {
			setIsLoading(false)
		}
	}

	async function deleteTodo(id: string) {
		try {
			await todoApi.delete(id)
			setTodos(todos.filter((todo) => todo.id !== id))
			setError(null)
		} catch (err) {
			setError("Failed to delete todo")
			console.error(err)
		}
	}

	async function createTodo() {
		const content = window.prompt("Todo content")
		if (!content) return

		try {
			const newTodo = await todoApi.create(content)
			setTodos([...todos, newTodo])
			setError(null)
		} catch (err) {
			setError("Failed to create todo")
			console.error(err)
		}
	}

	useEffect(() => {
		if (isAuthenticated) {
			listTodos()
		}
	}, [isAuthenticated])

	useEffect(() => {
		// Check if we're returning from Auth0 logout
		const urlParams = new URLSearchParams(window.location.search)
		const shouldSignOut = urlParams.get("amplifySignOut")

		if (shouldSignOut === "true") {
			// Clean up URL
			window.history.replaceState({}, "", window.location.pathname)
			// Sign out from Amplify
			signOut({ global: true })
		}
	}, [])

	const handleSignOut = async () => {
		try {
			const auth0Domain = process.env.NEXT_PUBLIC_AUTH0_DOMAIN
			const clientId = process.env.NEXT_PUBLIC_AUTH0_CLIENT_ID

			if (!auth0Domain || !clientId) {
				console.error("Auth0 configuration missing")
				return
			}

			// Add amplifySignOut parameter to the return URL
			const baseReturnTo =
				process.env.NEXT_PUBLIC_AUTH0_POST_LOGOUT_REDIRECT_URI ||
				window.location.origin
			const returnTo = encodeURIComponent(
				`${baseReturnTo}?amplifySignOut=true`
			)

			// Redirect to Auth0 logout first
			window.location.href = `https://${auth0Domain}/v2/logout?client_id=${clientId}&returnTo=${returnTo}&federated`
		} catch (error) {
			console.error("Error signing out:", error)
		}
	}

	if (authLoading) {
		return <div>Loading...</div>
	}

	return (
		<main>
			{isAuthenticated && username ? (
				<div>
					<h1>
						<FormattedMessage id="welcome" values={{ username }} />
					</h1>
					<h1>
						<FormattedMessage id="myTodos" />
					</h1>
					<button onClick={createTodo}>+ new</button>
					{isLoading ? (
						<p>Loading...</p>
					) : error ? (
						<p className="error">{error}</p>
					) : (
						<ul>
							{todos.map((todo) => (
								<li key={todo.id} onClick={() => deleteTodo(todo.id)}>
									{todo.content}
								</li>
							))}
						</ul>
					)}
					<div>
						<FormattedMessage id="appHosted" />
						<br />
						<button onClick={handleSignOut}>
							<FormattedMessage id="signOut" />
						</button>
					</div>
				</div>
			) : (
				<button
					onClick={() =>
						signInWithRedirect({
							provider: { custom: "Auth0" },
						})
					}
				>
					<FormattedMessage id="signInWithAuth0" />
				</button>
			)}
		</main>
	)
}

export default function IntlApp() {
	return (
		<IntlProvider messages={messages["en"]} locale="en" defaultLocale="en">
			<App />
		</IntlProvider>
	)
}
