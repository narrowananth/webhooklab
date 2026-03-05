package webhooklab.mapper.config;

import webhooklab.mapper.json.JsonMapper;
import webhooklab.mapper.util.CommonMappingUtil;

import org.mapstruct.Builder;
import org.mapstruct.MapperConfig;
import org.mapstruct.NullValuePropertyMappingStrategy;
import org.mapstruct.ReportingPolicy;

@MapperConfig(
		componentModel = "spring",
		uses = {JsonMapper.class, CommonMappingUtil.class},
		builder = @Builder(disableBuilder = false),
		unmappedTargetPolicy = ReportingPolicy.IGNORE,
		nullValuePropertyMappingStrategy = NullValuePropertyMappingStrategy.IGNORE)
public interface MapperCoreConfig {}
