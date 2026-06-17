package dev.lukash.backend.config

import org.springframework.context.annotation.Configuration
import org.springframework.web.method.HandlerTypePredicate
import org.springframework.web.servlet.config.annotation.PathMatchConfigurer
import org.springframework.web.servlet.config.annotation.WebMvcConfigurer

/**
 * Prefixes every controller in `dev.lukash.backend.web` with `/api`, matching the
 * `@server("/api")` base path in the spec. Kept off the generated `@RequestMapping`s
 * (which use bare paths like `/owner`) so generated code stays untouched.
 */
@Configuration
class WebConfig : WebMvcConfigurer {

    override fun configurePathMatch(configurer: PathMatchConfigurer) {
        configurer.addPathPrefix("/api", HandlerTypePredicate.forBasePackage("dev.lukash.backend.web"))
    }
}
