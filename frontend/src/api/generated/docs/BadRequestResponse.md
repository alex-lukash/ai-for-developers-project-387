
# BadRequestResponse

400 — malformed JSON or a missing required parameter.

## Properties

Name | Type
------------ | -------------
`error` | [ApiError](ApiError.md)

## Example

```typescript
import type { BadRequestResponse } from ''

// TODO: Update the object below with actual values
const example = {
  "error": null,
} satisfies BadRequestResponse

console.log(example)

// Convert the instance to a JSON string
const exampleJSON: string = JSON.stringify(example)
console.log(exampleJSON)

// Parse the JSON string back to an object
const exampleParsed = JSON.parse(exampleJSON) as BadRequestResponse
console.log(exampleParsed)
```

[[Back to top]](#) [[Back to API list]](../README.md#api-endpoints) [[Back to Model list]](../README.md#models) [[Back to README]](../README.md)


