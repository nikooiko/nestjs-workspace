import { Inject, Module, OnApplicationBootstrap } from '@nestjs/common';
import { ElasticModule } from '@app/core/elastic/elastic.module';
import { LOGGER } from '@app/core/logger/factories/logger.factory';
import { Logger } from 'winston';
import { ElasticSearchService } from '@app/core/elastic/services/elastic-search.service';
import { catsIndex } from './indeces/cats.index';

const cats = [
  {
    created_at: new Date('2024-05-01T16:14:50.000Z'),
    name: 'Skadi',
    age: 1,
    gender: 'female',
    colors: ['silver'],
  },
  {
    created_at: new Date('2024-05-02T16:14:50.000Z'),
    name: 'Thor',
    age: 2,
    gender: 'male',
    colors: ['golden'],
  },
  {
    created_at: new Date('2024-05-03T16:14:50.000Z'),
    name: 'Odin',
    age: 10,
    gender: 'male',
    colors: ['white', 'golden'],
  },
  {
    created_at: new Date('2024-05-04T16:14:50.000Z'),
    name: 'Loki',
    age: 1,
    gender: 'male',
    colors: ['green', 'black'],
  },
  {
    created_at: new Date('2024-05-05T16:14:50.000Z'),
    name: 'Frigg',
    age: 8,
    gender: 'female',
    colors: ['golden'],
  },
  {
    created_at: new Date('2024-05-06T16:14:50.000Z'),
    name: 'Freyja',
    age: 4,
    gender: 'female',
    colors: ['pink', 'golden'],
  },
];

@Module({
  imports: [ElasticModule],
})
export class CatsSearchModule implements OnApplicationBootstrap {
  constructor(
    @Inject(LOGGER) private logger: Logger,
    private es: ElasticSearchService,
  ) {}

  async onApplicationBootstrap() {
    await this.es.checkOrCreateIndex(catsIndex); // always resolves
    await this.es.upsertDoc(catsIndex.index, {
      id: cats[0].name,
      document: cats[0],
    });
    await this.es.deleteDoc(catsIndex.index, cats[0].name);
    await this.es.upsertDocBulk(
      catsIndex.index,
      cats.map((c) => ({ id: c.name, document: c })),
    );
    await this.es.deleteDocBulk(
      catsIndex.index,
      cats.map((c) => c.name),
    );
    await this.es.upsertDocBulk(
      catsIndex.index,
      cats.map((c) => ({ id: c.name, document: c })),
    );
    this.logger.info('Cats bootstrap success!', {
      type: 'CATS_BOOTSTRAP',
    });
  }
}
