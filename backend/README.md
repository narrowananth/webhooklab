# Backend

Tech stack and developer workflow for the LiveFlares backend.

## Tech Stack

- **Java** (JDK 25), **Gradle**, **Spring Boot**
- **PostgreSQL**, **Flyway**, Spring Data JPA
- **Spring WebSocket**, Spring Security
- **SpringDoc OpenAPI**
- **Spotless** (formatting), **ktlint** (Kotlin DSL)

## Prerequisites

- **JDK 17+** (or version in `.sdkmanrc` if using SDKMAN)
- **Gradle** — use the wrapper: `./gradlew`

## Build

```bash
./gradlew build
./gradlew clean build
```

## Run

```bash
./gradlew :<project-path>:bootRun
```

Use the service module as `<project-path>` (e.g. `:services:liveflares`).

## Migration

Migrations use Flyway. Set `DATABASE_URL`, `DATABASE_USER`, and `DATABASE_PASSWORD` (e.g. via `.env` or environment) before running.

```bash
./gradlew :<project-path>:applyMigration
./gradlew :<project-path>:generateMigration
./gradlew :<project-path>:repairMigration
```

Use the module that contains migrations as `<project-path>` (e.g. `:services:liveflares`).

If you see **"type does not exist"**, the DB was likely baselined without running earlier migrations. Use a clean schema or a fresh database and run `applyMigration` again.

## Code Quality

```bash
./gradlew spotlessCheck
./gradlew spotlessApply
```

## Project Structure

| Path         | Description           |
| ------------ | --------------------- |
| `libs/`      | Shared libraries      |
| `services/`  | Runnable applications |
| `buildSrc/`  | Shared build logic    |
