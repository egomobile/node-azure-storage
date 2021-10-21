[![npm](https://img.shields.io/npm/v/@egomobile/azure-storage.svg)](https://www.npmjs.com/package/@egomobile/azure-storage)
[![last build](https://img.shields.io/github/workflow/status/egomobile/node-azure-storage/Publish)](https://github.com/egomobile/node-azure-storage/actions?query=workflow%3APublish)
[![PRs Welcome](https://img.shields.io/badge/PRs-welcome-brightgreen.svg?style=flat-square)](https://github.com/egomobile/node-azure-storage/pulls)

# @egomobile/azure-storage

> Classes and tools, that help connecting to Azure Storag(s), written in [TypeScript](https://www.typescriptlang.org/).

## Install

Execute the following command from your project folder, where your `package.json` file is stored:

```bash
npm install --save @egomobile/azure-storage
```

## Usage

```typescript
import {
  getBlobServiceClient,
  getContainerClient,
} from "@egomobile/azure-storage";

// setup the following environment variables:
//
// - AZURE_STORAGE_CONNECTION_1_NAME=my-connection
// - AZURE_STORAGE_CONNECTION_1_CONTAINER=my_container
// - AZURE_STORAGE_CONNECTION_1_URL=<YOUR-CONNECTION-URL>

// get clients of 'my-connection'
const blobClient = getBlobServiceClient("my-connection");
const containerClient = getContainerClient("my-connection");
```

## Documentation

The API documentation can be found [here](https://egomobile.github.io/node-azure-storage/).
