import { createWebhook } from "@/api";
import { Box, Spinner, Stack, Text } from "@/components/ui/atoms";
import { useCreateWebhookMutation, webhookKeys } from "@/hooks/useWebhookQueries";
import { useQueryClient } from "@tanstack/react-query";
import { useEffect, useRef, useState } from "react";
import { useNavigate } from "react-router-dom";

const FALLBACK_CREATE_MS = 5_000;

export function AutoCreateWebhook() {
	const navigate = useNavigate();
	const queryClient = useQueryClient();
	const createMutation = useCreateWebhookMutation();
	const didRun = useRef(false);
	const [fallbackUsed, setFallbackUsed] = useState(false);

	// Trigger create once on mount
	useEffect(() => {
		if (didRun.current) return;
		didRun.current = true;
		createMutation.mutate(undefined);
	}, [createMutation.mutate]);

	// Navigate when mutation succeeds (reliable vs callback, works across React Query versions)
	useEffect(() => {
		if (!createMutation.isSuccess || !createMutation.data?.id) return;
		const id = String(createMutation.data.id);
		navigate(`/inspect/${id}`, { replace: true });
	}, [createMutation.isSuccess, createMutation.data, navigate]);

	// Navigate to error page on mutation error
	useEffect(() => {
		if (!createMutation.isError) return;
		console.error("Failed to create webhook:", createMutation.error);
		navigate("/error", {
			replace: true,
			state: { error: String(createMutation.error?.message ?? createMutation.error) },
		});
	}, [createMutation.isError, createMutation.error, navigate]);

	// Fallback: if mutation is still pending after a while, create via direct fetch (e.g. proxy/callback issues)
	useEffect(() => {
		if (createMutation.isSuccess || createMutation.isError || fallbackUsed) return;
		const t = setTimeout(() => {
			if (createMutation.isSuccess || createMutation.isError) return;
			setFallbackUsed(true);
			createWebhook()
				.then((w) => {
					if (w?.id) {
						const id = String(w.id);
						queryClient.setQueryData(webhookKeys.detail(id), w);
						navigate(`/inspect/${id}`, { replace: true });
					}
				})
				.catch((err) => {
					console.error("Fallback create failed:", err);
					navigate("/error", {
						replace: true,
						state: { error: String(err?.message ?? err) },
					});
				});
		}, FALLBACK_CREATE_MS);
		return () => clearTimeout(t);
	}, [createMutation.isSuccess, createMutation.isError, fallbackUsed, navigate, queryClient]);

	return (
		<Box
			minH="100vh"
			bg="var(--wl-bg)"
			display="flex"
			flexDirection="column"
			alignItems="center"
			justifyContent="center"
			gap={0}
			px={4}
		>
			<Stack direction="column" alignItems="center" gap={5} maxW="320px" textAlign="center">
				<Box position="relative">
					<Spinner size="xl" color="var(--wl-accent)" />
					<Box
						position="absolute"
						inset={0}
						display="flex"
						alignItems="center"
						justifyContent="center"
					>
						<Box
							as="span"
							className="material-symbols-outlined"
							style={{
								fontSize: 28,
								color: "var(--wl-accent)",
								opacity: 0.9,
							}}
						>
							link
						</Box>
					</Box>
				</Box>
				<Stack direction="column" gap={1.5}>
					<Box display="flex" alignItems="center" justifyContent="center" gap={1}>
						<Text
							fontSize="var(--wl-fluid-font-md)"
							fontWeight={600}
							color="var(--wl-text)"
						>
							{createMutation.isError
								? "Something went wrong"
								: "Creating your webhook"}
						</Text>
						{!createMutation.isError && (
							<Box display="flex" gap={0.5} alignItems="center" aria-hidden>
								{[0, 1, 2].map((i) => (
									<Box
										key={i}
										w="4px"
										h="4px"
										rounded="full"
										bg="var(--wl-accent)"
										className="create-loader-dot"
										style={{
											animationDelay: `${i * 0.15}s`,
										}}
									/>
								))}
							</Box>
						)}
					</Box>
					<Text fontSize="var(--wl-fluid-font-sm)" color="var(--wl-text-muted)">
						{createMutation.isError
							? "Redirecting you to the error page..."
							: fallbackUsed
								? "Taking a bit longer than usual…"
								: "Setting up your inbox. You'll be redirected in a moment."}
					</Text>
				</Stack>
			</Stack>
			{!createMutation.isError && (
				<Box
					position="fixed"
					bottom={0}
					left={0}
					right={0}
					h="3px"
					bg="var(--wl-border-subtle)"
					overflow="hidden"
				>
					<Box
						h="full"
						w="40%"
						bg="var(--wl-accent)"
						rounded="full"
						className="create-loader-bar"
					/>
				</Box>
			)}
		</Box>
	);
}
