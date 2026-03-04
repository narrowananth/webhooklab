package fynxt.database.config;

import jakarta.persistence.EntityManager;
import org.springframework.boot.autoconfigure.AutoConfiguration;
import org.springframework.boot.autoconfigure.condition.ConditionalOnClass;
import org.springframework.context.annotation.ComponentScan;

@AutoConfiguration
@ConditionalOnClass(EntityManager.class)
@ComponentScan(basePackages = "fynxt.database")
public class DatabaseAutoConfiguration {}
