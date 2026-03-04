package fynxt.webhooklab.config;

import org.springframework.boot.context.properties.ConfigurationProperties;

import lombok.Getter;
import lombok.Setter;

@Getter
@Setter
@ConfigurationProperties(prefix = "api")
public class ApiProperties {

	private String frontendUrl = "http://localhost:5173";
}
