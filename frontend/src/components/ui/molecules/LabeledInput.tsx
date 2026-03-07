import { Input, Stack } from "@/components/ui/atoms";
import type { ChangeEvent } from "react";
import { forwardRef } from "react";
import { useId } from "react";
import { z } from "zod";

const labeledInputSchema = z.object({
	label: z.string(),
	value: z.string(),
	placeholder: z.string().optional(),
	id: z.string().optional(),
	className: z.string().optional(),
});

export type LabeledInputProps = z.infer<typeof labeledInputSchema> & {
	onChange: (e: ChangeEvent<HTMLInputElement>) => void;
};

export const LabeledInput = forwardRef<HTMLInputElement, LabeledInputProps>(function LabeledInput(
	{ label, value, onChange, placeholder, id: idProp, className, ...rest },
	ref,
) {
	const generatedId = useId();
	const id = idProp ?? generatedId;
	return (
		<Stack direction="column" gap={1} className={className}>
			<label
				htmlFor={id}
				style={{
					display: "block",
					marginBottom: 4,
					fontSize: "var(--wl-font-12, 12px)",
					color: "var(--wl-text-subtle)",
				}}
			>
				{label}
			</label>
			<Input
				ref={ref}
				id={id}
				value={value}
				onChange={onChange}
				placeholder={placeholder}
				{...rest}
			/>
		</Stack>
	);
});
