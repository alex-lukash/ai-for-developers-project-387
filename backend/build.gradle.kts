plugins {
    kotlin("jvm") version "2.3.21"
    kotlin("plugin.spring") version "2.3.21"
    kotlin("plugin.jpa") version "2.3.21"
    id("org.springframework.boot") version "4.1.0"
    id("io.spring.dependency-management") version "1.1.7"
    id("org.openapi.generator") version "7.16.0"
}

group = "dev.lukash"
version = "0.0.1-SNAPSHOT"
description = "backend"

java {
    toolchain {
        languageVersion = JavaLanguageVersion.of(25)
    }
}

repositories {
    mavenCentral()
}

dependencies {
    implementation("org.springframework.boot:spring-boot-starter-web")
    implementation("org.springframework.boot:spring-boot-starter-data-jpa")
    implementation("org.springframework.boot:spring-boot-starter-validation")
    implementation("com.fasterxml.jackson.module:jackson-module-kotlin")
    implementation("org.jetbrains.kotlin:kotlin-reflect")
    // Referenced by the generated API interfaces / models (annotations only).
    implementation("io.swagger.core.v3:swagger-annotations:2.2.30")
    runtimeOnly("com.h2database:h2")
    testImplementation("org.springframework.boot:spring-boot-starter-test")
    testImplementation("org.jetbrains.kotlin:kotlin-test-junit5")
    testRuntimeOnly("org.junit.platform:junit-platform-launcher")
}

kotlin {
    compilerOptions {
        freeCompilerArgs.addAll("-Xjsr305=strict", "-Xannotation-default-target=param-property")
    }
}

// ---------------------------------------------------------------------------
// Code generation from the shared OpenAPI doc (spec/dist/openapi.yaml).
// Generates DTO models + Spring API interfaces under build/generated. The
// generated code is NOT committed — regenerate via the Gradle build. See
// AGENTS.md. Source of truth: spec/api.tsp -> `make spec`.
// ---------------------------------------------------------------------------
val generatedDir = layout.buildDirectory.dir("generated")

openApiGenerate {
    generatorName.set("kotlin-spring")
    inputSpec.set("$rootDir/../spec/dist/openapi.yaml")
    outputDir.set(generatedDir.get().asFile.toString())
    apiPackage.set("dev.lukash.backend.generated.api")
    modelPackage.set("dev.lukash.backend.generated.model")
    configOptions.set(
        mapOf(
            "interfaceOnly" to "true",
            "useSpringBoot3" to "true",
            "documentationProvider" to "none",
            "serializationLibrary" to "jackson",
            "enumPropertyNaming" to "original",
            "useTags" to "false",
            "gradleBuildFile" to "false",
        ),
    )
    typeMappings.set(
        mapOf(
            "DateTime" to "java.time.Instant",
            "time" to "java.time.LocalTime",
        ),
    )
    // ErrorCode is an open string union in TypeSpec; the generator emits an empty,
    // unusable class for it. Treat it as a plain string (as the frontend does).
    schemaMappings.set(mapOf("ErrorCode" to "kotlin.String"))
    globalProperties.set(mapOf("skipFormModel" to "true"))
}

sourceSets {
    main {
        kotlin.srcDir(generatedDir.map { it.dir("src/main/kotlin") })
    }
}

tasks.named("compileKotlin") {
    dependsOn("openApiGenerate")
}

tasks.withType<Test> {
    useJUnitPlatform()
}
