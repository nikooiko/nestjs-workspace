import { registerAs } from '@nestjs/config';

export const AZURE_STORAGE_BLOB = 'azure-storage-blob';

export default registerAs(AZURE_STORAGE_BLOB, () => ({
  tenantId: process.env.AZURE_TENANT_ID || '',
  clientId: process.env.AZURE_CLIENT_ID || '',
  clientSecret: process.env.AZURE_CLIENT_SECRET || '',
  blobs: {
    default: {
      accountName: process.env.AZ_BLOB_DEFAULT_ACCOUNT_NAME || '',
      blobEndpoint: process.env.AZ_BLOB_DEFAULT_ENDPOINT || '',
      containerName: process.env.AZ_BLOB_DEFAULT_CONTAINER_NAME || '',
    },
  },
}));
