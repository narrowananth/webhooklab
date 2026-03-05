plugins {
    id("build.library")
}

dependencies {
    api(libs.spring.boot.starter.webmvc)
    api(libs.spring.data.commons)
    api(libs.jackson.databind)
}
