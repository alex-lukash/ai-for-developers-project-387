package dev.lukash.backend.web

import dev.lukash.backend.generated.model.ApiError
import dev.lukash.backend.generated.model.ErrorBody
import dev.lukash.backend.service.ApiException
import org.springframework.http.HttpStatus
import org.springframework.http.ResponseEntity
import org.springframework.http.converter.HttpMessageNotReadableException
import org.springframework.web.bind.MethodArgumentNotValidException
import org.springframework.web.bind.annotation.ExceptionHandler
import org.springframework.web.bind.annotation.RestControllerAdvice

/**
 * Renders every error as the contract envelope `{ "error": { code, message, fields? } }`
 * (see spec/api.tsp). Domain errors carry their own code/status; framework validation
 * and malformed JSON are mapped to stable codes here.
 */
@RestControllerAdvice
class GlobalExceptionHandler {

    @ExceptionHandler(ApiException::class)
    fun handleApiException(ex: ApiException): ResponseEntity<ErrorBody> =
        body(ex.status, ex.code, ex.message, ex.fields)

    @ExceptionHandler(MethodArgumentNotValidException::class)
    fun handleBeanValidation(ex: MethodArgumentNotValidException): ResponseEntity<ErrorBody> {
        val fields = ex.bindingResult.fieldErrors
            .groupBy({ it.field }, { it.defaultMessage ?: "invalid" })
        return body(HttpStatus.UNPROCESSABLE_ENTITY, "validation_failed", "Validation failed.", fields)
    }

    @ExceptionHandler(HttpMessageNotReadableException::class)
    fun handleUnreadable(ex: HttpMessageNotReadableException): ResponseEntity<ErrorBody> =
        body(HttpStatus.BAD_REQUEST, "bad_request", "Malformed or missing request body.")

    private fun body(
        status: HttpStatus,
        code: String,
        message: String,
        fields: Map<String, List<String>>? = null,
    ): ResponseEntity<ErrorBody> =
        ResponseEntity.status(status).body(ErrorBody(ApiError(code = code, message = message, fields = fields)))
}
