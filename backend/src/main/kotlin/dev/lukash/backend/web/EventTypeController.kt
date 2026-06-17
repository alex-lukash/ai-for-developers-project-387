package dev.lukash.backend.web

import dev.lukash.backend.generated.api.EventTypesApi
import dev.lukash.backend.generated.model.Booking
import dev.lukash.backend.generated.model.BookingCreate
import dev.lukash.backend.generated.model.EventType
import dev.lukash.backend.generated.model.EventTypeCreate
import dev.lukash.backend.generated.model.EventTypeUpdate
import dev.lukash.backend.generated.model.SlotsResponse
import dev.lukash.backend.service.BookingService
import dev.lukash.backend.service.EventTypeService
import dev.lukash.backend.service.SlotService
import org.springframework.http.HttpStatus
import org.springframework.http.ResponseEntity
import org.springframework.web.bind.annotation.RestController
import java.time.LocalDate

@RestController
class EventTypeController(
    private val eventTypeService: EventTypeService,
    private val slotService: SlotService,
    private val bookingService: BookingService,
) : EventTypesApi {

    override fun eventTypesList(includeInactive: Boolean?): ResponseEntity<List<EventType>> =
        ResponseEntity.ok(eventTypeService.list(includeInactive ?: false).map { it.toDto() })

    override fun eventTypesCreate(eventTypeCreate: EventTypeCreate): ResponseEntity<EventType> =
        ResponseEntity.status(HttpStatus.CREATED).body(eventTypeService.create(eventTypeCreate).toDto())

    override fun eventTypesRead(slug: String): ResponseEntity<EventType> =
        ResponseEntity.ok(eventTypeService.read(slug).toDto())

    override fun eventTypesUpdate(slug: String, eventTypeUpdate: EventTypeUpdate): ResponseEntity<EventType> =
        ResponseEntity.ok(eventTypeService.update(slug, eventTypeUpdate).toDto())

    override fun eventTypesRemove(slug: String): ResponseEntity<Unit> {
        eventTypeService.delete(slug)
        return ResponseEntity.noContent().build()
    }

    override fun eventTypesSlots(slug: String, from: LocalDate?, to: LocalDate?): ResponseEntity<SlotsResponse> {
        val eventType = eventTypeService.read(slug)
        return ResponseEntity.ok(slotService.generate(eventType, from, to))
    }

    override fun eventTypesBook(slug: String, bookingCreate: BookingCreate): ResponseEntity<Booking> =
        ResponseEntity.status(HttpStatus.CREATED).body(bookingService.book(slug, bookingCreate).toDto())
}
