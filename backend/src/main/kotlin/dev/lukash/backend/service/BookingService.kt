package dev.lukash.backend.service

import dev.lukash.backend.domain.BookingEntity
import dev.lukash.backend.generated.model.BookingCreate
import dev.lukash.backend.repository.BookingRepository
import dev.lukash.backend.repository.EventTypeRepository
import org.springframework.dao.DataIntegrityViolationException
import org.springframework.stereotype.Service
import org.springframework.transaction.annotation.Transactional
import java.time.Clock
import java.time.Duration
import java.time.Instant
import java.time.LocalDate
import java.time.ZoneId

@Service
class BookingService(
    private val eventTypeRepository: EventTypeRepository,
    private val bookingRepository: BookingRepository,
    private val slotService: SlotService,
    private val ownerService: OwnerService,
    private val clock: Clock,
) {

    @Transactional
    fun book(slug: String, payload: BookingCreate): BookingEntity {
        val eventType = eventTypeRepository.findBySlug(slug) ?: throw ApiException.eventTypeNotFound(slug)
        validateGuest(payload)

        val owner = ownerService.get()
        val zone = ZoneId.of(owner.timezone)
        val now = Instant.now(clock)
        val start = payload.startAt

        if (start.isBefore(now)) throw ApiException.slotInPast()

        val windowEnd = LocalDate.ofInstant(now, zone)
            .plusDays(SlotService.WINDOW_DAYS)
            .atStartOfDay(zone)
            .toInstant()
        if (!start.isBefore(windowEnd)) throw ApiException.slotOutOfWindow()

        if (!slotService.isOnGrid(owner, eventType.durationMinutes, start)) throw ApiException.slotNotOnGrid()

        val end = start.plus(Duration.ofMinutes(eventType.durationMinutes.toLong()))
        if (bookingRepository.existsByStartAtLessThanAndEndAtGreaterThan(end, start)) throw ApiException.slotTaken()

        return try {
            bookingRepository.save(
                BookingEntity(
                    eventType = eventType,
                    startAt = start,
                    endAt = end,
                    guestName = payload.guestName.trim(),
                    guestEmail = payload.guestEmail.trim(),
                    createdAt = now,
                ),
            )
        } catch (_: DataIntegrityViolationException) {
            // UNIQUE(start_at) guard tripped by a concurrent booking on the same start.
            throw ApiException.slotTaken()
        }
    }

    /** Owner's upcoming meetings (start_at >= now), ascending; optionally narrowed by date range. */
    fun list(from: LocalDate?, to: LocalDate?): List<BookingEntity> {
        val zone = ZoneId.of(ownerService.get().timezone)
        val now = Instant.now(clock)
        val lower = maxOf(now, from?.atStartOfDay(zone)?.toInstant() ?: Instant.MIN)
        val upper = to?.plusDays(1)?.atStartOfDay(zone)?.toInstant()
        return if (upper == null) {
            bookingRepository.findByStartAtGreaterThanEqualOrderByStartAtAsc(lower)
        } else {
            bookingRepository.findByStartAtGreaterThanEqualAndStartAtLessThanOrderByStartAtAsc(lower, upper)
        }
    }

    private fun validateGuest(payload: BookingCreate) {
        val errors = buildMap<String, List<String>> {
            if (payload.guestName.isBlank()) put("guest_name", listOf("must not be blank"))
            if (payload.guestEmail.isBlank()) put("guest_email", listOf("must not be blank"))
        }
        if (errors.isNotEmpty()) throw ApiException.validationFailed(errors)
    }
}
