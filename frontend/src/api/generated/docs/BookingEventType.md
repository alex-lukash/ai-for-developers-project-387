
# BookingEventType

Denormalized event-type summary (the meeting\'s title for the owner\'s list).

## Properties

Name | Type
------------ | -------------
`id` | number
`slug` | string
`title` | string
`durationMinutes` | number

## Example

```typescript
import type { BookingEventType } from ''

// TODO: Update the object below with actual values
const example = {
  "id": null,
  "slug": null,
  "title": null,
  "durationMinutes": null,
} satisfies BookingEventType

console.log(example)

// Convert the instance to a JSON string
const exampleJSON: string = JSON.stringify(example)
console.log(exampleJSON)

// Parse the JSON string back to an object
const exampleParsed = JSON.parse(exampleJSON) as BookingEventType
console.log(exampleParsed)
```

[[Back to top]](#) [[Back to API list]](../README.md#api-endpoints) [[Back to Model list]](../README.md#models) [[Back to README]](../README.md)


