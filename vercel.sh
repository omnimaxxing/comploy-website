#!/bin/bash

if [[ $VERCEL_ENV == "production" ]] ; then 
  # For production, run the normal build command
  pnpm prod 
else 
  # For preview environments, run dev:prod but skip migrations
  cross-env PAYLOAD_SKIP_MIGRATIONS=true pnpm prod
fi 