# Safe Streets Dashboard
This dashboard uses data from the Halton Regional Police Services to display stats and maps of traffic-related incidents in Halton Region. 
![screenshot of dashboard website](screenshot_1.png)

## Why this dashboard?
The [existing dashboard](https://experience.arcgis.com/experience/e2d6a32212ba438da4144ea42dfccaf9) for the Halton Regional Police is limited to the past 365 days, data prior to that is deleted.
By keeping records locally, we are able to perform long-term time-series analysis that currently isn't facilitated. The dashboard aims to make understanding safety issues simpler, and raising awareness of the issue in Halton as well as solutions. 

## How it works
1. A python pipeline reads data from the [ArcGIS REST API](https://developers.arcgis.com/rest/) once-a-day and puts it into a MySQL server.
2. The data from MySQL is served to the webpage via Node ExpressJS.
3. The NextJS React web application makes requests to the NodeJS backend, and displays them on a map using [Plotly](https://plotly.com/javascript/react/) and [Leaflet](https://leafletjs.com/). 