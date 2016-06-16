#!/bin/bash

set -e

run_it()
{

  echo "Starting flowstudio"

  if [ ! -z "${FLOW}" ]; then
    exec /usr/bin/node-red -v --settings /flowstudio/runner-settings.js
  else
    exec /usr/bin/node-red -v --settings /flowstudio/admin-settings.js
  fi
}

while [ -z "${MY_HOST}" ]; do
    export MY_HOST=$(curl -s http://rancher-metadata/latest/self/container/primary_ip)
    sleep 1
done

if [ ! -z "${CSC_DEBUG}" ]; then
  printenv
  while [ true ]; do
      sleep 100
  done
fi

cd /flowstudio
npm link
cd /usr/lib/node_modules/node-red
npm link flowstudio-contrib-csc-nodes

run_it
