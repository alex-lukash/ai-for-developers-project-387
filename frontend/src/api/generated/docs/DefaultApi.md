# DefaultApi

All URIs are relative to */api*

| Method | HTTP request | Description |
|------------- | ------------- | -------------|
| [**eventTypesBook**](DefaultApi.md#eventtypesbook) | **POST** /event-types/{slug}/bookings |  |
| [**eventTypesCreate**](DefaultApi.md#eventtypescreate) | **POST** /event-types |  |
| [**eventTypesList**](DefaultApi.md#eventtypeslist) | **GET** /event-types |  |
| [**eventTypesRead**](DefaultApi.md#eventtypesread) | **GET** /event-types/{slug} |  |
| [**eventTypesRemove**](DefaultApi.md#eventtypesremove) | **DELETE** /event-types/{slug} |  |
| [**eventTypesSlots**](DefaultApi.md#eventtypesslots) | **GET** /event-types/{slug}/slots |  |
| [**eventTypesUpdate**](DefaultApi.md#eventtypesupdate) | **PATCH** /event-types/{slug} |  |
| [**getOwner**](DefaultApi.md#getowner) | **GET** /owner |  |
| [**listBookings**](DefaultApi.md#listbookings) | **GET** /bookings |  |



## eventTypesBook

> Booking eventTypesBook(slug, bookingCreate)



Book a slot (guest). 422 with code &#x60;slot_in_past&#x60; | &#x60;slot_out_of_window&#x60; | &#x60;slot_not_on_grid&#x60; | &#x60;validation_failed&#x60;; 409 &#x60;slot_taken&#x60; when the interval overlaps an existing booking (busyness rule, global across all event types).

### Example

```ts
import {
  Configuration,
  DefaultApi,
} from '';
import type { EventTypesBookRequest } from '';

async function example() {
  console.log("🚀 Testing  SDK...");
  const api = new DefaultApi();

  const body = {
    // string
    slug: slug_example,
    // BookingCreate
    bookingCreate: ...,
  } satisfies EventTypesBookRequest;

  try {
    const data = await api.eventTypesBook(body);
    console.log(data);
  } catch (error) {
    console.error(error);
  }
}

// Run the test
example().catch(console.error);
```

### Parameters


| Name | Type | Description  | Notes |
|------------- | ------------- | ------------- | -------------|
| **slug** | `string` |  | [Defaults to `undefined`] |
| **bookingCreate** | [BookingCreate](BookingCreate.md) |  | |

### Return type

[**Booking**](Booking.md)

### Authorization

No authorization required

### HTTP request headers

- **Content-Type**: `application/json`
- **Accept**: `application/json`


### HTTP response details
| Status code | Description | Response headers |
|-------------|-------------|------------------|
| **201** | The request has succeeded and a new resource has been created as a result. |  -  |
| **404** | 404 — unknown event type slug. |  -  |
| **409** | 409 — conflict: overlapping booking (&#x60;slot_taken&#x60;) or duplicate &#x60;slug&#x60; (&#x60;slug_taken&#x60;). |  -  |
| **422** | 422 — validation failed (window/grid/past/invalid input). |  -  |

[[Back to top]](#) [[Back to API list]](../README.md#api-endpoints) [[Back to Model list]](../README.md#models) [[Back to README]](../README.md)


## eventTypesCreate

> EventType eventTypesCreate(eventTypeCreate)



Create an event type (owner). 422 &#x60;validation_failed&#x60; (empty title / duration_minutes &lt;&#x3D; 0), 409 &#x60;slug_taken&#x60;.

### Example

```ts
import {
  Configuration,
  DefaultApi,
} from '';
import type { EventTypesCreateRequest } from '';

async function example() {
  console.log("🚀 Testing  SDK...");
  const api = new DefaultApi();

  const body = {
    // EventTypeCreate
    eventTypeCreate: ...,
  } satisfies EventTypesCreateRequest;

  try {
    const data = await api.eventTypesCreate(body);
    console.log(data);
  } catch (error) {
    console.error(error);
  }
}

// Run the test
example().catch(console.error);
```

### Parameters


| Name | Type | Description  | Notes |
|------------- | ------------- | ------------- | -------------|
| **eventTypeCreate** | [EventTypeCreate](EventTypeCreate.md) |  | |

### Return type

[**EventType**](EventType.md)

### Authorization

No authorization required

### HTTP request headers

- **Content-Type**: `application/json`
- **Accept**: `application/json`


### HTTP response details
| Status code | Description | Response headers |
|-------------|-------------|------------------|
| **201** | The request has succeeded and a new resource has been created as a result. |  -  |
| **409** | 409 — conflict: overlapping booking (&#x60;slot_taken&#x60;) or duplicate &#x60;slug&#x60; (&#x60;slug_taken&#x60;). |  -  |
| **422** | 422 — validation failed (window/grid/past/invalid input). |  -  |

[[Back to top]](#) [[Back to API list]](../README.md#api-endpoints) [[Back to Model list]](../README.md#models) [[Back to README]](../README.md)


## eventTypesList

> Array&lt;EventType&gt; eventTypesList(includeInactive)



List event types. By default returns only active types (guest view). Pass &#x60;include_inactive&#x3D;true&#x60; for the owner\&#39;s management screen.

### Example

```ts
import {
  Configuration,
  DefaultApi,
} from '';
import type { EventTypesListRequest } from '';

async function example() {
  console.log("🚀 Testing  SDK...");
  const api = new DefaultApi();

  const body = {
    // boolean (optional)
    includeInactive: true,
  } satisfies EventTypesListRequest;

  try {
    const data = await api.eventTypesList(body);
    console.log(data);
  } catch (error) {
    console.error(error);
  }
}

// Run the test
example().catch(console.error);
```

### Parameters


| Name | Type | Description  | Notes |
|------------- | ------------- | ------------- | -------------|
| **includeInactive** | `boolean` |  | [Optional] [Defaults to `undefined`] |

### Return type

[**Array&lt;EventType&gt;**](EventType.md)

### Authorization

No authorization required

### HTTP request headers

- **Content-Type**: Not defined
- **Accept**: `application/json`


### HTTP response details
| Status code | Description | Response headers |
|-------------|-------------|------------------|
| **200** | The request has succeeded. |  -  |

[[Back to top]](#) [[Back to API list]](../README.md#api-endpoints) [[Back to Model list]](../README.md#models) [[Back to README]](../README.md)


## eventTypesRead

> EventType eventTypesRead(slug)



Get a single event type by slug. 404 &#x60;event_type_not_found&#x60;.

### Example

```ts
import {
  Configuration,
  DefaultApi,
} from '';
import type { EventTypesReadRequest } from '';

async function example() {
  console.log("🚀 Testing  SDK...");
  const api = new DefaultApi();

  const body = {
    // string
    slug: slug_example,
  } satisfies EventTypesReadRequest;

  try {
    const data = await api.eventTypesRead(body);
    console.log(data);
  } catch (error) {
    console.error(error);
  }
}

// Run the test
example().catch(console.error);
```

### Parameters


| Name | Type | Description  | Notes |
|------------- | ------------- | ------------- | -------------|
| **slug** | `string` |  | [Defaults to `undefined`] |

### Return type

[**EventType**](EventType.md)

### Authorization

No authorization required

### HTTP request headers

- **Content-Type**: Not defined
- **Accept**: `application/json`


### HTTP response details
| Status code | Description | Response headers |
|-------------|-------------|------------------|
| **200** | The request has succeeded. |  -  |
| **404** | 404 — unknown event type slug. |  -  |

[[Back to top]](#) [[Back to API list]](../README.md#api-endpoints) [[Back to Model list]](../README.md#models) [[Back to README]](../README.md)


## eventTypesRemove

> eventTypesRemove(slug)



Delete an event type (owner). Optional in the MVP.

### Example

```ts
import {
  Configuration,
  DefaultApi,
} from '';
import type { EventTypesRemoveRequest } from '';

async function example() {
  console.log("🚀 Testing  SDK...");
  const api = new DefaultApi();

  const body = {
    // string
    slug: slug_example,
  } satisfies EventTypesRemoveRequest;

  try {
    const data = await api.eventTypesRemove(body);
    console.log(data);
  } catch (error) {
    console.error(error);
  }
}

// Run the test
example().catch(console.error);
```

### Parameters


| Name | Type | Description  | Notes |
|------------- | ------------- | ------------- | -------------|
| **slug** | `string` |  | [Defaults to `undefined`] |

### Return type

`void` (Empty response body)

### Authorization

No authorization required

### HTTP request headers

- **Content-Type**: Not defined
- **Accept**: `application/json`


### HTTP response details
| Status code | Description | Response headers |
|-------------|-------------|------------------|
| **204** | There is no content to send for this request, but the headers may be useful.  |  -  |
| **404** | 404 — unknown event type slug. |  -  |

[[Back to top]](#) [[Back to API list]](../README.md#api-endpoints) [[Back to Model list]](../README.md#models) [[Back to README]](../README.md)


## eventTypesSlots

> SlotsResponse eventTypesSlots(slug, from, to)



Free slots for the chosen type, grouped by day. &#x60;from&#x60;/&#x60;to&#x60; are optional and clamped to [today, today + 14 days). 404 &#x60;event_type_not_found&#x60;.

### Example

```ts
import {
  Configuration,
  DefaultApi,
} from '';
import type { EventTypesSlotsRequest } from '';

async function example() {
  console.log("🚀 Testing  SDK...");
  const api = new DefaultApi();

  const body = {
    // string
    slug: slug_example,
    // Date (optional)
    from: 2013-10-20,
    // Date (optional)
    to: 2013-10-20,
  } satisfies EventTypesSlotsRequest;

  try {
    const data = await api.eventTypesSlots(body);
    console.log(data);
  } catch (error) {
    console.error(error);
  }
}

// Run the test
example().catch(console.error);
```

### Parameters


| Name | Type | Description  | Notes |
|------------- | ------------- | ------------- | -------------|
| **slug** | `string` |  | [Defaults to `undefined`] |
| **from** | `Date` |  | [Optional] [Defaults to `undefined`] |
| **to** | `Date` |  | [Optional] [Defaults to `undefined`] |

### Return type

[**SlotsResponse**](SlotsResponse.md)

### Authorization

No authorization required

### HTTP request headers

- **Content-Type**: Not defined
- **Accept**: `application/json`


### HTTP response details
| Status code | Description | Response headers |
|-------------|-------------|------------------|
| **200** | The request has succeeded. |  -  |
| **404** | 404 — unknown event type slug. |  -  |

[[Back to top]](#) [[Back to API list]](../README.md#api-endpoints) [[Back to Model list]](../README.md#models) [[Back to README]](../README.md)


## eventTypesUpdate

> EventType eventTypesUpdate(slug, eventTypeUpdate)



Update an event type (owner). Optional in the MVP.

### Example

```ts
import {
  Configuration,
  DefaultApi,
} from '';
import type { EventTypesUpdateRequest } from '';

async function example() {
  console.log("🚀 Testing  SDK...");
  const api = new DefaultApi();

  const body = {
    // string
    slug: slug_example,
    // EventTypeUpdate
    eventTypeUpdate: ...,
  } satisfies EventTypesUpdateRequest;

  try {
    const data = await api.eventTypesUpdate(body);
    console.log(data);
  } catch (error) {
    console.error(error);
  }
}

// Run the test
example().catch(console.error);
```

### Parameters


| Name | Type | Description  | Notes |
|------------- | ------------- | ------------- | -------------|
| **slug** | `string` |  | [Defaults to `undefined`] |
| **eventTypeUpdate** | [EventTypeUpdate](EventTypeUpdate.md) |  | |

### Return type

[**EventType**](EventType.md)

### Authorization

No authorization required

### HTTP request headers

- **Content-Type**: `application/json`
- **Accept**: `application/json`


### HTTP response details
| Status code | Description | Response headers |
|-------------|-------------|------------------|
| **200** | The request has succeeded. |  -  |
| **404** | 404 — unknown event type slug. |  -  |
| **422** | 422 — validation failed (window/grid/past/invalid input). |  -  |

[[Back to top]](#) [[Back to API list]](../README.md#api-endpoints) [[Back to Model list]](../README.md#models) [[Back to README]](../README.md)


## getOwner

> Owner getOwner()



Returns the single owner profile and availability window.

### Example

```ts
import {
  Configuration,
  DefaultApi,
} from '';
import type { GetOwnerRequest } from '';

async function example() {
  console.log("🚀 Testing  SDK...");
  const api = new DefaultApi();

  try {
    const data = await api.getOwner();
    console.log(data);
  } catch (error) {
    console.error(error);
  }
}

// Run the test
example().catch(console.error);
```

### Parameters

This endpoint does not need any parameter.

### Return type

[**Owner**](Owner.md)

### Authorization

No authorization required

### HTTP request headers

- **Content-Type**: Not defined
- **Accept**: `application/json`


### HTTP response details
| Status code | Description | Response headers |
|-------------|-------------|------------------|
| **200** | The request has succeeded. |  -  |

[[Back to top]](#) [[Back to API list]](../README.md#api-endpoints) [[Back to Model list]](../README.md#models) [[Back to README]](../README.md)


## listBookings

> Array&lt;Booking&gt; listBookings(from, to)



Owner\&#39;s \&quot;upcoming meetings\&quot;: all bookings across every event type with start_at &gt;&#x3D; now, ordered by start_at ascending. &#x60;from&#x60;/&#x60;to&#x60; optionally narrow the range.

### Example

```ts
import {
  Configuration,
  DefaultApi,
} from '';
import type { ListBookingsRequest } from '';

async function example() {
  console.log("🚀 Testing  SDK...");
  const api = new DefaultApi();

  const body = {
    // Date (optional)
    from: 2013-10-20,
    // Date (optional)
    to: 2013-10-20,
  } satisfies ListBookingsRequest;

  try {
    const data = await api.listBookings(body);
    console.log(data);
  } catch (error) {
    console.error(error);
  }
}

// Run the test
example().catch(console.error);
```

### Parameters


| Name | Type | Description  | Notes |
|------------- | ------------- | ------------- | -------------|
| **from** | `Date` |  | [Optional] [Defaults to `undefined`] |
| **to** | `Date` |  | [Optional] [Defaults to `undefined`] |

### Return type

[**Array&lt;Booking&gt;**](Booking.md)

### Authorization

No authorization required

### HTTP request headers

- **Content-Type**: Not defined
- **Accept**: `application/json`


### HTTP response details
| Status code | Description | Response headers |
|-------------|-------------|------------------|
| **200** | The request has succeeded. |  -  |

[[Back to top]](#) [[Back to API list]](../README.md#api-endpoints) [[Back to Model list]](../README.md#models) [[Back to README]](../README.md)

