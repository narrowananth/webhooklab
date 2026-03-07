package liveflares.database.config;

import jakarta.persistence.EntityManager;
import org.springframework.boot.autoconfigure.AutoConfiguration;
import org.springframework.boot.autoconfigure.condition.ConditionalOnClass;
import org.springframework.context.annotation.ComponentScan;
import org.springframework.data.jpa.repository.config.EnableJpaAuditing;

@AutoConfiguration
@ConditionalOnClass(EntityManager.class)
@ComponentScan(basePackages = "liveflares.database")
@EnableJpaAuditing
public class DatabaseAutoConfiguration {}
