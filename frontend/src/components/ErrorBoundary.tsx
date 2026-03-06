import { Box, Button, Flex, Text } from "@chakra-ui/react";
import type { ReactNode } from "react";
import { Component } from "react";

type ErrorBoundaryProps = {
	children: ReactNode;
	title?: string;
};

type ErrorBoundaryState = {
	hasError: boolean;
	message: string;
};

export class ErrorBoundary extends Component<ErrorBoundaryProps, ErrorBoundaryState> {
	state: ErrorBoundaryState = { hasError: false, message: "" };

	static getDerivedStateFromError(err: unknown): ErrorBoundaryState {
		const message = err instanceof Error ? err.message : "Unknown error";
		return { hasError: true, message };
	}

	override componentDidCatch(err: unknown) {
		console.error("[ErrorBoundary] Caught error:", err);
	}

	private reset = () => {
		this.setState({ hasError: false, message: "" });
	};

	override render() {
		if (!this.state.hasError) return this.props.children;

		return (
			<Box
				minH="100vh"
				bg="var(--wl-bg)"
				color="var(--wl-text)"
				display="flex"
				alignItems="center"
				justifyContent="center"
				p={6}
				position="relative"
				overflow="hidden"
			>
				{/* Subtle gradient background */}
				<Box
					position="absolute"
					inset={0}
					opacity={0.4}
					bgGradient="radial(circle at 30% 20%, var(--wl-accent) 0%, transparent 50%)"
					pointerEvents="none"
				/>
				<Box
					position="absolute"
					inset={0}
					opacity={0.15}
					bgGradient="radial(circle at 70% 80%, var(--wl-accent) 0%, transparent 45%)"
					pointerEvents="none"
				/>

				<Box position="relative" w="full" maxW="md">
					<Flex
						flexDir="column"
						align="center"
						textAlign="center"
						bg="var(--wl-surface)"
						borderWidth="1px"
						borderColor="var(--wl-border-subtle)"
						rounded="2xl"
						p={10}
						shadow="xl"
						boxShadow="0 25px 50px -12px rgba(0,0,0,0.15)"
					>
						{/* Icon */}
						<Flex
							w={16}
							h={16}
							rounded="full"
							bg="var(--wl-error-bg, rgba(239,68,68,0.12))"
							color="var(--wl-error, #dc2626)"
							align="center"
							justify="center"
							mb={5}
						>
							<span
								className="material-symbols-outlined"
								style={{ fontSize: 40, fontWeight: 200 }}
								aria-hidden
							>
								error_outline
							</span>
						</Flex>
						<Text fontSize="xl" fontWeight={700} mb={2} color="var(--wl-text)">
							{this.props.title ?? "Something went wrong"}
						</Text>
						<Text
							fontSize="sm"
							color="var(--wl-text-subtle)"
							mb={8}
							lineHeight="tall"
							maxW="360px"
						>
							{this.state.message || "An unexpected error occurred. Try reloading or try again."}
						</Text>
						<Flex gap={3} flexWrap="wrap" justify="center">
							<Button
								size="md"
								variant="outline"
								borderColor="var(--wl-border)"
								color="var(--wl-text)"
								_hover={{ bg: "var(--wl-bg-muted)", borderColor: "var(--wl-border)" }}
								onClick={this.reset}
							>
								Try again
							</Button>
							<Button
								size="md"
								bg="var(--wl-accent)"
								color="white"
								_hover={{ opacity: 0.9 }}
								onClick={() => window.location.reload()}
							>
								Reload page
							</Button>
						</Flex>
					</Flex>
				</Box>
			</Box>
		);
	}
}
