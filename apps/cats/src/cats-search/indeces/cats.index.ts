import { IndicesCreateRequest } from '@elastic/elasticsearch/lib/api/types';

export const catsIndex: IndicesCreateRequest = {
  index: 'cats-v1',
  mappings: {
    dynamic: 'strict',
    properties: {
      created_at: { type: 'date' },
      name: { type: 'text', analyzer: 'english' },
      age: { type: 'integer' },
      gender: { type: 'keyword' },
      colors: { type: 'text', analyzer: 'english' },
    },
  },
};
