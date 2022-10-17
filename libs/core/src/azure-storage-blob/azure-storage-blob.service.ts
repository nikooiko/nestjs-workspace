import { Inject, Injectable } from '@nestjs/common';
import { ConfigType } from '@nestjs/config';
import { BlobServiceClient } from '@azure/storage-blob';
import { ClientSecretCredential, TokenCredential } from '@azure/identity';
import azureStorageBlobConfig from './config/azure-storage-blob.config';
import { BlobOptions } from './interfaces/blob-options.interface';

@Injectable()
export class AzureStorageBlobService {
  constructor(
    @Inject(azureStorageBlobConfig.KEY)
    public readonly config: ConfigType<typeof azureStorageBlobConfig>,
  ) {}

  /**
   * Uploads the requested file (url) to the target blob (options).
   * @param {string} url The target location
   * @param {Buffer} data The file data
   * @param {BlobOptions} options The target blob
   * @returns {Promise<string>} The final url of the file
   */
  async upload(
    url: string,
    data: Buffer,
    options: BlobOptions,
  ): Promise<string> {
    const blockBlobClient = this.createBlockBlobClient(url, options);
    await blockBlobClient.uploadData(data);
    return blockBlobClient.url;
  }

  /**
   * Creates a new client secret credentials based on config.
   * @private
   * @returns {TokenCredential}
   */
  private createCredential(): TokenCredential {
    const { tenantId, clientId, clientSecret } = this.config;
    return new ClientSecretCredential(tenantId, clientId, clientSecret);
  }

  /**
   * Creates a block blob client with the provided url and options.
   * @private
   * @param {string} url The target location
   * @param {BlobOptions} options The target blob options
   * @returns {BlobOptions}
   */
  private createBlockBlobClient(
    url: string,
    { blobEndpoint, containerName }: BlobOptions,
  ) {
    const credential = this.createCredential();
    const blobServiceClient = new BlobServiceClient(blobEndpoint, credential);
    const containerClient = blobServiceClient.getContainerClient(containerName);
    return containerClient.getBlockBlobClient(url);
  }
}
