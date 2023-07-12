# jit
Jira In Tables

# Setup

## Define Environment Variables

Create an script to set environment variables, and replace them with your information

```sh
mkdir -p bin/dev
echo 'export URL="https://{myserver}.atlassian.net"
export EMAIL="{email}"
export TOKEN="{token}"
export BOARD_ID={boardid}
export AWS_ACCESS_KEY_ID="{accesskey}"
export AWS_SECRET_ACCESS_KEY="{secret}"
export AWS_BUCKET_NAME="{bucketname}' > bin/dev/env.sh
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

> Note: create the `csv` folder for scripts that output csv files

```sh
. bin/dev/env.sh && node myScript.js
```