#!/usr/bin/env bash

./index.js >> service-points-all.ndjson
# TODO: remove query with jq
cat service-points-all.ndjson | sort | uniq > service-points.ndjson
