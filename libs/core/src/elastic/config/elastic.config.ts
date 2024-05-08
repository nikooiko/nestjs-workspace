import { registerAs } from '@nestjs/config';
import { ClientOptions } from '@elastic/elasticsearch';

export const ELASTIC_CONFIG_KEY = 'elastic';

export default registerAs(
  ELASTIC_CONFIG_KEY,
  (): { elasticSearch: ClientOptions } => ({
    elasticSearch: {
      node: process.env.ELASTIC_NODE || 'https://localhost:9200',
      auth: {
        username: process.env.ELASTIC_USERNAME || 'elastic',
        password: process.env.ELASTIC_PASSWORD || 'elastic',
      },
      tls: {
        rejectUnauthorized: process.env.NODE_ENV === 'production',
      },
    },
  }),
);
