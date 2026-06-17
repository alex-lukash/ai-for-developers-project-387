package dev.lukash.backend.service

import dev.lukash.backend.domain.BookingEntity
import dev.lukash.backend.domain.EventTypeEntity
import dev.lukash.backend.domain.OwnerEntity
import dev.lukash.backend.repository.BookingRepository
import dev.lukash.backend.repository.OwnerRepository
import org.junit.jupiter.api.Assertions.assertEquals
import org.junit.jupiter.api.Assertions.assertFalse
import org.junit.jupiter.api.Assertions.assertTrue
import org.junit.jupiter.api.BeforeEach
import org.junit.jupiter.api.Test
import org.mockito.Mockito
import org.mockito.Mockito.mock
import org.mockito.Mockito.`when`
import java.time.Clock
import java.time.Instant
import java.time.LocalTime
import java.time.ZoneOffset

class SlotServiceTest {

    // 2026-06-15 is a Monday; 08:00 UTC is before the 09:00 workday start.
    private val now = Instant.parse("2026-06-15T08:00:00Z")
    private val clock = Clock.fixed(now, ZoneOffset.UTC)
    private val owner = OwnerEntity(
        name = "Ada Lovelace",
        email = "ada@example.com",
        timezone = "UTC",
        workdayStart = LocalTime.of(9, 0),
        workdayEnd = LocalTime.of(17, 0),
        workingDays = mutableListOf(1, 2, 3, 4, 5),
        id = 1L,
    )
    private val introCall = EventTypeEntity(
        slug = "intro-call",
        title = "Intro Call",
        description = "",
        durationMinutes = 30,
        isActive = true,
        createdAt = now,
        updatedAt = now,
        id = 1L,
    )

    private val ownerRepository = mock(OwnerRepository::class.java)
    private val bookingRepository = mock(BookingRepository::class.java)
    private val slotService = SlotService(OwnerService(ownerRepository), bookingRepository, clock)

    /** Kotlin-friendly `any()`: registers the matcher and returns a non-null platform value. */
    private fun <T> anyArg(): T = Mockito.any<T>()

    @BeforeEach
    fun setUp() {
        `when`(ownerRepository.findFirstByOrderByIdAsc()).thenReturn(owner)
        // Repository finders returning List default to an empty list under Mockito,
        // so the no-booking cases need no explicit stub.
    }

    @Test
    fun `generates only working days within the 14-day window`() {
        val response = slotService.generate(introCall, from = null, to = null)

        // Mon 06-15 .. Sun 06-28 inclusive (window [today, today+14)); weekends omitted.
        val dates = response.days.map { it.date.toString() }
        assertTrue(dates.contains("2026-06-15"))
        assertFalse(dates.contains("2026-06-20"), "Saturday should be omitted")
        assertFalse(dates.contains("2026-06-21"), "Sunday should be omitted")
        assertEquals(10, response.days.size, "two work-weeks of working days")
    }

    @Test
    fun `slots step by duration and stay within the workday`() {
        val firstDay = slotService.generate(introCall, from = null, to = null).days.first()

        // 09:00..17:00 in 30-min steps = 16 slots.
        assertEquals(16, firstDay.slots.size)
        assertEquals(Instant.parse("2026-06-15T09:00:00Z"), firstDay.slots.first().startAt)
        assertEquals(Instant.parse("2026-06-15T17:00:00Z"), firstDay.slots.last().endAt)
    }

    @Test
    fun `a booking removes the overlapping slot`() {
        val booked = BookingEntity(
            eventType = introCall,
            startAt = Instant.parse("2026-06-15T09:00:00Z"),
            endAt = Instant.parse("2026-06-15T09:30:00Z"),
            guestName = "Grace",
            guestEmail = "grace@example.com",
            createdAt = now,
        )
        `when`(bookingRepository.findByStartAtLessThanAndEndAtGreaterThan(anyArg(), anyArg())).thenReturn(listOf(booked))

        val firstDay = slotService.generate(introCall, from = null, to = null).days.first()
        val starts = firstDay.slots.map { it.startAt }
        assertFalse(starts.contains(Instant.parse("2026-06-15T09:00:00Z")), "booked slot is gone")
        assertTrue(starts.contains(Instant.parse("2026-06-15T09:30:00Z")), "adjacent slot remains")
    }

    @Test
    fun `isOnGrid accepts aligned slots and rejects misaligned, off-hours, and weekend slots`() {
        assertTrue(slotService.isOnGrid(owner, 30, Instant.parse("2026-06-15T09:00:00Z")))
        assertTrue(slotService.isOnGrid(owner, 30, Instant.parse("2026-06-15T16:30:00Z")))
        assertFalse(slotService.isOnGrid(owner, 30, Instant.parse("2026-06-15T09:07:00Z")), "off the grid")
        assertFalse(slotService.isOnGrid(owner, 30, Instant.parse("2026-06-15T08:30:00Z")), "before workday")
        assertFalse(slotService.isOnGrid(owner, 30, Instant.parse("2026-06-15T16:45:00Z")), "ends after workday")
        assertFalse(slotService.isOnGrid(owner, 30, Instant.parse("2026-06-20T09:00:00Z")), "Saturday")
    }
}
