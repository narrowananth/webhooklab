package fynxt.mapper.json;

import org.mapstruct.Named;
import tools.jackson.core.JacksonException;
import tools.jackson.databind.JsonNode;
import tools.jackson.databind.ObjectMapper;

public class JsonMapper {

	private static final ObjectMapper MAPPER = new ObjectMapper();

	public JsonNode toJsonNode(Object value) {
		if (value == null) {
			return null;
		}
		try {
			if (value instanceof JsonNode node) {
				return node;
			}
			if (value instanceof String json) {
				return MAPPER.readTree(json);
			}
			return MAPPER.valueToTree(value);
		} catch (Exception e) {
			throw new IllegalArgumentException(
					"Failed to convert to JsonNode: " + value.getClass().getSimpleName(), e);
		}
	}

	public JsonNode fromString(String json) {
		if (json == null) {
			return null;
		}
		try {
			return MAPPER.readTree(json);
		} catch (JacksonException e) {
			throw new IllegalArgumentException("Invalid JSON string", e);
		}
	}

	public String toString(JsonNode node) {
		return node != null ? node.toString() : null;
	}

	public String toJsonString(Object value) {
		if (value == null) {
			return null;
		}
		try {
			return MAPPER.writeValueAsString(value);
		} catch (JacksonException e) {
			throw new IllegalArgumentException("Failed to serialize to JSON string", e);
		}
	}

	public <T> T fromString(String json, Class<T> clazz) {
		if (json == null) {
			return null;
		}
		try {
			return MAPPER.readValue(json, clazz);
		} catch (JacksonException e) {
			throw new IllegalArgumentException("Failed to deserialize JSON to " + clazz.getSimpleName(), e);
		}
	}

	@Named("stringToJsonNode")
	public JsonNode stringToJsonNode(String value) {
		if (value == null || value.isBlank()) {
			return null;
		}
		try {
			return MAPPER.readTree(value);
		} catch (JacksonException e) {
			throw new IllegalArgumentException("Invalid JSON string", e);
		}
	}

	@Named("jsonNodeToString")
	public String jsonNodeToString(JsonNode node) {
		return node != null ? node.toString() : null;
	}
}
