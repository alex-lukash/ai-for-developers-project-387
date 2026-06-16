import "@typespec/http";
import "@typespec/openapi";

using Http;
using OpenAPI;

/**
 * API contract for the simplified Cal.com clone (Hexlet "AI for developers").
 *
 * Single owner, no authentication (and never will be). A guest browses event
 * types and books a free slot within a 14-day window. Bookings may not overlap
 * globally — the single owner cannot be in two meetings at once.
 *
 * Conventions:
 *  - JSON field names are snake_case.
 *  - All timestamps are UTC (`utcDateTime`, e.g. 2026-05-30T06:00:00Z). The
 *    owner's `timezone` is exposed via GET /owner so the frontend can render
 *    local time.
 *  - Errors share one envelope: { "error": { code, message, fields? } }.
 *
 * Source of truth for the domain: spec/data-model.md.
 */
@service(#{ title: "Simplified Cal.com Clone API" })
@server("/api", "Base API path")
namespace SchedulingApi;

// ---------------------------------------------------------------------------
// Shared error envelope
// ---------------------------------------------------------------------------

/** Stable error code, e.g. "slot_taken". See operation docs for the vocabulary. */
union ErrorCode {
  string,
  validation_failed: "validation_failed",
  slot_in_past: "slot_in_past",
  slot_out_of_window: "slot_out_of_window",
  slot_not_on_grid: "slot_not_on_grid",
  slot_taken: "slot_taken",
  event_type_not_found: "event_type_not_found",
  slug_taken: "slug_taken",
}

model ApiError {
  code: ErrorCode;
  message: string;

  /** Per-field validation messages, present mainly on 422 responses. */
  fields?: Record<string[]>;
}

@error
model ErrorBody {
  error: ApiError;
}

/** 400 — malformed JSON or a missing required parameter. */
model BadRequestResponse is ErrorBody {
  @statusCode statusCode: 400;
}

/** 404 — unknown event type slug. */
model NotFoundResponse is ErrorBody {
  @statusCode statusCode: 404;
}

/** 409 — conflict: overlapping booking (`slot_taken`) or duplicate `slug` (`slug_taken`). */
model ConflictResponse is ErrorBody {
  @statusCode statusCode: 409;
}

/** 422 — validation failed (window/grid/past/invalid input). */
model ValidationResponse is ErrorBody {
  @statusCode statusCode: 422;
}

// ---------------------------------------------------------------------------
// Owner
// ---------------------------------------------------------------------------

/** The single calendar owner: profile + availability window used to generate slots. */
@example(#{
  name: "Ada Lovelace",
  email: "ada@example.com",
  timezone: "UTC",
  workday_start: plainTime.fromISO("09:00:00"),
  workday_end: plainTime.fromISO("17:00:00"),
  working_days: #[1, 2, 3, 4, 5],
})
model Owner {
  /** Display name shown to guests. */
  name: string;

  email: string;

  /** IANA timezone, e.g. "Europe/Moscow". */
  timezone: string;

  /** Start of the working day, e.g. 09:00. */
  workday_start: plainTime;

  /** End of the working day, e.g. 18:00. */
  workday_end: plainTime;

  /** Working weekdays as ISO numbers (1 = Monday ... 7 = Sunday). Defaults to Mon–Fri. */
  working_days: int32[];
}

// ---------------------------------------------------------------------------
// EventType
// ---------------------------------------------------------------------------

/** A type of meeting the owner offers. One EventType has many Bookings. */
@example(#{
  id: 1,
  slug: "intro-call",
  title: "Intro Call",
  description: "A quick chat to see if we're a fit.",
  duration_minutes: 30,
  is_active: true,
  created_at: utcDateTime.fromISO("2026-06-01T00:00:00Z"),
  updated_at: utcDateTime.fromISO("2026-06-01T00:00:00Z"),
})
model EventType {
  id: int32;

  /** Human-readable identifier used in URLs, e.g. "30min". Unique. */
  slug: string;

  title: string;
  description: string;

  /** Meeting length in minutes; also the step of the slot grid. */
  @minValue(1)
  duration_minutes: int32;

  /** When false, the type is hidden from guests without deleting its bookings. */
  is_active: boolean;

  created_at: utcDateTime;
  updated_at: utcDateTime;
}

/** Payload to create an event type. */
model EventTypeCreate {
  slug: string;
  title: string;
  description: string;

  @minValue(1)
  duration_minutes: int32;
}

/** Payload to update an event type (all fields optional). */
model EventTypeUpdate {
  title?: string;
  description?: string;

  @minValue(1)
  duration_minutes?: int32;

  is_active?: boolean;
}

// ---------------------------------------------------------------------------
// Slots (computed on the fly, never stored)
// ---------------------------------------------------------------------------

/** A free time interval [start_at, end_at) on the owner's calendar. */
model Slot {
  start_at: utcDateTime;
  end_at: utcDateTime;
}

/**
 * Free slots for a single day. Non-working days are omitted from the response;
 * a working day with no free time is present with an empty `slots` array.
 */
model DaySlots {
  date: plainDate;
  slots: Slot[];
}

@example(#{
  event_type: #{ slug: "intro-call", duration_minutes: 30 },
  timezone: "UTC",
  days: #[
    #{
      date: plainDate.fromISO("2026-06-16"),
      slots: #[
        #{
          start_at: utcDateTime.fromISO("2026-06-16T09:00:00Z"),
          end_at: utcDateTime.fromISO("2026-06-16T09:30:00Z"),
        },
        #{
          start_at: utcDateTime.fromISO("2026-06-16T09:30:00Z"),
          end_at: utcDateTime.fromISO("2026-06-16T10:00:00Z"),
        },
        #{
          start_at: utcDateTime.fromISO("2026-06-16T10:00:00Z"),
          end_at: utcDateTime.fromISO("2026-06-16T10:30:00Z"),
        },
      ],
    },
    #{
      date: plainDate.fromISO("2026-06-17"),
      slots: #[
        #{
          start_at: utcDateTime.fromISO("2026-06-17T14:00:00Z"),
          end_at: utcDateTime.fromISO("2026-06-17T14:30:00Z"),
        },
        #{
          start_at: utcDateTime.fromISO("2026-06-17T14:30:00Z"),
          end_at: utcDateTime.fromISO("2026-06-17T15:00:00Z"),
        },
      ],
    },
  ],
})
model SlotsResponse {
  event_type: {
    slug: string;
    duration_minutes: int32;
  };

  /** Owner timezone for rendering the UTC slots locally. */
  timezone: string;

  days: DaySlots[];
}

// ---------------------------------------------------------------------------
// Booking
// ---------------------------------------------------------------------------

/** A guest's reservation of one slot. Many Bookings belong to one EventType. */
@example(#{
  id: 99,
  event_type: #{ id: 1, slug: "intro-call", title: "Intro Call", duration_minutes: 30 },
  start_at: utcDateTime.fromISO("2026-06-16T09:00:00Z"),
  end_at: utcDateTime.fromISO("2026-06-16T09:30:00Z"),
  guest_name: "Grace Hopper",
  guest_email: "grace@example.com",
  created_at: utcDateTime.fromISO("2026-06-10T00:00:00Z"),
})
model Booking {
  id: int32;

  /** Denormalized event-type summary (the meeting's title for the owner's list). */
  event_type: {
    id: int32;
    slug: string;
    title: string;
    duration_minutes: int32;
  };

  start_at: utcDateTime;

  /** start_at + duration_minutes. */
  end_at: utcDateTime;

  guest_name: string;
  guest_email: string;
  created_at: utcDateTime;
}

/** Payload to create a booking. `end_at` is derived server-side from the duration. */
model BookingCreate {
  start_at: utcDateTime;
  guest_name: string;
  guest_email: string;
}

// ---------------------------------------------------------------------------
// Operations
// ---------------------------------------------------------------------------

/** Returns the single owner profile and availability window. */
@route("/owner")
@get
op getOwner(): Owner;

@route("/event-types")
namespace EventTypes {
  /**
   * List event types. By default returns only active types (guest view).
   * Pass `include_inactive=true` for the owner's management screen.
   */
  @opExample(#{
    returnType: #[
      #{
        id: 1,
        slug: "intro-call",
        title: "Intro Call",
        description: "A quick chat to see if we're a fit.",
        duration_minutes: 30,
        is_active: true,
        created_at: utcDateTime.fromISO("2026-06-01T00:00:00Z"),
        updated_at: utcDateTime.fromISO("2026-06-01T00:00:00Z"),
      },
      #{
        id: 2,
        slug: "deep-dive",
        title: "Deep Dive",
        description: "A longer, focused working session.",
        duration_minutes: 60,
        is_active: false,
        created_at: utcDateTime.fromISO("2026-06-01T00:00:00Z"),
        updated_at: utcDateTime.fromISO("2026-06-01T00:00:00Z"),
      },
    ],
  })
  @get
  op list(@query include_inactive?: boolean): EventType[];

  /**
   * Create an event type (owner).
   * 422 `validation_failed` (empty title / duration_minutes <= 0),
   * 409 `slug_taken`.
   */
  @post
  op create(@body body: EventTypeCreate): {
    @statusCode statusCode: 201;
    @body created: EventType;
  } | ValidationResponse | ConflictResponse;

  /** Get a single event type by slug. 404 `event_type_not_found`. */
  @route("/{slug}")
  @get
  op read(@path slug: string): EventType | NotFoundResponse;

  /** Update an event type (owner). Optional in the MVP. */
  @route("/{slug}")
  @patch
  op update(
    @path slug: string,
    @body body: EventTypeUpdate,
  ): EventType | NotFoundResponse | ValidationResponse;

  /** Delete an event type (owner). Optional in the MVP. */
  @route("/{slug}")
  @delete
  op remove(@path slug: string): {
    @statusCode statusCode: 204;
  } | NotFoundResponse;

  /**
   * Free slots for the chosen type, grouped by day.
   * `from`/`to` are optional and clamped to [today, today + 14 days).
   * 404 `event_type_not_found`.
   */
  @route("/{slug}/slots")
  @get
  op slots(
    @path slug: string,
    @query from?: plainDate,
    @query to?: plainDate,
  ): SlotsResponse | NotFoundResponse;

  /**
   * Book a slot (guest).
   * 422 with code `slot_in_past` | `slot_out_of_window` | `slot_not_on_grid` |
   * `validation_failed`; 409 `slot_taken` when the interval overlaps an existing
   * booking (busyness rule, global across all event types).
   */
  @route("/{slug}/bookings")
  @post
  op book(
    @path slug: string,
    @body body: BookingCreate,
  ): {
    @statusCode statusCode: 201;
    @body created: Booking;
  } | NotFoundResponse | ValidationResponse | ConflictResponse;
}

/**
 * Owner's "upcoming meetings": all bookings across every event type with
 * start_at >= now, ordered by start_at ascending. `from`/`to` optionally
 * narrow the range.
 */
@opExample(#{
  returnType: #[
    #{
      id: 99,
      event_type: #{ id: 1, slug: "intro-call", title: "Intro Call", duration_minutes: 30 },
      start_at: utcDateTime.fromISO("2026-06-16T09:00:00Z"),
      end_at: utcDateTime.fromISO("2026-06-16T09:30:00Z"),
      guest_name: "Grace Hopper",
      guest_email: "grace@example.com",
      created_at: utcDateTime.fromISO("2026-06-10T00:00:00Z"),
    },
    #{
      id: 100,
      event_type: #{ id: 2, slug: "deep-dive", title: "Deep Dive", duration_minutes: 60 },
      start_at: utcDateTime.fromISO("2026-06-17T14:00:00Z"),
      end_at: utcDateTime.fromISO("2026-06-17T15:00:00Z"),
      guest_name: "Alan Turing",
      guest_email: "alan@example.com",
      created_at: utcDateTime.fromISO("2026-06-11T00:00:00Z"),
    },
  ],
})
@route("/bookings")
@get
op listBookings(@query from?: plainDate, @query to?: plainDate): Booking[];
