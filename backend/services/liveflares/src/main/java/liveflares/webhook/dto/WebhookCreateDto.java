package liveflares.webhook.dto;

import io.swagger.v3.oas.annotations.media.Schema;
import jakarta.validation.constraints.Pattern;
import jakarta.validation.constraints.Size;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Getter;
import lombok.NoArgsConstructor;
import lombok.Setter;

@Getter
@Setter
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class WebhookCreateDto {

	@Size(min = 1, max = 255) @Schema(description = "Webhook display name")
	private String name;

	@Pattern(regexp = "^[a-zA-Z0-9_-]{3,100}$", message = "Slug must be 3-100 chars, alphanumeric, underscore, hyphen") @Schema(description = "URL-friendly slug (optional)")
	private String slug;
}
