// This file is part of the @egomobile/azure-storage distribution.
// Copyright (c) Next.e.GO Mobile SE, Aachen, Germany (https://e-go-mobile.com/)
//
// @egomobile/azure-storage is free software: you can redistribute it and/or modify
// it under the terms of the GNU Lesser General Public License as
// published by the Free Software Foundation, version 3.
//
// @egomobile/azure-storage is distributed in the hope that it will be useful, but
// WITHOUT ANY WARRANTY; without even the implied warranty of
// MERCHANTABILITY or FITNESS FOR A PARTICULAR PURPOSE. See the GNU
// Lesser General Public License for more details.
//
// You should have received a copy of the GNU Lesser General Public License
// along with this program. If not, see <http://www.gnu.org/licenses/>.

import { BlobServiceClient, ContainerClient } from '@azure/storage-blob';
import type { Nilable } from './types';

/**
 * Provides a blob service client by name.
 *
 * @param {string} name The connection name.
 *
 * @returns {BlobServiceClient} The client.
 */
export type BlobServiceClientProvider = (name: string) => BlobServiceClient;

/**
 * Provides a container service client by name.
 *
 * @param {string} name Theconnection  name.
 * @param {Nilable<string>} [container] The custom container name.
 *
 * @returns {ContainerClient} The client.
 */
export type ContainerClientProvider = (name: string, container?: Nilable<string>) => ContainerClient;

/**
 * A function, that returns the options for getting a blob storage client by name.
 *
 * @param {string} name The connection name.
 *
 * @returns {IBlobStorageClientOptions} The options.
 */
export type GetBlobStorageClientOptions = (name: string) => IBlobStorageClientOptions;

/**
 * A function, that returns the options for getting a container client by name.
 *
 * @param {string} name The connection name.
 * @param {Nilable<string>} [container] The custom container name.
 *
 * @returns {IBlobStorageClientOptions} The options.
 */
export type GetContainerClientOptions = (name: string, container?: Nilable<string>) => IContainerClientOptions;

/**
 * Options for a blob storage client.
 */
export interface IBlobStorageClientOptions {
    /**
     * The connection URL.
     */
    url: string;
}

/**
 * Options for a conatiner client.
 */
export interface IContainerClientOptions extends IBlobStorageClientOptions {
    /**
     * The container name.
     */
    container: string;
}

/**
 * Default function, that returns the options for getting a blob storage client by name.
 *
 * The variables must have the following structure:
 *
 * - AZURE_STORAGE_CONNECTION_{NR} => the name of the connection
 * - AZURE_STORAGE_CONNECTION_{NR}_URL => the connection URL
 *
 * @param {string} name The connection name.
 *
 * @returns {IBlobStorageClientOptions} The options.
 */
export const defaultGetBlobStorageClientOptions: GetBlobStorageClientOptions = (name): IBlobStorageClientOptions => {
    const connectionNr = getAzureStorageConnectionNrFromEnvVar(name);

    const url = process.env[`AZURE_STORAGE_CONNECTION_${connectionNr}_URL`]?.trim();
    if (!url?.length) {
        throw new Error(`Azure storage connection ${name} not found`);
    }

    return {
        url
    };
};

/**
 * Default function, that returns the options for getting a container client by name.
 *
 * The variables must have the following structure:
 *
 * - AZURE_STORAGE_CONNECTION_{NR} => the name of the connection
 * - AZURE_STORAGE_CONNECTION_{NR}_CONTAINER => the default container name
 * - AZURE_STORAGE_CONNECTION_{NR}_URL => the connection URL
 *
 * @param {string} name The connection name.
 * @param {Nilable<string>} [container] The custom container name.
 *
 * @returns {IContainerClientOptions} The options.
 */
export const defaultGetContainerClientOptions: GetContainerClientOptions = (name, container?): IContainerClientOptions => {
    const connectionNr = getAzureStorageConnectionNrFromEnvVar(name);

    const storageOpts = defaultGetBlobStorageClientOptions(name);

    container = container?.trim();
    if (!container?.length) {
        container = process.env[`AZURE_STORAGE_CONNECTION_${connectionNr}_CONTAINER`]?.trim();
    }

    if (!container?.length) {
        throw new Error('No container defined');
    }

    return {
        ...storageOpts,
        container
    };
};

/**
 * Creates a new factory function, that provides a blob storage client by name.
 *
 * @example
 * ```
 * import { createGetBlobServiceClientFactory } from '@egomobile/azure-storage'
 *
 * // create factory function
 * const getClient = createGetBlobServiceClientFactory(() => {
 *   url: '<YOUR-CONNECTION-URL>'
 * });
 *
 * // now get client from factory
 * const client = getClient()
 * ```
 *
 * @param {GetBlobStorageClientOptions|IBlobStorageClientOptions} [optionsOrFunc] The custom options or function that provide them.
 *
 * @returns {BlobServiceClientProvider} The new factory function.
 */
export function createGetBlobServiceClientFactory(optionsOrFunc: GetBlobStorageClientOptions | IBlobStorageClientOptions = defaultGetBlobStorageClientOptions): BlobServiceClientProvider {
    let getOptions: GetBlobStorageClientOptions;
    if (typeof optionsOrFunc === 'function') {
        getOptions = optionsOrFunc;
    } else {
        getOptions = () => optionsOrFunc;
    }

    if (typeof getOptions !== 'function') {
        throw new TypeError('optionsOrFunc must be a function or object');
    }

    return (name) => {
        const { url } = getOptions(name);

        return BlobServiceClient.fromConnectionString(url);
    };
}

/**
 * Creates a new factory function, that provides a container client by name and container name.
 *
 * @example
 * ```
 * import { createGetContainerClientFactory } from '@egomobile/azure-storage'
 *
 * // create factory function
 * const getClient = createGetContainerClientFactory(() => {
 *   url: '<YOUR-CONNECTION-URL>',
 *   container: 'my-container'
 * });
 *
 * // now get client from factory
 * const client = getClient()
 * ```
 *
 * @param {GetContainerClientOptions|IContainerClientOptions} [optionsOrFunc] The custom options or function that provide them.
 *
 * @returns {ContainerClientProvider} The new factory function.
 */
export function createGetContainerClientFactory(optionsOrFunc: GetContainerClientOptions | IContainerClientOptions = defaultGetContainerClientOptions): ContainerClientProvider {
    let getOptions: GetContainerClientOptions;
    if (typeof optionsOrFunc === 'function') {
        getOptions = optionsOrFunc;
    } else {
        getOptions = () => optionsOrFunc;
    }

    if (typeof getOptions !== 'function') {
        throw new TypeError('optionsOrFunc must be a function or object');
    }

    return (name, customerContainer?) => {
        const { container, url } = getOptions(name, customerContainer);

        return BlobServiceClient.fromConnectionString(url)
            .getContainerClient(container);
    };
}

/**
 * Returns the a blob storage client, that is using environment variables
 * to setup the client.
 *
 * @example
 * ```
 * import { getBlobServiceClient } from '@egomobile/azure-storage'
 *
 * // setup the following environment variables:
 * //
 * // - AZURE_STORAGE_CONNECTION_1=my-connection
 * // - AZURE_STORAGE_CONNECTION_1_CONTAINER=my_container
 * // - AZURE_STORAGE_CONNECTION_1_URL=<YOUR-CONNECTION-URL>
 *
 * const client = getBlobServiceClient('my-connection')
 * ```
 *
 * The variables must have the following structure:
 *
 * - AZURE_STORAGE_CONNECTION_{NR} => the name of the connection
 * - AZURE_STORAGE_CONNECTION_{NR}_URL => the connection URL
 */
export const getBlobServiceClient = createGetBlobServiceClientFactory(defaultGetBlobStorageClientOptions);

/**
 * Returns the a container client, that is using environment variables
 * to setup the client.
 *
 * @example
 * ```
 * import { getContainerClient } from '@egomobile/azure-storage'
 *
 * // setup the following environment variables:
 * //
 * // - AZURE_STORAGE_CONNECTION_1=my-connection
 * // - AZURE_STORAGE_CONNECTION_1_CONTAINER=my_container
 * // - AZURE_STORAGE_CONNECTION_1_URL=<YOUR-CONNECTION-URL>
 *
 * const client = getContainerClient('my-connection')
 * ```
 *
 * The variables must have the following structure:
 *
 * - AZURE_STORAGE_CONNECTION_{NR} => the name of the connection
 * - AZURE_STORAGE_CONNECTION_{NR}_CONTAINER => the default container name
 * - AZURE_STORAGE_CONNECTION_{NR}_URL => the connection URL
 */
export const getContainerClient = createGetContainerClientFactory(defaultGetContainerClientOptions);

function getAzureStorageConnectionNrFromEnvVar(name: string): number {
    const r = /^(AZURE_STORAGE_CONNECTION_)(\d+)$/;

    const connectionNr = parseInt(
        Object.keys(process.env)
            .filter(k => r.test(k))  // take all vars with name of format MONGO_CONNECTION_<NR>
            .filter(k => process.env[k]?.trim() === name)  // take with value of 'name'
            .map(k => k.split('_')[3])[0]  // take the <NR> part
    );
    if (isNaN(connectionNr)) {
        throw new Error(`No azure storage connection ${name} found or defined`);
    }

    return connectionNr;
}
