/**
 * Custom URL: /w/:slug - creates webhook with slug or shows existing.
 * e.g. /w/stripe-payments -> webhook URL: yourdomain.com/webhook/stripe-payments
 */
import { Box, Spinner, Text } from "@chakra-ui/react";
import { useEffect } from "react";
import { useNavigate, useParams } from "react-router-dom";
import { createWebhook, getWebhookBySlug } from "../api";

export function CustomUrl() {
	const { slug } = useParams<{ slug: string }>();
	const navigate = useNavigate();

	useEffect(() => {
		if (!slug || slug.length < 3) {
			navigate("/", { replace: true });
			return;
		}
		const cleanSlug = slug.toLowerCase().replace(/[^a-z0-9_-]/g, "-");
		let cancelled = false;

		getWebhookBySlug(cleanSlug)
			.then((w) => {
				if (!cancelled) navigate(`/inspect/${w.id}`, { replace: true });
			})
			.catch(() => {
				// 404 - create new with this slug
				createWebhook({ slug: cleanSlug })
					.then(({ id }) => {
						if (!cancelled) navigate(`/inspect/${id}`, { replace: true });
					})
					.catch((err) => {
						if (!cancelled) {
							console.error(err);
							navigate("/error", { replace: true, state: { error: String(err) } });
						}
					});
			});

		return () => {
			cancelled = true;
		};
	}, [slug, navigate]);

	return (
		<Box
			minH="100vh"
			bg="var(--wl-bg)"
			display="flex"
			flexDir="column"
			alignItems="center"
			justifyContent="center"
			gap={4}
		>
			<Spinner size="xl" color="var(--wl-accent)" />
			<Text color="var(--wl-text-muted)">
				{slug ? `Setting up /webhook/${slug}...` : "Loading..."}
			</Text>
		</Box>
	);
}
