
# EventTypeCreate

Payload to create an event type.

## Properties

Name | Type
------------ | -------------
`slug` | string
`title` | string
`description` | string
`durationMinutes` | number

## Example

```typescript
import type { EventTypeCreate } from ''

// TODO: Update the object below with actual values
const example = {
  "slug": null,
  "title": null,
  "description": null,
  "durationMinutes": null,
} satisfies EventTypeCreate

console.log(example)

// Convert the instance to a JSON string
const exampleJSON: string = JSON.stringify(example)
console.log(exampleJSON)

// Parse the JSON string back to an object
const exampleParsed = JSON.parse(exampleJSON) as EventTypeCreate
console.log(exampleParsed)
```

[[Back to top]](#) [[Back to API list]](../README.md#api-endpoints) [[Back to Model list]](../README.md#models) [[Back to README]](../README.md)


