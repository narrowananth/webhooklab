import type { BoxProps } from "@chakra-ui/react";
import { Box as ChakraBox } from "@chakra-ui/react";
import { forwardRef } from "react";
import { z } from "zod";

const boxAtomExtrasSchema = z.object({
	className: z.string().optional(),
});

export type BoxAtomProps = BoxProps & z.infer<typeof boxAtomExtrasSchema>;

export const Box = forwardRef<HTMLDivElement, BoxAtomProps>(function Box(
	{ className, ...rest },
	ref,
) {
	return <ChakraBox ref={ref} className={className} {...rest} />;
});
