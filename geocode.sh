#!/usr/bin/env bash

cat service-points.ndjson | jq -c -M 'del(.query)' | sort | uniq | ./geocode.js > service-points-geocoded.ndjson
../ndjson-to-geojson/ndjson-to-geojson.js < service-points-geocoded.ndjson > service-points.geojson
