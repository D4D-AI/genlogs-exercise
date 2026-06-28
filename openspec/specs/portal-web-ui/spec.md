# portal-web-ui Specification

## Purpose
The single-page portal lets a user pick an origin and destination city (Google Places
autocomplete) and, on Search, see the carriers with the highest truck volume between them plus
the fastest driving routes on an embedded Google Map, with selectable routes and
loading/error states.

## Requirements
### Requirement: Single Page Layout
The system SHALL present a single page containing a From city input, a To city input, a
Search button, a carrier results area, and a map area.

#### Scenario: Page loads
- **WHEN** the user opens the app
- **THEN** the From input, To input, Search button, and empty results and map regions are visible

### Requirement: City Autocomplete
The system SHALL provide Google Maps Places autocomplete on the From and To inputs.

#### Scenario: Suggestions appear and can be selected
- **WHEN** the user types a partial city name into the From input
- **THEN** Google Places suggestions are shown
- **AND** selecting a suggestion fills the input with that city

### Requirement: Search Triggers Backend Call
The system SHALL, when Search is clicked, send the chosen From and To cities to
`POST {VITE_API_BASE_URL}/api/search`.

#### Scenario: Search calls the API
- **WHEN** the user has chosen both cities and clicks Search
- **THEN** the app sends `POST /api/search` with `from_city` and `to_city`

### Requirement: Carrier List Rendering
The system SHALL render the carriers returned by the API, showing each carrier name and
its trucks/day, in the order the API returns them.

#### Scenario: Carriers render
- **WHEN** the API returns carriers for a route
- **THEN** each carrier's name and trucks/day are displayed in a list

### Requirement: Route Map
When the user clicks Search, the system SHALL display an embedded Google Map showing the
fastest driving routes between the two cities, requesting route alternatives and rendering
the **3 fastest** (shortest estimated travel time) of them, ordered fastest first with the
selected route visually emphasized. When Google returns fewer than 3 alternatives, the system
SHALL render all that are returned. The system SHALL list each rendered route with its
estimated travel time and driving distance, and SHALL let the user select any listed route to
highlight it on the map (de-emphasizing the others). Selecting a route SHALL restyle the
already-fetched routes and SHALL NOT issue a new Directions request.

#### Scenario: Three or more alternatives render the 3 fastest
- **WHEN** a search completes and Google returns 3 or more route alternatives
- **THEN** the map renders exactly 3 driving routes, ordered by travel time ascending
- **AND** the fastest route is selected and visually emphasized over the others

#### Scenario: Fewer than 3 alternatives render all of them
- **WHEN** a search completes and Google returns only 1 or 2 route alternatives
- **THEN** the map renders every returned route without error

#### Scenario: Each route shows its time and distance
- **WHEN** routes are rendered
- **THEN** each route is listed with its estimated travel time and driving distance

#### Scenario: Selecting a route highlights it
- **WHEN** the user selects a route from the list
- **THEN** that route is emphasized on the map and the others are de-emphasized
- **AND** no new Directions request is made

### Requirement: Loading And Error States
The system SHALL show a loading indicator while a search is in flight and a readable error
message if the API or Maps call fails, leaving the app usable.

#### Scenario: API error is handled
- **WHEN** the backend call fails
- **THEN** the user sees an error message and can retry

### Requirement: Configurable Endpoints
The system SHALL read the API base URL from `VITE_API_BASE_URL` and the Maps key from
`VITE_GOOGLE_MAPS_API_KEY`, with no secrets hard-coded.

#### Scenario: Environment configuration is honored
- **WHEN** the app is built with both env vars set
- **THEN** it calls the configured API base URL and loads Google Maps with the configured key

### Requirement: Automated Frontend Tests
The system SHALL include automated tests (Vitest + React Testing Library) covering the API
client request/response contract, carrier list rendering, the search interaction's
loading/results/error states, and the fastest-3-route selection logic. Google Maps SDK calls
SHALL be mocked so the tests run without a Maps key or network access. The tests SHALL live in
`frontend/tests/` (separate from `src/`), mirroring the backend's `backend/tests/` layout.

#### Scenario: API client contract is covered
- **WHEN** the test suite runs
- **THEN** a test asserts the client POSTs `from_city`/`to_city` to `${VITE_API_BASE_URL}/api/search` and surfaces a non-OK response as an error

#### Scenario: Search states are covered
- **WHEN** the test suite runs
- **THEN** a test drives a search with a mocked API and asserts the loading indicator, the rendered carriers, and the error message on failure

#### Scenario: Route selection is covered
- **WHEN** the test suite runs
- **THEN** a test asserts that the 3 fastest routes are chosen, ordered fastest first, and that fewer than 3 alternatives are all retained

