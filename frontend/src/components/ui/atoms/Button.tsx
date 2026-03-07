import type { ButtonProps } from "@chakra-ui/react";
import { Button as ChakraButton } from "@chakra-ui/react";
import { forwardRef } from "react";
import { z } from "zod";

export const buttonVariantSchema = z.enum(["primary", "secondary", "ghost", "danger"]);
export const buttonSizeSchema = z.enum(["sm", "md", "lg"]);
export type ButtonVariant = z.infer<typeof buttonVariantSchema>;
export type ButtonSize = z.infer<typeof buttonSizeSchema>;

const buttonAtomExtrasSchema = z.object({
	variant: buttonVariantSchema.optional(),
	size: buttonSizeSchema.optional(),
	className: z.string().optional(),
});

export type ButtonAtomProps = Omit<ButtonProps, "variant" | "size"> &
	z.infer<typeof buttonAtomExtrasSchema>;

const variantMap: Record<ButtonVariant, ButtonProps["variant"]> = {
	primary: "solid",
	secondary: "outline",
	ghost: "ghost",
	danger: "solid",
};

export const Button = forwardRef<HTMLButtonElement, ButtonAtomProps>(function Button(
	{ variant = "primary", size = "md", className, colorScheme, ...rest },
	ref,
) {
	const chakraVariant = variantMap[variant];
	const scheme =
		colorScheme ?? (variant === "primary" ? "blue" : variant === "danger" ? "red" : "gray");
	return (
		<ChakraButton
			ref={ref}
			className={className}
			variant={chakraVariant}
			size={size}
			colorScheme={scheme}
			{...rest}
		/>
	);
});
