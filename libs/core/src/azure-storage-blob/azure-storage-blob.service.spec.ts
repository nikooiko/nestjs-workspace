import { Test, TestingModule } from '@nestjs/testing';
import { ConfigModule } from '@nestjs/config';
import { AzureStorageBlobService } from './azure-storage-blob.service';
import azureStorageBlobConfig from './config/azure-storage-blob.config';

describe('AzureStorageBlobService', () => {
  let service: AzureStorageBlobService;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      imports: [ConfigModule.forFeature(azureStorageBlobConfig)],
      providers: [AzureStorageBlobService],
    }).compile();

    service = module.get<AzureStorageBlobService>(AzureStorageBlobService);
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });
});
