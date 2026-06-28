# carrier-search-api Specification

## Purpose
The carrier-search API returns, for an origin/destination city pair, the carriers moving the
most trucks between them — sorted by trucks per day, descending — over a fixed in-memory
dataset, with case-insensitive city matching and CORS for the portal frontend.

## Requirements
### Requirement: Carrier Search Endpoint
The system SHALL expose `POST /api/search` that accepts a JSON body with `from_city` and
`to_city` strings and SHALL respond with a JSON object containing a `carriers` array.

#### Scenario: Successful search returns carriers
- **WHEN** a client sends `POST /api/search` with `{ "from_city": "New York City", "to_city": "Washington DC" }`
- **THEN** the response status is 200
- **AND** the body contains a `carriers` array of objects, each with `name` and `trucks_per_day`

### Requirement: Known Route New York City To Washington DC
The system SHALL return Knight-Swift Transport Services (10), J.B. Hunt Transport Services
Inc (7), and YRC Worldwide (5) for the New York City to Washington DC route.

#### Scenario: NYC to DC
- **WHEN** the request is from "New York City" to "Washington DC"
- **THEN** the carriers are Knight-Swift Transport Services (10), J.B. Hunt Transport Services Inc (7), and YRC Worldwide (5)

### Requirement: Known Route San Francisco To Los Angeles
The system SHALL return XPO Logistics (9), Schneider (6), and Landstar Systems (2) for the
San Francisco to Los Angeles route.

#### Scenario: SF to LA
- **WHEN** the request is from "San Francisco" to "Los Angeles"
- **THEN** the carriers are XPO Logistics (9), Schneider (6), and Landstar Systems (2)

### Requirement: Default Route
The system SHALL return UPS Inc. (11) and FedEx Corp (9) for any city pair that is not one
of the two known routes.

#### Scenario: Unknown pair falls back to the default
- **WHEN** the request is from "Chicago" to "Denver"
- **THEN** the carriers are UPS Inc. (11) and FedEx Corp (9)

### Requirement: Case-Insensitive City Matching
The system SHALL match city names ignoring case and surrounding whitespace.

#### Scenario: Mixed case and padding still match a known route
- **WHEN** the request is from "  new york city " to "WASHINGTON DC"
- **THEN** the carriers are the New York City to Washington DC set

### Requirement: City Name Normalization
The system SHALL resolve common city-name variants to the dataset's canonical cities so the
known routes are reachable from the labels Google Places autocomplete produces. It SHALL
reduce a `City, State, Country` value to its leading city component, and SHALL treat
"New York" (and "NYC") as "New York City" and "Washington" (and "Washington D.C.") as
"Washington DC".

#### Scenario: Google Places city labels resolve to a known route
- **WHEN** the request is from "New York" to "Washington"
- **THEN** the carriers are the New York City to Washington DC set

#### Scenario: City with state and country resolves to a known route
- **WHEN** the request is from "New York, NY, USA" to "Washington, DC, USA"
- **THEN** the carriers are the New York City to Washington DC set

### Requirement: Carrier Ordering
The system SHALL return carriers sorted by `trucks_per_day` in descending order.

#### Scenario: Carriers are sorted high to low
- **WHEN** any route is returned
- **THEN** each carrier's `trucks_per_day` is greater than or equal to the next carrier's

### Requirement: Request Validation
The system SHALL reject a request missing `from_city` or `to_city` with HTTP 422.

#### Scenario: Missing field
- **WHEN** a client sends `POST /api/search` with `{ "from_city": "Boston" }`
- **THEN** the response status is 422

### Requirement: CORS For The Frontend
The system SHALL allow cross-origin requests from the origins listed in `ALLOWED_ORIGINS`.

#### Scenario: Allowed origin call succeeds
- **WHEN** the frontend at an allowed origin calls `POST /api/search`
- **THEN** the response carries the matching `Access-Control-Allow-Origin` header and the browser permits the call

### Requirement: Health Check
The system SHALL expose `GET /health` returning HTTP 200 for liveness checks.

#### Scenario: Health probe
- **WHEN** a client sends `GET /health`
- **THEN** the response status is 200

