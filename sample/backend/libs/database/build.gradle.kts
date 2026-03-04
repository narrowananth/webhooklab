plugins {
    id("build.library")
}

dependencies {
    api(libs.spring.boot.starter.data.jpa)
    api(libs.spring.boot.starter.jdbc)
    api(libs.hibernate.envers)
    api(libs.postgresql)
}
