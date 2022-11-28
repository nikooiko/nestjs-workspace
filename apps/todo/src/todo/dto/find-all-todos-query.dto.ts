import { LimitParam } from '@app/core/pagination/decorators/limit-param.decorator';
import { PageParam } from '@app/core/pagination/decorators/page-param.decorator';

export class FindAllTodosQueryDto {
  @LimitParam({ default: 10 })
  readonly limit: number = 10;

  @PageParam({ default: 0 })
  readonly page: number = 0;
}
