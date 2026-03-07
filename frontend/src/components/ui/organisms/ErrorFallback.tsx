import { Box, Button, Stack, Text } from "@/components/ui/atoms";
import { forwardRef } from "react";
import { z } from "zod";

const errorFallbackSchema = z.object({
	title: z.string().optional(),
	message: z.string(),
	className: z.string().optional(),
});

export type ErrorFallbackProps = z.infer<typeof errorFallbackSchema> & {
	onRetry?: () => void;
};

export const ErrorFallback = forwardRef<HTMLDivElement, ErrorFallbackProps>(function ErrorFallback(
	{ title, message, onRetry, className },
	ref,
) {
	return (
		<Box
			ref={ref}
			minH="100vh"
			bg="var(--wl-bg)"
			color="var(--wl-text)"
			display="flex"
			alignItems="center"
			justifyContent="center"
			p={6}
			position="relative"
			overflow="hidden"
			className={className}
		>
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
				<Stack
					direction="column"
					align="center"
					textAlign="center"
					bg="var(--wl-surface)"
					borderWidth="1px"
					borderColor="var(--wl-border)"
					borderRadius="2xl"
					p={10}
					shadow="xl"
					boxShadow="0 25px 50px -12px rgba(15,23,42,0.08), 0 0 0 1px rgba(15,23,42,0.03)"
				>
					<Box
						w={14}
						h={14}
						borderRadius="xl"
						bg="var(--wl-error-muted)"
						color="var(--wl-error)"
						display="flex"
						alignItems="center"
						justifyContent="center"
						mb={6}
						aria-hidden
					>
						<Text as="span" fontSize="28px" aria-hidden>
							⚠
						</Text>
					</Box>
					<Text variant="heading" mb={2} color="var(--wl-text)">
						{title ?? "Something went wrong"}
					</Text>
					<Text
						variant="body"
						color="var(--wl-text-muted)"
						mb={6}
						lineHeight="1.6"
						maxW="340px"
					>
						{message || "An unexpected error occurred. Try reloading or try again."}
					</Text>
					<Stack direction="row" gap={3} flexWrap="wrap" justify="center">
						{onRetry != null && (
							<Button variant="secondary" size="md" onClick={onRetry}>
								Try again
							</Button>
						)}
						<Button
							variant="primary"
							size="md"
							onClick={() => window.location.reload()}
						>
							Reload page
						</Button>
					</Stack>
				</Stack>
			</Box>
		</Box>
	);
});
