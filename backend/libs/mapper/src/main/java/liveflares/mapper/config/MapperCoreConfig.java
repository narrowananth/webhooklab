package liveflares.mapper.config;

import liveflares.mapper.json.JsonMapper;
import liveflares.mapper.util.CommonMappingUtil;

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
