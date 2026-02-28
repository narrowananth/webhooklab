import { Box, Button, Text } from "@chakra-ui/react";
import { useNavigate, useLocation } from "react-router-dom";

export function ErrorPage() {
	const navigate = useNavigate();
	const location = useLocation();
	const error = (location.state as { error?: string })?.error ?? "Something went wrong";

	return (
		<Box
			minH="100vh"
			bg="var(--wl-bg)"
			display="flex"
			flexDir="column"
			alignItems="center"
			justifyContent="center"
			p={8}
			gap={4}
		>
			<Text color="var(--wl-error)">{error}</Text>
			<Text color="var(--wl-text-muted)" fontSize="sm">
				Make sure the backend is running.
			</Text>
			<Button onClick={() => navigate("/", { replace: true })}>Try again</Button>
		</Box>
	);
}
