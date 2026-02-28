import { Box, Button, Field, Heading, Input, Text } from "@chakra-ui/react";
import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { createWebhook } from "../api";
import { useInspectStore } from "../store/useInspectStore";

export function Home() {
	const { theme, toggleTheme } = useInspectStore();
	const [name, setName] = useState("");
	const [loading, setLoading] = useState(false);
	const [error, setError] = useState<string | null>(null);
	const navigate = useNavigate();

	async function handleCreate(e: React.FormEvent) {
		e.preventDefault();
		setLoading(true);
		setError(null);
		try {
			const { id } = await createWebhook(name ? { name } : undefined);
			navigate(`/inspect/${id}`);
		} catch (err) {
			setError(err instanceof Error ? err.message : "Failed to create");
		} finally {
			setLoading(false);
		}
	}

	return (
		<Box
			minH="100vh"
			bg="var(--wl-bg)"
			display="flex"
			alignItems="center"
			justifyContent="center"
			p={8}
			position="relative"
		>
			<Button
				position="absolute"
				top={4}
				right={4}
				size="sm"
				variant="ghost"
				onClick={toggleTheme}
				aria-label={theme === "dark" ? "Switch to light mode" : "Switch to dark mode"}
			>
				{theme === "dark" ? "☀️" : "🌙"}
			</Button>
			<Box maxW="md" w="full">
				<Heading size="2xl" mb={2} color="var(--wl-accent)">
					WebhookLab
				</Heading>
				<Text color="var(--wl-text-muted)" mb={8} fontSize="lg">
					Instant webhook testing & inspection
				</Text>

				<Box
					as="form"
					onSubmit={handleCreate}
					bg="var(--wl-bg-subtle)"
					p={8}
					rounded="xl"
					borderWidth="1px"
					borderColor="var(--wl-border)"
				>
					<Field.Root mb={6}>
						<Field.Label>Inbox name (optional)</Field.Label>
						<Input
							placeholder="My webhook inbox"
							value={name}
							onChange={(e) => setName(e.target.value)}
							mt={2}
							bg="var(--wl-bg)"
							borderColor="var(--wl-border)"
						/>
					</Field.Root>

					{error && (
						<Text color="red.400" mb={4} fontSize="sm">
							{error}
						</Text>
					)}

					<Button
						type="submit"
						colorPalette="cyan"
						size="lg"
						w="full"
						loading={loading}
					>
						Create webhook inbox
					</Button>
				</Box>

				<Text color="var(--wl-text-subtle)" mt={6} fontSize="sm" textAlign="center">
					Generate a unique URL • Capture requests in real-time • Inspect & replay
				</Text>
			</Box>
		</Box>
	);
}
