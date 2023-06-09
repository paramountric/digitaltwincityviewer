#!/bin/bash
# the reason for this file is to read env vars in runtime which comes from k8s configmap
# for next.js otherwise the env vars comes from .env.production file, etc but we cannot set values there dynamically
# no verbose
set +x
# config
envFilename='./projects/dte-digital-twin-energy/.env.production'
nextFolder='./projects/dte-digital-twin-energy/.next/'
function apply_path {
  # read all config file  
  while read line; do
    echo "Process line: ${line}"
    # no comment or not empty
    if [ "${line:0:1}" == "#" ] || [ "${line}" == "" ]; then
      continue
    fi
    
    # split
    configName="$(cut -d'=' -f1 <<<"$line")"
    configValue="$(cut -d'=' -f2 <<<"$line")"
    # get system env
    envValue=$(env | grep "^$configName=" | grep -oe '[^=]*$');
    
    # if config found
    if [ -n "$configValue" ] && [ -n "$envValue" ]; then
      # replace all
      echo "Replace: ${configValue} with: ${envValue}"
      find $nextFolder \( -type d -name .git -prune \) -o -type f -print0 | xargs -0 sed -i "s#$configValue#$envValue#g"
    fi
  done < $envFilename
}
apply_path
echo "Starting Nextjs"
exec "$@"