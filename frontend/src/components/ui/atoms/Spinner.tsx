import type { SpinnerProps } from "@chakra-ui/react";
import { Spinner as ChakraSpinner } from "@chakra-ui/react";
import { forwardRef } from "react";
import { z } from "zod";

const spinnerAtomExtrasSchema = z.object({
	className: z.string().optional(),
});

export type SpinnerAtomProps = SpinnerProps & z.infer<typeof spinnerAtomExtrasSchema>;

export const Spinner = forwardRef<HTMLDivElement, SpinnerAtomProps>(function Spinner(
	{ className, color, size = "md", ...rest },
	ref,
) {
	return (
		<ChakraSpinner
			ref={ref}
			className={className}
			color={color ?? "var(--wl-accent)"}
			size={size}
			{...rest}
		/>
	);
});
