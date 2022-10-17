import { Module } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';
import { AzureStorageBlobService } from './azure-storage-blob.service';
import azureStorageBlobConfig from './config/azure-storage-blob.config';

@Module({
  imports: [ConfigModule.forFeature(azureStorageBlobConfig)],
  providers: [AzureStorageBlobService],
  exports: [AzureStorageBlobService],
})
export class AzureStorageBlobModule {}
