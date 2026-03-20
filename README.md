# **Weather Prediction Dashboard**

Weather Prediction Dashboard is a frontend only webui for displaying relevant data required to make informed trades on climate prediction markets

It currently only supports two cities, but does support the addition of new cities in src/config/cities.ts

Brief list of what is displayed

1. NWP forecasts
    * EGLC: ECMWF, GFS, ICON, UKMO | CYYZ: ECMWF, GFS, ICON, GEM

2. Ensemble forecast based on the NWP forecasts listed above

3. Live and historic METAR reports (historical chart visualization to show the metar reports for the last 24 hours)
    * Stations: EGLC, EGLL, EGKB, EGWU | CYYZ, CYOO

4. Active TAF/SPECI aviaton reports

5. Primary station display including current METAR reported temp, daily high reported METAR temp, ensemble Tmax for the day and a signal to inform whether or not the Tmax was respected

6. 7 Day forecast chart
    * Displays: min/max temp, precipitation amount, cloud coverage % and wind min/max speed in km/h

7. Theme & timezone picker
    * Supports: EST or the city local time | Nord, Catppuccin, Gruvbox, Tokyo Night, Monokai, Ayu Dark, Min and claude code dark

Frontend is done in react and typescript, vite is used for building and tailwind for the styling. 

Supports local hosting over wifi available to all local devices. 

build & run via npm run build and npm run dev (MUST use dev)



https://github.com/user-attachments/assets/b74f5a43-b3b0-4e01-9149-76a9b703674e

