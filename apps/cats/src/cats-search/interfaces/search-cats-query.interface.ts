import { SearchCatsOrderBy } from '../enums/search-cats-order-by.enum';
import { SearchCatsFacet } from '../enums/search-cats-facet.enum';

export interface SearchCatsQuery {
  // text match
  q?: string;
  // filters
  gender?: string[];
  colors?: string[];
  age?: { from: number; to: number };
  // facets
  facets?: SearchCatsFacet[];
  // pagination
  limit: number;
  page: number;
  count?: boolean; // if true, the total count of the results is calculated
  // sorting
  orderBy?: SearchCatsOrderBy;
}
