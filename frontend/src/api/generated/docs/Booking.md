
# Booking

A guest\'s reservation of one slot. Many Bookings belong to one EventType.

## Properties

Name | Type
------------ | -------------
`id` | number
`eventType` | [BookingEventType](BookingEventType.md)
`startAt` | Date
`endAt` | Date
`guestName` | string
`guestEmail` | string
`createdAt` | Date

## Example

```typescript
import type { Booking } from ''

// TODO: Update the object below with actual values
const example = {
  "id": null,
  "eventType": null,
  "startAt": null,
  "endAt": null,
  "guestName": null,
  "guestEmail": null,
  "createdAt": null,
} satisfies Booking

console.log(example)

// Convert the instance to a JSON string
const exampleJSON: string = JSON.stringify(example)
console.log(exampleJSON)

// Parse the JSON string back to an object
const exampleParsed = JSON.parse(exampleJSON) as Booking
console.log(exampleParsed)
```

[[Back to top]](#) [[Back to API list]](../README.md#api-endpoints) [[Back to Model list]](../README.md#models) [[Back to README]](../README.md)


