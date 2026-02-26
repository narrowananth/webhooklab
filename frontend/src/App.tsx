import { Box, Heading, Text } from "@chakra-ui/react";

function App() {
	return (
		<Box p={8} minH="100vh" bg="gray.50" _dark={{ bg: "gray.900" }}>
			<Heading size="2xl" mb={4}>
				WebhookLab
			</Heading>
			<Text color="gray.600" _dark={{ color: "gray.400" }}>
				Webhook testing & inspection — Tailwind + Chakra UI ready.
			</Text>
		</Box>
	);
}

export default App;
