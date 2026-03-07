import type { IconButtonProps } from "@chakra-ui/react";
import { IconButton as ChakraIconButton } from "@chakra-ui/react";
import { forwardRef } from "react";
import { z } from "zod";

export const iconButtonVariantSchema = z.enum(["primary", "secondary", "ghost", "danger"]);
export const iconButtonSizeSchema = z.enum(["sm", "md", "lg"]);
export type IconButtonVariant = z.infer<typeof iconButtonVariantSchema>;
export type IconButtonSize = z.infer<typeof iconButtonSizeSchema>;

const iconButtonAtomExtrasSchema = z.object({
	variant: iconButtonVariantSchema.optional(),
	size: iconButtonSizeSchema.optional(),
	className: z.string().optional(),
});

export type IconButtonAtomProps = Omit<IconButtonProps, "variant" | "size"> &
	z.infer<typeof iconButtonAtomExtrasSchema>;

const variantMap: Record<IconButtonVariant, IconButtonProps["variant"]> = {
	primary: "solid",
	secondary: "outline",
	ghost: "ghost",
	danger: "solid",
};

export const IconButton = forwardRef<HTMLButtonElement, IconButtonAtomProps>(function IconButton(
	{ variant = "primary", size = "md", className, colorScheme, "aria-label": ariaLabel, ...rest },
	ref,
) {
	const chakraVariant = variantMap[variant];
	const scheme =
		colorScheme ?? (variant === "primary" ? "blue" : variant === "danger" ? "red" : "gray");
	return (
		<ChakraIconButton
			ref={ref}
			className={className}
			variant={chakraVariant}
			size={size}
			colorScheme={scheme}
			aria-label={ariaLabel}
			{...rest}
		/>
	);
});
