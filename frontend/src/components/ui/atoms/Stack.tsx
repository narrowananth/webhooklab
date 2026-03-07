import type { FlexProps } from "@chakra-ui/react";
import { Flex } from "@chakra-ui/react";
import { forwardRef } from "react";
import { z } from "zod";

const stackExtrasSchema = z.object({
	direction: z.enum(["row", "column"]).optional(),
	className: z.string().optional(),
});

export type StackProps = FlexProps & z.infer<typeof stackExtrasSchema>;

export const Stack = forwardRef<HTMLDivElement, StackProps>(function Stack(
	{ direction = "column", className, ...rest },
	ref,
) {
	return <Flex ref={ref} className={className} flexDirection={direction} {...rest} />;
});
