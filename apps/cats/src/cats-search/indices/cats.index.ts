import { IndicesCreateRequest } from '@elastic/elasticsearch/lib/api/types';

export const catsIndex: IndicesCreateRequest = {
  index: 'cats-v1',
  mappings: {
    dynamic: 'strict',
    properties: {
      created_at: { type: 'date' },
      name: {
        type: 'text',
        analyzer: 'english',
        fields: { raw: { type: 'keyword' } },
      },
      age: { type: 'integer' },
      gender: { type: 'keyword' },
      colors: {
        type: 'text',
        analyzer: 'english',
        fields: { raw: { type: 'keyword' } },
      },
    },
  },
  settings: {
    index: {
      similarity: {
        default: {
          type: 'BM25',
          b: 0, // the size of the document doesn't affect the scoring
          k1: 0, // multiple matches of the same word don't affect the scoring
        },
      },
    },
  },
};
