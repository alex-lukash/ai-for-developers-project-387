
# DaySlots

Free slots for a single day. Non-working days are omitted from the response; a working day with no free time is present with an empty `slots` array.

## Properties

Name | Type
------------ | -------------
`date` | Date
`slots` | [Array&lt;Slot&gt;](Slot.md)

## Example

```typescript
import type { DaySlots } from ''

// TODO: Update the object below with actual values
const example = {
  "date": null,
  "slots": null,
} satisfies DaySlots

console.log(example)

// Convert the instance to a JSON string
const exampleJSON: string = JSON.stringify(example)
console.log(exampleJSON)

// Parse the JSON string back to an object
const exampleParsed = JSON.parse(exampleJSON) as DaySlots
console.log(exampleParsed)
```

[[Back to top]](#) [[Back to API list]](../README.md#api-endpoints) [[Back to Model list]](../README.md#models) [[Back to README]](../README.md)


