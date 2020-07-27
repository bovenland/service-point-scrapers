#!/usr/bin/env bash

# ./geocode.js < service-points.ndjson > service-points-geocoded.ndjson
../ndjson-to-geojson/ndjson-to-geojson.js < service-points-geocoded.ndjson > service-points.geojson
