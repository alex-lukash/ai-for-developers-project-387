package dev.lukash.backend.web

import org.junit.jupiter.api.BeforeEach
import org.junit.jupiter.api.Test
import org.springframework.boot.test.context.SpringBootTest
import org.springframework.boot.test.context.TestConfiguration
import org.springframework.context.annotation.Bean
import org.springframework.context.annotation.Import
import org.springframework.context.annotation.Primary
import org.springframework.http.MediaType
import org.springframework.test.web.servlet.MockMvc
import org.springframework.test.web.servlet.request.MockMvcRequestBuilders.get
import org.springframework.test.web.servlet.request.MockMvcRequestBuilders.post
import org.springframework.test.web.servlet.result.MockMvcResultMatchers.jsonPath
import org.springframework.test.web.servlet.result.MockMvcResultMatchers.status
import org.springframework.test.web.servlet.setup.MockMvcBuilders
import org.springframework.transaction.annotation.Transactional
import org.springframework.web.context.WebApplicationContext
import java.time.Clock
import java.time.Instant
import java.time.ZoneOffset

/**
 * End-to-end API tests against the in-memory H2 database with a pinned clock
 * (2026-06-15 08:00 UTC, a Monday before the 09:00 workday). `@Transactional` rolls
 * back each test's writes; the startup-seeded owner + event types remain.
 *
 * MockMvc is built from the WebApplicationContext (rather than `@AutoConfigureMockMvc`,
 * whose module is not on the starter-test classpath in Spring Boot 4).
 */
@SpringBootTest
@Import(SchedulingApiTest.FixedClockConfig::class)
@Transactional
class SchedulingApiTest(private val webApplicationContext: WebApplicationContext) {

    private lateinit var mockMvc: MockMvc

    @BeforeEach
    fun setUp() {
        mockMvc = MockMvcBuilders.webAppContextSetup(webApplicationContext).build()
    }

    @TestConfiguration
    class FixedClockConfig {
        @Bean
        @Primary
        fun fixedClock(): Clock = Clock.fixed(Instant.parse("2026-06-15T08:00:00Z"), ZoneOffset.UTC)
    }

    private fun bookingBody(startAt: String, name: String = "Grace Hopper", email: String = "grace@example.com") =
        """{"start_at":"$startAt","guest_name":"$name","guest_email":"$email"}"""

    // ---- Owner ----------------------------------------------------------------

    @Test
    fun `GET owner returns the seeded profile`() {
        mockMvc.perform(get("/api/owner"))
            .andExpect(status().isOk)
            .andExpect(jsonPath("$.name").value("Ada Lovelace"))
            .andExpect(jsonPath("$.timezone").value("UTC"))
            .andExpect(jsonPath("$.workday_start").value("09:00:00"))
            .andExpect(jsonPath("$.working_days").isArray)
    }

    // ---- Event types ----------------------------------------------------------

    @Test
    fun `GET event-types returns active only by default and all when include_inactive`() {
        mockMvc.perform(get("/api/event-types"))
            .andExpect(status().isOk)
            .andExpect(jsonPath("$.length()").value(1))
            .andExpect(jsonPath("$[0].slug").value("intro-call"))

        mockMvc.perform(get("/api/event-types").param("include_inactive", "true"))
            .andExpect(status().isOk)
            .andExpect(jsonPath("$.length()").value(2))
    }

    @Test
    fun `GET unknown event-type is 404 event_type_not_found`() {
        mockMvc.perform(get("/api/event-types/nope"))
            .andExpect(status().isNotFound)
            .andExpect(jsonPath("$.error.code").value("event_type_not_found"))
    }

    @Test
    fun `POST event-types creates, rejects duplicate slug and invalid payload`() {
        mockMvc.perform(
            post("/api/event-types").contentType(MediaType.APPLICATION_JSON)
                .content("""{"slug":"consult","title":"Consult","description":"d","duration_minutes":45}"""),
        )
            .andExpect(status().isCreated)
            .andExpect(jsonPath("$.slug").value("consult"))
            .andExpect(jsonPath("$.is_active").value(true))

        mockMvc.perform(
            post("/api/event-types").contentType(MediaType.APPLICATION_JSON)
                .content("""{"slug":"intro-call","title":"Dup","description":"d","duration_minutes":30}"""),
        )
            .andExpect(status().isConflict)
            .andExpect(jsonPath("$.error.code").value("slug_taken"))

        // Blank title (duration valid so it passes bean validation and reaches the service rule).
        mockMvc.perform(
            post("/api/event-types").contentType(MediaType.APPLICATION_JSON)
                .content("""{"slug":"bad","title":"","description":"d","duration_minutes":30}"""),
        )
            .andExpect(status().isUnprocessableEntity)
            .andExpect(jsonPath("$.error.code").value("validation_failed"))
            .andExpect(jsonPath("$.error.fields.title").isArray)

        // Non-positive duration is caught by bean validation (@Min(1)) on the generated DTO.
        mockMvc.perform(
            post("/api/event-types").contentType(MediaType.APPLICATION_JSON)
                .content("""{"slug":"bad2","title":"Bad","description":"d","duration_minutes":0}"""),
        )
            .andExpect(status().isUnprocessableEntity)
            .andExpect(jsonPath("$.error.code").value("validation_failed"))
    }

    // ---- Slots ----------------------------------------------------------------

    @Test
    fun `GET slots returns the working-day grid for the chosen type`() {
        mockMvc.perform(get("/api/event-types/intro-call/slots"))
            .andExpect(status().isOk)
            .andExpect(jsonPath("$.timezone").value("UTC"))
            .andExpect(jsonPath("$.event_type.duration_minutes").value(30))
            .andExpect(jsonPath("$.days[0].date").value("2026-06-15"))
            .andExpect(jsonPath("$.days[0].slots[0].start_at").value("2026-06-15T09:00:00Z"))
    }

    // ---- Bookings -------------------------------------------------------------

    @Test
    fun `POST booking succeeds and derives end_at from duration`() {
        mockMvc.perform(
            post("/api/event-types/intro-call/bookings").contentType(MediaType.APPLICATION_JSON)
                .content(bookingBody("2026-06-15T09:00:00Z")),
        )
            .andExpect(status().isCreated)
            .andExpect(jsonPath("$.start_at").value("2026-06-15T09:00:00Z"))
            .andExpect(jsonPath("$.end_at").value("2026-06-15T09:30:00Z"))
            .andExpect(jsonPath("$.event_type.slug").value("intro-call"))
    }

    @Test
    fun `overlapping booking is rejected, even across event types`() {
        // Book intro-call 09:30-10:00.
        mockMvc.perform(
            post("/api/event-types/intro-call/bookings").contentType(MediaType.APPLICATION_JSON)
                .content(bookingBody("2026-06-15T09:30:00Z")),
        ).andExpect(status().isCreated)

        // A different (active) 60-min type starting 09:00-10:00 overlaps it -> slot_taken.
        mockMvc.perform(
            post("/api/event-types").contentType(MediaType.APPLICATION_JSON)
                .content("""{"slug":"consult","title":"Consult","description":"d","duration_minutes":60}"""),
        ).andExpect(status().isCreated)

        mockMvc.perform(
            post("/api/event-types/consult/bookings").contentType(MediaType.APPLICATION_JSON)
                .content(bookingBody("2026-06-15T09:00:00Z")),
        )
            .andExpect(status().isConflict)
            .andExpect(jsonPath("$.error.code").value("slot_taken"))
    }

    @Test
    fun `booking validation errors map to the right codes`() {
        fun book(start: String) = post("/api/event-types/intro-call/bookings")
            .contentType(MediaType.APPLICATION_JSON).content(bookingBody(start))

        mockMvc.perform(book("2026-06-15T07:00:00Z")) // before now
            .andExpect(status().isUnprocessableEntity)
            .andExpect(jsonPath("$.error.code").value("slot_in_past"))

        mockMvc.perform(book("2026-06-30T09:00:00Z")) // beyond today+14
            .andExpect(status().isUnprocessableEntity)
            .andExpect(jsonPath("$.error.code").value("slot_out_of_window"))

        mockMvc.perform(book("2026-06-15T09:07:00Z")) // off the duration grid
            .andExpect(status().isUnprocessableEntity)
            .andExpect(jsonPath("$.error.code").value("slot_not_on_grid"))

        mockMvc.perform(
            post("/api/event-types/intro-call/bookings").contentType(MediaType.APPLICATION_JSON)
                .content(bookingBody("2026-06-15T09:00:00Z", name = "")),
        )
            .andExpect(status().isUnprocessableEntity)
            .andExpect(jsonPath("$.error.code").value("validation_failed"))

        mockMvc.perform(
            post("/api/event-types/unknown/bookings").contentType(MediaType.APPLICATION_JSON)
                .content(bookingBody("2026-06-15T09:00:00Z")),
        )
            .andExpect(status().isNotFound)
            .andExpect(jsonPath("$.error.code").value("event_type_not_found"))
    }

    @Test
    fun `GET bookings lists upcoming bookings ascending`() {
        mockMvc.perform(
            post("/api/event-types/intro-call/bookings").contentType(MediaType.APPLICATION_JSON)
                .content(bookingBody("2026-06-15T10:00:00Z")),
        ).andExpect(status().isCreated)
        mockMvc.perform(
            post("/api/event-types/intro-call/bookings").contentType(MediaType.APPLICATION_JSON)
                .content(bookingBody("2026-06-15T09:00:00Z")),
        ).andExpect(status().isCreated)

        mockMvc.perform(get("/api/bookings"))
            .andExpect(status().isOk)
            .andExpect(jsonPath("$.length()").value(2))
            .andExpect(jsonPath("$[0].start_at").value("2026-06-15T09:00:00Z"))
            .andExpect(jsonPath("$[1].start_at").value("2026-06-15T10:00:00Z"))
    }
}
