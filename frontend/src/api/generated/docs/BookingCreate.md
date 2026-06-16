
# BookingCreate

Payload to create a booking. `end_at` is derived server-side from the duration.

## Properties

Name | Type
------------ | -------------
`startAt` | Date
`guestName` | string
`guestEmail` | string

## Example

```typescript
import type { BookingCreate } from ''

// TODO: Update the object below with actual values
const example = {
  "startAt": null,
  "guestName": null,
  "guestEmail": null,
} satisfies BookingCreate

console.log(example)

// Convert the instance to a JSON string
const exampleJSON: string = JSON.stringify(example)
console.log(exampleJSON)

// Parse the JSON string back to an object
const exampleParsed = JSON.parse(exampleJSON) as BookingCreate
console.log(exampleParsed)
```

[[Back to top]](#) [[Back to API list]](../README.md#api-endpoints) [[Back to Model list]](../README.md#models) [[Back to README]](../README.md)


