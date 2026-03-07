import { Box, Input, Stack } from "@/components/ui/atoms";
import type { ChangeEvent, ReactNode } from "react";
import { forwardRef } from "react";
import { z } from "zod";

const searchFieldSchema = z.object({
	placeholder: z.string().optional(),
	value: z.string(),
	className: z.string().optional(),
	"aria-label": z.string().optional(),
	leadingIcon: z.custom<ReactNode>().optional(),
});

export type SearchFieldProps = z.infer<typeof searchFieldSchema> & {
	onChange: (e: ChangeEvent<HTMLInputElement>) => void;
};

export const SearchField = forwardRef<HTMLInputElement, SearchFieldProps>(function SearchField(
	{ placeholder, value, onChange, className, "aria-label": ariaLabel, leadingIcon, ...rest },
	ref,
) {
	return (
		<Stack direction="row" alignItems="center" position="relative" className={className}>
			{leadingIcon != null && (
				<Box
					position="absolute"
					left={3}
					top="50%"
					transform="translateY(-50%)"
					color="var(--wl-text-subtle)"
					pointerEvents="none"
					zIndex={1}
				>
					{leadingIcon}
				</Box>
			)}
			<Input
				ref={ref}
				placeholder={placeholder}
				value={value}
				onChange={onChange}
				pl={leadingIcon != null ? 10 : undefined}
				pr={4}
				py={2}
				fontSize="sm"
				backgroundColor="var(--wl-bg)"
				borderColor="var(--wl-border-subtle)"
				borderRadius="var(--wl-radius-lg)"
				_placeholder={{ color: "var(--wl-text-subtle)" }}
				aria-label={ariaLabel}
				{...rest}
			/>
		</Stack>
	);
});
