# Safe Streets Halton

A dashboard that maps road safety incidents reported by the Halton Regional Police Service, so residents can see where and what kind of incidents happen across Halton Region.

## Language

### Incidents

**Incident**:
A road safety incident reported by the Halton Regional Police Service (HRPS) and shown on the map.
_Avoid_: Event, call, report

**Case number**:
The police identifier for an incident. People use it to look up one incident directly.
_Avoid_: Case ID, file number

**Incident type**:
What kind of incident it was, using the description HRPS gives it. The dashboard shows friendly names such as Injury, Fatality, Hit & Run, Impaired Driving, Dangerous Operation of Vehicle, Roadside Test and Bicycle Theft.
_Avoid_: Category, incident code (in the interface)

**Incident group**:
A family of related incident types that share a badge colour on the map. The three groups are collision (Fatality, Injury, Hit & Run), driver behaviour (Dangerous Operation of Vehicle, Impaired Driving, Roadside Test) and property (Bicycle Theft). Each type within a group has its own badge shape.
_Avoid_: Category

**Severity**:
The order in which incident types are ranked, most serious first: Fatality, Injury, Hit & Run, Dangerous Operation of Vehicle, Impaired Driving, Roadside Test, Bicycle Theft. It decides which badge a location shows.

### Places

**Municipality**:
One of Halton's municipalities: Burlington, Oakville, Milton or Halton Hills. Police data also names the communities of Georgetown and Acton, which are part of Halton Hills. The interface says "Municipality"; "town" means the same thing.
_Avoid_: City, town (in the interface)

**Intersection**:
A place where two or more streets meet. Incidents are matched to the nearest intersection.
_Avoid_: Junction, corner

**Location**:
A place on the map that holds all the incidents matched to one intersection. Every location is approximate, because police report incidents near an intersection, not exactly at it. Locations are listed busiest first. An incident that can't be matched to an intersection shows as "Unknown location".
_Avoid_: Site, spot

### Map

**Marker**:
The badge on the map for one location. It shows the badge of the most serious incident type there.
_Avoid_: Pin

**Cluster**:
A round, orange marker that stands in for several nearby markers when zoomed out. It shows the total number of incidents it holds, and gets deeper in colour as that number grows.
_Avoid_: Group, bubble

**Selected location**:
The location the user has opened, shown with a ring around its marker. Its incidents appear in a card, one at a time.

### Searching

**Filter**:
A choice that narrows which incidents are shown: start date, end date, municipality and incident type.

**Search**:
Asking for incidents that match the date range and municipalities. Choosing incident types then narrows those results without a new search.

**Case lookup**:
Finding a single incident by its case number.
