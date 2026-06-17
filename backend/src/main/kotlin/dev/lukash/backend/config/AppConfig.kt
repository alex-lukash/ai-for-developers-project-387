package dev.lukash.backend.config

import org.springframework.context.annotation.Bean
import org.springframework.context.annotation.Configuration
import java.time.Clock

@Configuration
class AppConfig {

    /** Injected wherever "now" is needed, so tests can pin a fixed instant. */
    @Bean
    fun clock(): Clock = Clock.systemUTC()
}
