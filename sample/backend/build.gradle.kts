plugins {
    base
    alias(libs.plugins.spotless)
    alias(libs.plugins.version.catalog.update)
}

repositories {
    mavenCentral()
}

versionCatalogUpdate {
    sortByKey.set(false)

    keep {
        keepUnusedVersions.set(false)
    }
}

allprojects {
    apply(plugin = "com.diffplug.spotless")

    repositories {
        mavenCentral()
    }

    spotless {
        java {
            target("**/src/*/java/**/*.java")
            targetExclude("**/build/**")
            palantirJavaFormat()
            importOrder("fynxt", "java", "javax", "*")
            formatAnnotations()
            leadingSpacesToTabs()
            removeUnusedImports()
            trimTrailingWhitespace()
            endWithNewline()
        }

        kotlin {
            target("buildSrc/**/*.kt")
            targetExclude("**/build/**")
            ktlint()
            trimTrailingWhitespace()
            endWithNewline()
        }

        kotlinGradle {
            target("*.gradle.kts", "buildSrc/**/*.gradle.kts")
            targetExclude("**/build/**")
            ktlint()
        }
    }
}
