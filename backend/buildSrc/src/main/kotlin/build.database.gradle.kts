import internal.RandomNames
import org.flywaydb.core.Flyway
import java.time.LocalDateTime
import java.time.format.DateTimeFormatter

val migrationDirPath = "src/main/resources/db/migration"

tasks.register("generateMigration") {
    group = "migration"
    description = "Creates a new migration SQL file with random readable name"

    val migrationDir = project.layout.projectDirectory.dir(migrationDirPath)
    val projectDir = project.rootProject.projectDir

    doLast {
        val now = LocalDateTime.now().format(DateTimeFormatter.ofPattern("yyyyMMddHHmmss"))
        val version = "V$now"
        val name = RandomNames.readable("_")
        val filename = "${version}__$name.sql"

        val file = migrationDir.file(filename).asFile
        migrationDir.asFile.mkdirs() // Create directory if missing
        file.writeText("-- Migration $version ($name)\n\n")

        println("================================")
        println("✅ Migration File Generated")
        println("================================")
        println()
        println("Version: $version")
        println("Name: $name")
        println()
        println("File Location:")
        println("  • ${file.relativeTo(projectDir)}")
        println()
        println("================================")
    }
}

tasks.register("applyMigration") {
    group = "migration"
    description = "Applies all pending migrations to the database"

    val migrationDir = project.layout.projectDirectory.dir(migrationDirPath)

    doLast {
        val url = System.getenv("DATABASE_URL") ?: throw GradleException("DATABASE_URL is not set")
        val user = System.getenv("DATABASE_USER") ?: throw GradleException("DATABASE_USER is not set")
        val password = System.getenv("DATABASE_PASSWORD") ?: throw GradleException("DATABASE_PASSWORD is not set")

        val locations = "filesystem:${migrationDir.asFile.absolutePath}"

        // baselineVersion("0") ensures V001 and all migrations run when baselining an existing schema.
        // Without it, default baselineVersion is 1, so Flyway skips V001 and only runs V002+.
        val flyway =
            Flyway
                .configure()
                .dataSource(url, user, password)
                .locations(locations)
                .baselineOnMigrate(true)
                .baselineVersion("0")
                .load()
                .migrate()

        println("================================")
        println("✅ Migration Apply Complete")
        println("================================")
        println()
        println("Database: ${flyway.database}")
        println("Flyway Version: ${flyway.flywayVersion}")
        println()
        println("Result:")
        println("  • Success: ${flyway.success}")
        println("  • Migrations Executed: ${flyway.migrationsExecuted}")
        println()
        println("Schema Version:")
        println("  • Initial: ${flyway.initialSchemaVersion}")
        println("  • Target: ${flyway.targetSchemaVersion}")
        println()
        if (flyway.warnings.isNotEmpty()) {
            println("⚠️  Warnings:")
            flyway.warnings.forEach { warning ->
                println("  • $warning")
            }
            println()
        }
        println("================================")
    }
}

tasks.register("repairMigration") {
    group = "migration"
    description = "Repairs migrations on the database"

    val migrationDir = project.layout.projectDirectory.dir(migrationDirPath)

    doLast {
        val url = System.getenv("DATABASE_URL") ?: throw GradleException("DATABASE_URL is not set")
        val user = System.getenv("DATABASE_USER") ?: throw GradleException("DATABASE_USER is not set")
        val password = System.getenv("DATABASE_PASSWORD") ?: throw GradleException("DATABASE_PASSWORD is not set")

        val locations = "filesystem:${migrationDir.asFile.absolutePath}"

        // Default configuration: https://github.com/flyway/flyway/blob/9df387cfa998ad5e1024151374f226a6185fa78f/flyway-core/src/main/java/org/flywaydb/core/internal/configuration/models/FlywayModel.java#L45
        val flyway =
            Flyway
                .configure()
                .dataSource(url, user, password)
                .locations(locations)
                .load()
                .repair()

        println("================================")
        println("✅ Migration Repair Complete")
        println("================================")
        println()

        println("Database: ${flyway.database}")
        println("Flyway Version: ${flyway.flywayVersion}")
        println()

        if (flyway.repairActions.isNotEmpty()) {
            println("Repair Actions:")
            flyway.repairActions.forEach { action ->
                println("  • $action")
            }
            println()
        }

        println("Migrations Removed: ${flyway.migrationsRemoved.size}")
        flyway.migrationsRemoved.forEach { migration ->
            println("  • ${migration.version} - ${migration.description}")
            println("    Path: ${migration.filepath}")
        }
        println()

        println("Migrations Deleted: ${flyway.migrationsDeleted.size}")
        flyway.migrationsDeleted.forEach { migration ->
            println("  • ${migration.version} - ${migration.description}")
            println("    Path: ${migration.filepath}")
        }
        println()

        println("Migrations Aligned: ${flyway.migrationsAligned.size}")
        flyway.migrationsAligned.forEach { migration ->
            println("  • ${migration.version} - ${migration.description}")
            println("    Path: ${migration.filepath}")
        }
        println()

        if (flyway.warnings.isNotEmpty()) {
            println("⚠️  Warnings:")
            flyway.warnings.forEach { warning ->
                println("  • $warning")
            }
            println()
        }

        println("================================")
    }
}
