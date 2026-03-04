package fynxt.webhooklab;

import org.springframework.boot.SpringApplication;
import org.springframework.boot.autoconfigure.SpringBootApplication;
import org.springframework.boot.autoconfigure.condition.ConditionalOnMissingBean;
import org.springframework.boot.context.properties.ConfigurationPropertiesScan;
import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.ComponentScan;
import org.springframework.context.annotation.Import;
import org.springframework.transaction.annotation.EnableTransactionManagement;

import com.fasterxml.jackson.databind.ObjectMapper;
import com.fasterxml.jackson.datatype.jsr310.JavaTimeModule;

import fynxt.mapper.config.MapperSupportConfig;

@SpringBootApplication
@ConfigurationPropertiesScan(basePackages = { "fynxt.webhooklab", "fynxt.common" })
@ComponentScan(basePackages = { "fynxt.webhooklab", "fynxt.common" })
@EnableTransactionManagement
@Import(MapperSupportConfig.class)
public class WebhooklabApplication {

	@Bean
	@ConditionalOnMissingBean(ObjectMapper.class)
	public ObjectMapper objectMapper() {
		ObjectMapper mapper = new ObjectMapper();
		mapper.registerModule(new JavaTimeModule());
		return mapper;
	}

	public static void main(String[] args) {
		SpringApplication.run(WebhooklabApplication.class, args);
	}
}
