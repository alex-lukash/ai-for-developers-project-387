
# EventType

A type of meeting the owner offers. One EventType has many Bookings.

## Properties

Name | Type
------------ | -------------
`id` | number
`slug` | string
`title` | string
`description` | string
`durationMinutes` | number
`isActive` | boolean
`createdAt` | Date
`updatedAt` | Date

## Example

```typescript
import type { EventType } from ''

// TODO: Update the object below with actual values
const example = {
  "id": null,
  "slug": null,
  "title": null,
  "description": null,
  "durationMinutes": null,
  "isActive": null,
  "createdAt": null,
  "updatedAt": null,
} satisfies EventType

console.log(example)

// Convert the instance to a JSON string
const exampleJSON: string = JSON.stringify(example)
console.log(exampleJSON)

// Parse the JSON string back to an object
const exampleParsed = JSON.parse(exampleJSON) as EventType
console.log(exampleParsed)
```

[[Back to top]](#) [[Back to API list]](../README.md#api-endpoints) [[Back to Model list]](../README.md#models) [[Back to README]](../README.md)


