"use client"
import {
	createContext,
	useContext,
	useEffect,
	useState,
	ReactNode,
} from "react"
import { getCurrentUser, fetchUserAttributes } from "aws-amplify/auth"
import { Hub } from "aws-amplify/utils"

interface AuthContextType {
	isAuthenticated: boolean
	username: string | null
	isLoading: boolean
	error: Error | null
}

const AuthContext = createContext<AuthContextType>({
	isAuthenticated: false,
	username: null,
	isLoading: true,
	error: null,
})

export function AuthProvider({ children }: { children: ReactNode }) {
	const [authState, setAuthState] = useState<AuthContextType>({
		isAuthenticated: false,
		username: null,
		isLoading: true,
		error: null,
	})

	async function checkAuth() {
		try {
			const currentUser = await getCurrentUser()
			if (currentUser) {
				const attributes = await fetchUserAttributes()
				const displayName =
					attributes.email || currentUser.username || currentUser.userId
				setAuthState({
					isAuthenticated: true,
					username: displayName,
					isLoading: false,
					error: null,
				})
			} else {
				setAuthState({
					isAuthenticated: false,
					username: null,
					isLoading: false,
					error: null,
				})
			}
		} catch (error) {
			setAuthState({
				isAuthenticated: false,
				username: null,
				isLoading: false,
				error: error as Error,
			})
		}
	}

	useEffect(() => {
		checkAuth()

		const listener = Hub.listen("auth", ({ payload }) => {
			switch (payload.event) {
				case "signedIn":
					checkAuth()
					break
				case "signedOut":
					setAuthState({
						isAuthenticated: false,
						username: null,
						isLoading: false,
						error: null,
					})
					break
				case "tokenRefresh":
					checkAuth()
					break
			}
		})

		return () => listener()
	}, [])

	return (
		<AuthContext.Provider value={authState}>{children}</AuthContext.Provider>
	)
}

export const useAuth = () => useContext(AuthContext)
