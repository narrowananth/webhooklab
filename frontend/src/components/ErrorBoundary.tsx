import { Box, Button, Text } from "@chakra-ui/react";
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
		// Keep logging for debugging; render fallback UI for users.
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
				p={8}
			>
				<Box
					w="full"
					maxW="xl"
					bg="var(--wl-surface)"
					borderWidth="1px"
					borderColor="var(--wl-border)"
					rounded="lg"
					p={6}
					shadow="lg"
				>
					<Text fontSize="lg" fontWeight={700} mb={2}>
						{this.props.title ?? "Something went wrong"}
					</Text>
					<Text fontSize="sm" color="var(--wl-text-subtle)" mb={5}>
						{this.state.message || "An unexpected error occurred."}
					</Text>
					<Box display="flex" gap={3} justifyContent="flex-end">
						<Button variant="outline" onClick={this.reset}>
							Try again
						</Button>
						<Button
							bg="var(--wl-accent)"
							color="white"
							_hover={{ opacity: 0.9 }}
							onClick={() => window.location.reload()}
						>
							Reload
						</Button>
					</Box>
				</Box>
			</Box>
		);
	}
}
