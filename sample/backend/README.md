# Backend

Multi-module backend built with Gradle and Java.

## Prerequisites

- **JDK 17+** (or version in `.sdkmanrc` if using SDKMAN)
- **Gradle** — use the wrapper: `./gradlew`

## Build

```bash
./gradlew build
./gradlew clean
./gradlew clean build
```

## Test

```bash
./gradlew test
./gradlew :<project-path>:test
```

## Run

```bash
./gradlew :<project-path>:bootRun
```

Use the service module as `<project-path>` (e.g. `:services:brand`).

## Migration

Migrations use Flyway. Set `DATABASE_URL`, `DATABASE_USER`, and `DATABASE_PASSWORD` (e.g. via `.env` or environment) before running.

```bash
./gradlew :<project-path>:applyMigration
./gradlew :<project-path>:generateMigration
./gradlew :<project-path>:repairMigration
```

Use the module that contains migrations as `<project-path>` (e.g. `:services:brand`).

If you see **"type does not exist"**, the DB was likely baselined without running earlier migrations. Use a clean schema or a fresh database and run `applyMigration` again.

## Code quality

```bash
./gradlew spotlessCheck
./gradlew spotlessApply
```

## Project structure

| Path        | Description              |
|------------|--------------------------|
| `libs/`    | Shared libraries         |
| `services/`| Runnable applications   |
| `buildSrc/`| Shared build logic       |
