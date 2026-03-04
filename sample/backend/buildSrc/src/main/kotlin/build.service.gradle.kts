plugins {
    id("build.common")
    application
}

dependencies {
    implementation(project(":libs:common"))
    implementation(project(":libs:otel"))
}
