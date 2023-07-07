# jit
Jira In Tables

# Setup

## Define Environment Variables

Create an script to set environment variables, and replace them with your information

```sh
mkdir -p bin/dev
touch bin/dev/env.sh
echo "export URL="https://{myserver}.atlassian.net"
export EMAIL="{email}"
export TOKEN="{token}"
export BOARD_ID={boardid}" > bin/dev/env.sh
chmod +x bin/dev/env.sh
```

**Remember:** Source your environment variables before running scripts

```sh
. bin/dev/env.sh
```

## Install Dependencies

```sh
npm i
```

## Run Scripts

```sh
. bin/dev/env.sh && node myScript.js
```