import { Badge } from "@/components/ui/atoms";
import { getMethodBadgeStyle } from "@/constants/method-badges";
import { forwardRef } from "react";
import { z } from "zod";

export const httpMethodSchema = z.string().transform((s) => s.toUpperCase());
export type HttpMethod = z.infer<typeof httpMethodSchema>;

const methodBadgeSchema = z.object({
	method: z.string(),
	className: z.string().optional(),
});

export type MethodBadgeProps = z.infer<typeof methodBadgeSchema>;

export const MethodBadge = forwardRef<HTMLSpanElement, MethodBadgeProps>(function MethodBadge(
	{ method, className },
	ref,
) {
	const style = getMethodBadgeStyle(method);
	const label = method.toUpperCase() === "DELETE" ? "DEL" : method.toUpperCase();
	return (
		<Badge
			ref={ref}
			className={className}
			variant="solid"
			bg={style.bg}
			color={style.fg}
			borderColor="var(--wl-border-subtle)"
			fontSize="11px"
			fontWeight="semibold"
			textTransform="uppercase"
			letterSpacing="wider"
		>
			{label}
		</Badge>
	);
});
