# Data Model — Simplified Cal.com Clone

This document describes the domain entities and their relationships for a heavily
simplified scheduling application (an analog of Cal.com). It is storage-oriented
(relational/SQL) but intentionally **implementation-agnostic** — no language,
framework, or ORM is assumed yet.

## Domain overview

There are two roles, and there is **no registration or authentication**:

- **Owner** — a single, predefined profile. It is used by default in the admin
  area. The owner creates event types and reviews upcoming bookings.
- **Guest** — books a slot without creating an account or logging in.

Because there is exactly **one** owner and no auth, the whole database implicitly
belongs to that owner. We therefore do **not** add an `owner_id` foreign key to
the other tables — it would be redundant for a single-owner system.

### What each role can do

- **Owner**
  - Create event types (id, title, description, duration in minutes).
  - View an "upcoming meetings" page listing bookings of **all** event types in a
    single list.
- **Guest**
  - View the list of bookable event types (title, description, duration).
  - Pick an event type, open the calendar, and choose a free slot within the next
    14 days.
  - Create a booking for the chosen slot.

## Entities

### 1. Owner — calendar owner (single row)

The one and only profile. Created via a seed/migration. It also holds the
**availability window** used to generate slots (this fills the gap in the spec
about working hours — see [Assumptions](#assumptions)).

| Field           | Type            | Purpose                                                            |
|-----------------|-----------------|--------------------------------------------------------------------|
| `id`            | PK              | —                                                                  |
| `name`          | string          | Owner's display name (shown to guests)                             |
| `email`         | string          | Contact                                                            |
| `timezone`      | string          | IANA timezone (e.g. `Europe/Moscow`); timestamps are stored in UTC |
| `workday_start` | time            | Start of the working day, e.g. `09:00`                             |
| `workday_end`   | time            | End of the working day, e.g. `18:00`                               |
| `working_days`  | int[] / bitmask | Working weekdays (e.g. Mon–Fri). Optional; defaults to all 7 days  |

> Note: this could be application config instead of a table. A single-row table is
> recommended for consistency with the rest of the model and so working hours can
> change without a redeployment.

### 2. EventType — type of meeting

Created by the owner. Per the spec, the owner sets: id, title, description, and
duration.

| Field              | Type           | Purpose                                                                                                                        |
|--------------------|----------------|--------------------------------------------------------------------------------------------------------------------------------|
| `id`               | PK             | System identifier                                                                                                              |
| `slug`             | string, unique | Human-readable identifier used in the URL (the "id" the owner sets, like `/30min` in Cal.com). See [Assumptions](#assumptions) |
| `title`            | string         | Title                                                                                                                          |
| `description`      | text           | Description                                                                                                                    |
| `duration_minutes` | int (> 0)      | Duration in minutes. Also the step of the slot grid                                                                            |
| `is_active`        | bool           | Optional: hide a type without deleting its bookings                                                                            |
| `created_at`       | timestamp      | —                                                                                                                              |
| `updated_at`       | timestamp      | —                                                                                                                              |

Relationship: one `EventType` has many `Booking`s (1:N).

### 3. Booking — a reservation

Created by a guest for a specific slot.

| Field           | Type            | Purpose                                                                 |
|-----------------|-----------------|-------------------------------------------------------------------------|
| `id`            | PK              | —                                                                       |
| `event_type_id` | FK → EventType  | Which event type was booked                                             |
| `start_at`      | timestamp (UTC) | Meeting start                                                           |
| `end_at`        | timestamp (UTC) | `start_at + duration_minutes`. Denormalized to make overlap checks easy |
| `guest_name`    | string          | Guest's name. See [Assumptions](#assumptions)                           |
| `guest_email`   | string          | Guest's contact. See [Assumptions](#assumptions)                        |
| `created_at`    | timestamp       | —                                                                       |

Relationship: many `Booking`s belong to one `EventType` (N:1).

## Computed (NOT an entity): Slot — a free time slot

Slots are **not stored**. For a chosen `EventType` they are generated on the fly:

```
for each day D in [today .. today + 14):
  if D is a working day of the owner:
    for t in grid(D, workday_start..workday_end, step = duration_minutes):
      candidate = [t, t + duration_minutes)
      if candidate.start >= now() AND candidate does not overlap any Booking:
        the slot is free
```

Inputs for generation:

- `EventType.duration_minutes` — the step;
- `Owner.workday_*` / `working_days` — the window;
- the `Booking` table — what to subtract.

## Busyness rule

Spec: *"You cannot create two records for the same time, even if they are different
event types."* → the constraint is **global**, across all `Booking`s regardless of
`event_type_id`.

Because different event types have different durations, the correct semantics is to
**forbid interval overlap** of `[start_at, end_at)` (the single owner cannot be in
two meetings at once), not merely equality of `start_at`.

Levels of protection:

1. **Application level**: when creating a booking, verify the interval does not
   overlap any existing booking.
2. **Database level** (guard against race conditions):
   - PostgreSQL: `EXCLUDE USING gist (tsrange(start_at, end_at) WITH &&)` — the
     database itself rejects an overlapping interval.
   - SQLite / engines without exclusion constraints: application check plus
     `UNIQUE(start_at)` as a basic guard against an identical start time.

Validation when creating a booking:

- the slot is within `[now, now + 14 days]` and in the future;
- the slot falls inside the owner's working window and on the chosen type's grid;
- the interval does not overlap any existing booking.

## Relationships (ER summary)

```
Owner (single row: profile + availability window)
        │  (logically owns everything; no FK pulled — there is one owner)
EventType  1 ────< N  Booking
                          │
                          └─ global non-overlap constraint across intervals
```

## Assumptions

These are decisions made where the spec is silent or ambiguous; revisit if needed.

1. **Guest contact info.** The spec does not state that a guest enters a
   name/email, but without it a booking is anonymous. We include `guest_name` and
   `guest_email`.
2. **EventType "id".** Interpreted as a user-defined `slug` for the URL (plus a
   system PK). Alternative: the owner types a numeric/string id directly.
3. **Working hours.** The spec defines only the 14-day window, not hours within a
   day. We put `workday_start/end` + `working_days` on `Owner`. Default proposed:
   Mon–Fri, 09:00–18:00. Alternative: generate slots around the clock.
4. **Busyness semantics.** Implemented as interval non-overlap (accounting for
   different durations), not just equality of start time.
5. **Timezones.** Timestamps stored in UTC, displayed in the owner's timezone. For
   the simplified version there is a single timezone (the owner's).

## Validation scenarios

The model is considered complete if every scenario works **without adding new
entities**:

1. Owner creates an `EventType` (id/slug, title, description, duration) → a row in
   `event_types`.
2. Guest opens the list of types → read `event_types` (title, description,
   duration).
3. Guest picks a type and sees the calendar → generate free slots for 14 days
   (algorithm above).
4. Guest books a slot → a `Booking` is created and passes window + non-overlap
   validation.
5. Guest tries to book an already-taken time (including for a different type) → the
   busyness rule rejects it.
6. Owner opens "upcoming meetings" → select `Booking`s of all types where
   `start_at >= now`, ordered by `start_at`, joined to `EventType` for the title.

## Versioning

This package (`spec`) is versioned **independently** via release-please from
[Conventional Commits](https://www.conventionalcommits.org/) — see [`../CONTRIBUTING.md`](../CONTRIBUTING.md).
Never hand-bump `package.json`'s `version` or edit `CHANGELOG.md`; release-please owns both.
