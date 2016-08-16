#!/bin/bash

# WORKDIR
cd /var/app

# Start NodeJS server
#forever -l forever.log -ao stdout.log -e stderr.log start server.js
node server.js
