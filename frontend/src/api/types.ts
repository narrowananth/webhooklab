import { z } from "zod";

export const apiErrorBodySchema = z.object({
	code: z.string(),
	detail: z.string().nullable().optional(),
	message: z.string().nullable().optional(),
});

export type ApiErrorBody = z.infer<typeof apiErrorBodySchema>;
