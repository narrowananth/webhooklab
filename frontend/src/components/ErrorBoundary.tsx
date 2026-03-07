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
				{/* Soft ambient background */}
				<Box
					position="absolute"
					inset={0}
					opacity={0.5}
					bgGradient="radial(circle at 50% 30%, var(--wl-accent-soft) 0%, transparent 55%)"
					pointerEvents="none"
				/>
				<Box
					position="absolute"
					inset={0}
					opacity={0.2}
					bgGradient="radial(circle at 80% 70%, var(--wl-error-muted) 0%, transparent 40%)"
					pointerEvents="none"
				/>

				<Box position="relative" w="full" maxW="420px">
					<Flex
						flexDir="column"
						align="center"
						textAlign="center"
						bg="var(--wl-surface)"
						borderWidth="1px"
						borderColor="var(--wl-border)"
						rounded="2xl"
						p={10}
						shadow="xl"
						boxShadow="0 25px 50px -12px rgba(15,23,42,0.08), 0 0 0 1px rgba(15,23,42,0.03)"
					>
						{/* Icon - softer treatment */}
						<Flex
							w={14}
							h={14}
							rounded="xl"
							bg="var(--wl-error-muted)"
							color="var(--wl-error)"
							align="center"
							justify="center"
							mb={6}
						>
							<span
								className="material-symbols-outlined"
								style={{ fontSize: 28 }}
								aria-hidden
							>
								warning
							</span>
						</Flex>
						<Text fontSize="lg" fontWeight={600} mb={2} color="var(--wl-text)">
							{this.props.title ?? "Something went wrong"}
						</Text>
						<Text
							fontSize="sm"
							color="var(--wl-text-muted)"
							mb={6}
							lineHeight="1.6"
							maxW="340px"
						>
							{this.state.message || "An unexpected error occurred. Try reloading or try again."}
						</Text>
						<Flex gap={3} flexWrap="wrap" justify="center">
							<Button
								size="md"
								variant="outline"
								borderColor="var(--wl-border)"
								color="var(--wl-text-secondary)"
								_hover={{ bg: "var(--wl-bg-muted)", borderColor: "var(--wl-border)", color: "var(--wl-text)" }}
								onClick={this.reset}
							>
								Try again
							</Button>
							<Button
								size="md"
								bg="var(--wl-accent)"
								color="white"
								_hover={{ opacity: 0.92, bg: "var(--wl-accent-hover)" }}
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
