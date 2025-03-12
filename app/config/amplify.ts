import { Amplify } from "aws-amplify"
import outputs from "@/amplify_outputs.json"

export function configureAmplify() {
	Amplify.configure(
		{
			Auth: {
				Cognito: {
					userPoolId: outputs.auth.user_pool_id,
					userPoolClientId: outputs.auth.user_pool_client_id,
					identityPoolId: outputs.auth.identity_pool_id,
					signUpVerificationMethod: "code",
				},
			},
			// Remove any AppSync/GraphQL configuration
		},
		{
			ssr: true,
		}
	)
}
