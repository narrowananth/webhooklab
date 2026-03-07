import type { InputProps } from "@chakra-ui/react";
import { Input as ChakraInput } from "@chakra-ui/react";
import { forwardRef } from "react";
import { z } from "zod";

const inputAtomExtrasSchema = z.object({
	className: z.string().optional(),
});

export type InputAtomProps = InputProps & z.infer<typeof inputAtomExtrasSchema>;

export const Input = forwardRef<HTMLInputElement, InputAtomProps>(function Input(
	{ className, ...rest },
	ref,
) {
	return (
		<ChakraInput
			ref={ref}
			className={className}
			borderColor="var(--wl-border)"
			backgroundColor="var(--wl-surface)"
			_focusVisible={{
				borderColor: "var(--wl-accent)",
				boxShadow: "0 0 0 1px var(--wl-accent)",
			}}
			{...rest}
		/>
	);
});
