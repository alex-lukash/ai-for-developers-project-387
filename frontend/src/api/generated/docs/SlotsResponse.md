
# SlotsResponse


## Properties

Name | Type
------------ | -------------
`eventType` | [SlotsResponseEventType](SlotsResponseEventType.md)
`timezone` | string
`days` | [Array&lt;DaySlots&gt;](DaySlots.md)

## Example

```typescript
import type { SlotsResponse } from ''

// TODO: Update the object below with actual values
const example = {
  "eventType": null,
  "timezone": null,
  "days": null,
} satisfies SlotsResponse

console.log(example)

// Convert the instance to a JSON string
const exampleJSON: string = JSON.stringify(example)
console.log(exampleJSON)

// Parse the JSON string back to an object
const exampleParsed = JSON.parse(exampleJSON) as SlotsResponse
console.log(exampleParsed)
```

[[Back to top]](#) [[Back to API list]](../README.md#api-endpoints) [[Back to Model list]](../README.md#models) [[Back to README]](../README.md)


