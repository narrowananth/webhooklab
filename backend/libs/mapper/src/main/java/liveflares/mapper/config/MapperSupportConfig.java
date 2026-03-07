package liveflares.mapper.config;

import liveflares.mapper.json.JsonMapper;
import liveflares.mapper.util.CommonMappingUtil;

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
