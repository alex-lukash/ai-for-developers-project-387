package dev.lukash.backend.service

import dev.lukash.backend.domain.BookingEntity
import dev.lukash.backend.domain.EventTypeEntity
import dev.lukash.backend.domain.OwnerEntity
import dev.lukash.backend.generated.model.DaySlots
import dev.lukash.backend.generated.model.Slot
import dev.lukash.backend.generated.model.SlotsResponse
import dev.lukash.backend.generated.model.SlotsResponseEventType
import dev.lukash.backend.repository.BookingRepository
import org.springframework.stereotype.Service
import java.time.Clock
import java.time.Duration
import java.time.Instant
import java.time.LocalDate
import java.time.LocalDateTime
import java.time.ZoneId

/**
 * Generates free slots on the fly (never stored) for a 14-day window, per the
 * algorithm in spec/data-model.md. Also exposes the grid-alignment check reused by
 * booking validation.
 */
@Service
class SlotService(
    private val ownerService: OwnerService,
    private val bookingRepository: BookingRepository,
    private val clock: Clock,
) {

    /**
     * Free slots for [eventType], grouped by day. `from`/`to` are inclusive day
     * bounds, clamped into the canonical window `[today, today + 14)`. Non-working
     * days are omitted; a working day with no free time yields an empty `slots` list.
     */
    fun generate(eventType: EventTypeEntity, from: LocalDate?, to: LocalDate?): SlotsResponse {
        val owner = ownerService.get()
        val zone = ZoneId.of(owner.timezone)
        val now = Instant.now(clock)
        val today = LocalDate.ofInstant(now, zone)
        val windowEndExclusive = today.plusDays(WINDOW_DAYS)

        val lowerDay = maxOf(from ?: today, today)
        val upperDayExclusive = minOf(to?.plusDays(1) ?: windowEndExclusive, windowEndExclusive)

        val days = mutableListOf<DaySlots>()
        if (lowerDay < upperDayExclusive) {
            // Preload bookings overlapping the window so the inner loop is in-memory.
            val windowStartInstant = lowerDay.atStartOfDay(zone).toInstant()
            val windowEndInstant = upperDayExclusive.atStartOfDay(zone).toInstant()
            val busy = bookingRepository
                .findByStartAtLessThanAndEndAtGreaterThan(windowEndInstant, windowStartInstant)

            var day = lowerDay
            while (day < upperDayExclusive) {
                if (day.dayOfWeek.value in owner.workingDays) {
                    days += DaySlots(date = day, slots = daySlots(day, owner, eventType.durationMinutes, zone, now, busy))
                }
                day = day.plusDays(1)
            }
        }

        return SlotsResponse(
            eventType = SlotsResponseEventType(slug = eventType.slug, durationMinutes = eventType.durationMinutes),
            timezone = owner.timezone,
            days = days,
        )
    }

    /**
     * True if [startAt] aligns with the owner's working window and the duration grid:
     * a working day, at/after `workday_start`, ending at/before `workday_end` on the
     * same day, and an integer number of `durationMinutes` steps from `workday_start`.
     */
    fun isOnGrid(owner: OwnerEntity, durationMinutes: Int, startAt: Instant): Boolean {
        val zone = ZoneId.of(owner.timezone)
        val start = LocalDateTime.ofInstant(startAt, zone)
        val day = start.toLocalDate()
        if (day.dayOfWeek.value !in owner.workingDays) return false
        if (start.toLocalTime() < owner.workdayStart) return false

        val end = start.plusMinutes(durationMinutes.toLong())
        if (end.toLocalDate() != day || end.toLocalTime() > owner.workdayEnd) return false

        val offsetMinutes = Duration.between(LocalDateTime.of(day, owner.workdayStart), start).toMinutes()
        return offsetMinutes >= 0 && offsetMinutes % durationMinutes == 0L
    }

    private fun daySlots(
        day: LocalDate,
        owner: OwnerEntity,
        durationMinutes: Int,
        zone: ZoneId,
        now: Instant,
        busy: List<BookingEntity>,
    ): List<Slot> {
        val step = Duration.ofMinutes(durationMinutes.toLong())
        val dayEnd = LocalDateTime.of(day, owner.workdayEnd)
        val slots = mutableListOf<Slot>()
        var slotStart = LocalDateTime.of(day, owner.workdayStart)
        while (!slotStart.plus(step).isAfter(dayEnd)) {
            val startInstant = slotStart.atZone(zone).toInstant()
            val endInstant = startInstant.plus(step)
            val isFuture = !startInstant.isBefore(now)
            val overlaps = busy.any { it.startAt.isBefore(endInstant) && it.endAt.isAfter(startInstant) }
            if (isFuture && !overlaps) {
                slots += Slot(startAt = startInstant, endAt = endInstant)
            }
            slotStart = slotStart.plus(step)
        }
        return slots
    }

    companion object {
        /** The bookable horizon: free slots and bookings live in `[today, today + 14)`. */
        const val WINDOW_DAYS = 14L
    }
}
