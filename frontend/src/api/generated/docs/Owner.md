
# Owner

The single calendar owner: profile + availability window used to generate slots.

## Properties

Name | Type
------------ | -------------
`name` | string
`email` | string
`timezone` | string
`workdayStart` | string
`workdayEnd` | string
`workingDays` | Array&lt;number&gt;

## Example

```typescript
import type { Owner } from ''

// TODO: Update the object below with actual values
const example = {
  "name": null,
  "email": null,
  "timezone": null,
  "workdayStart": null,
  "workdayEnd": null,
  "workingDays": null,
} satisfies Owner

console.log(example)

// Convert the instance to a JSON string
const exampleJSON: string = JSON.stringify(example)
console.log(exampleJSON)

// Parse the JSON string back to an object
const exampleParsed = JSON.parse(exampleJSON) as Owner
console.log(exampleParsed)
```

[[Back to top]](#) [[Back to API list]](../README.md#api-endpoints) [[Back to Model list]](../README.md#models) [[Back to README]](../README.md)


