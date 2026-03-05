package webhooklab.mapper.config;

import webhooklab.mapper.json.JsonMapper;
import webhooklab.mapper.util.CommonMappingUtil;

import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;

@Configuration
public class MapperSupportConfig {

	@Bean
	public JsonMapper jsonMapper() {
		return new JsonMapper();
	}

	@Bean
	public CommonMappingUtil commonMappingUtil() {
		return new CommonMappingUtil();
	}
}
