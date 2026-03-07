import type { TextProps } from "@chakra-ui/react";
import { Text as ChakraText } from "@chakra-ui/react";
import { forwardRef } from "react";
import { z } from "zod";

export const textVariantSchema = z.enum(["heading", "body", "caption", "mono"]);
export type TextVariant = z.infer<typeof textVariantSchema>;

const textAtomExtrasSchema = z.object({
	variant: textVariantSchema.optional(),
	className: z.string().optional(),
});

export type TextAtomProps = Omit<TextProps, "sx"> & z.infer<typeof textAtomExtrasSchema>;

const variantStyles: Record<
	TextVariant,
	{ fontSize: string; fontWeight?: number; fontFamily?: string }
> = {
	heading: { fontSize: "var(--wl-font-18, 18px)", fontWeight: 600 },
	body: { fontSize: "var(--wl-font-14, 14px)", fontWeight: 400 },
	caption: { fontSize: "var(--wl-font-12, 12px)", fontWeight: 400 },
	mono: {
		fontSize: "var(--wl-font-13, 13px)",
		fontFamily: "var(--wl-font-mono)",
	},
};

export const Text = forwardRef<HTMLParagraphElement, TextAtomProps>(function Text(
	{ variant = "body", className, ...rest },
	ref,
) {
	const style = variantStyles[variant];
	return (
		<ChakraText
			ref={ref}
			className={className}
			fontSize={style.fontSize}
			fontWeight={style.fontWeight}
			fontFamily={style.fontFamily}
			color="var(--wl-text)"
			{...rest}
		/>
	);
});
