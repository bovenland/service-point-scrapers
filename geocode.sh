#!/usr/bin/env bash

cat service-points.ndjson | sort | uniq | ./geocode.js > service-points-geocoded.ndjson
../ndjson-to-geojson/ndjson-to-geojson.js < service-points-geocoded.ndjson > service-points.geojson
