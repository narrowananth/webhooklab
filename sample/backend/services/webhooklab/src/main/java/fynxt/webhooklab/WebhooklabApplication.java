package fynxt.webhooklab;

import org.springframework.boot.SpringApplication;
import org.springframework.boot.autoconfigure.SpringBootApplication;
import org.springframework.boot.autoconfigure.domain.EntityScan;
import org.springframework.boot.context.properties.ConfigurationPropertiesScan;
import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.ComponentScan;
import org.springframework.data.jpa.repository.config.EnableJpaRepositories;
import org.springframework.transaction.annotation.EnableTransactionManagement;

import com.fasterxml.jackson.databind.ObjectMapper;
import com.fasterxml.jackson.datatype.jsr310.JavaTimeModule;

@SpringBootApplication
@ConfigurationPropertiesScan(basePackages = { "fynxt.webhooklab", "fynxt.common" })
@EnableTransactionManagement
public class WebhooklabApplication {

	public static void main(String[] args) {
		SpringApplication.run(WebhooklabApplication.class, args);
	}
}
