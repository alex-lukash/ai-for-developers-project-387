package dev.lukash.backend.web

import dev.lukash.backend.generated.api.BookingsApi
import dev.lukash.backend.generated.model.Booking
import dev.lukash.backend.service.BookingService
import org.springframework.http.ResponseEntity
import org.springframework.web.bind.annotation.RestController
import java.time.LocalDate

@RestController
class BookingController(private val bookingService: BookingService) : BookingsApi {

    override fun listBookings(from: LocalDate?, to: LocalDate?): ResponseEntity<List<Booking>> =
        ResponseEntity.ok(bookingService.list(from, to).map { it.toDto() })
}
