package dev.lukash.backend.service

import org.springframework.http.HttpStatus

/**
 * A domain error mapped 1:1 to the API error envelope `{ error: { code, message, fields? } }`.
 * The [code] values are the stable vocabulary from spec/api.tsp.
 */
class ApiException(
    val code: String,
    val status: HttpStatus,
    override val message: String,
    val fields: Map<String, List<String>>? = null,
) : RuntimeException(message) {

    companion object {
        fun eventTypeNotFound(slug: String) =
            ApiException("event_type_not_found", HttpStatus.NOT_FOUND, "Event type '$slug' not found.")

        fun slugTaken(slug: String) =
            ApiException("slug_taken", HttpStatus.CONFLICT, "Slug '$slug' is already taken.")

        fun slotTaken() =
            ApiException("slot_taken", HttpStatus.CONFLICT, "The chosen time overlaps an existing booking.")

        fun slotInPast() =
            ApiException("slot_in_past", HttpStatus.UNPROCESSABLE_ENTITY, "The chosen slot is in the past.")

        fun slotOutOfWindow() =
            ApiException(
                "slot_out_of_window",
                HttpStatus.UNPROCESSABLE_ENTITY,
                "The chosen slot is outside the bookable 14-day window.",
            )

        fun slotNotOnGrid() =
            ApiException(
                "slot_not_on_grid",
                HttpStatus.UNPROCESSABLE_ENTITY,
                "The chosen slot does not align with the owner's working hours or the event's duration grid.",
            )

        fun validationFailed(fields: Map<String, List<String>>) =
            ApiException("validation_failed", HttpStatus.UNPROCESSABLE_ENTITY, "Validation failed.", fields)
    }
}
