/**
 * Auto-create webhook on visit and redirect to inspect.
 * Used for root path (/) - visiting or refreshing creates a new webhook URL.
 */
import { Box, Spinner, Text } from "@chakra-ui/react";
import { useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { createWebhook } from "../api";

export function AutoCreateWebhook() {
	const navigate = useNavigate();

	useEffect(() => {
		let cancelled = false;
		createWebhook()
			.then(({ id }) => {
				if (!cancelled) navigate(`/inspect/${id}`, { replace: true });
			})
			.catch((err) => {
				if (!cancelled) {
					console.error("Failed to create webhook:", err);
					navigate("/error", { replace: true, state: { error: String(err) } });
				}
			});
		return () => {
			cancelled = true;
		};
	}, [navigate]);

	return (
		<Box
			minH="100vh"
			bg="var(--wl-bg)"
			display="flex"
			flexDir="column"
			alignItems="center"
			justifyContent="center"
			gap={4}
		>
			<Spinner size="xl" color="var(--wl-accent)" />
			<Text color="var(--wl-text-muted)">Creating your webhook...</Text>
		</Box>
	);
}
