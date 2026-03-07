import { Box, Stack, Text } from "@/components/ui/atoms";
import { forwardRef } from "react";
import { z } from "zod";

const emptyStateSchema = z.object({
	title: z.string(),
	description: z.string(),
	className: z.string().optional(),
});

export type EmptyStateProps = z.infer<typeof emptyStateSchema>;

export const EmptyState = forwardRef<HTMLDivElement, EmptyStateProps>(function EmptyState(
	{ title, description, className },
	ref,
) {
	return (
		<Box
			ref={ref}
			flex={1}
			display="flex"
			flexDirection="column"
			alignItems="center"
			justifyContent="center"
			p="var(--wl-space-xl, 32px)"
			textAlign="center"
			className={className}
		>
			<Stack direction="column" gap={2} alignItems="center" maxW="min(400px, 85vw)">
				<Text variant="heading" color="var(--wl-text)" mb={2}>
					{title}
				</Text>
				<Text variant="body" color="var(--wl-text-subtle)" lineHeight="1.5">
					{description}
				</Text>
			</Stack>
		</Box>
	);
});
