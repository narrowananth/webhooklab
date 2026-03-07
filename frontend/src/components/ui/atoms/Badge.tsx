import type { BadgeProps } from "@chakra-ui/react";
import { Badge as ChakraBadge } from "@chakra-ui/react";
import { forwardRef } from "react";
import { z } from "zod";

export const badgeVariantSchema = z.enum(["solid", "subtle", "outline"]);
export type BadgeVariant = z.infer<typeof badgeVariantSchema>;

const badgeAtomExtrasSchema = z.object({
	variant: badgeVariantSchema.optional(),
	className: z.string().optional(),
});

export type BadgeAtomProps = Omit<BadgeProps, "variant"> & z.infer<typeof badgeAtomExtrasSchema>;

export const Badge = forwardRef<HTMLSpanElement, BadgeAtomProps>(function Badge(
	{ variant = "subtle", className, ...rest },
	ref,
) {
	return <ChakraBadge ref={ref} className={className} variant={variant} {...rest} />;
});
