import { Test, TestingModule } from '@nestjs/testing';
import {
  CanActivate,
  Controller,
  ExecutionContext,
  Get,
  HttpCode,
  INestApplication,
  Injectable,
  Post,
  Req,
  Res,
  UseGuards,
} from '@nestjs/common';
import request from 'supertest';
import { SecurityModule } from '../security.module';
import { CsrfService } from '../services/csrf.service';
import { CsrfGuard } from './csrf.guard';
import { Request, Response } from 'express';
import { Observable } from 'rxjs';
import { CookieAccessInfo } from 'cookiejar';

@Injectable()
export class TestAuthGuard implements CanActivate {
  canActivate(
    context: ExecutionContext,
  ): boolean | Promise<boolean> | Observable<boolean> {
    const req = context.switchToHttp().getRequest();
    // a test guard that simply enables csrf and sets the csrfId for later use
    req.csrfId = 'test-session-id';
    return true;
  }
}

// Test Controller
@Controller('/')
class TestController {
  constructor(private readonly csrf: CsrfService) {}

  @Post('login')
  login(@Req() req: Request, @Res({ passthrough: true }) res: Response) {
    req.csrfId = req.body.csrfId; // expects a csrfId in the body for demo purposes.
    // csrfId is needed to enable csrf protection
    this.csrf.generate(req, res);
    return { route: 'login' };
  }

  @Get('unprotected')
  unprotected() {
    return { route: 'unprotected' };
  }

  @Post('protected')
  @HttpCode(200)
  @UseGuards(TestAuthGuard, CsrfGuard)
  protected() {
    return { route: 'protected' };
  }
}

describe('Security', () => {
  let app: INestApplication;

  beforeAll(async () => {
    const moduleFixture: TestingModule = await Test.createTestingModule({
      imports: [SecurityModule],
      controllers: [TestController],
    }).compile();

    app = moduleFixture.createNestApplication();
    await app.init();
  });

  describe('CSRF', () => {
    it('should do nothing for unprotected routes', async () => {
      await request(app.getHttpServer())
        .get('/unprotected')
        .expect(200)
        .expect({
          route: 'unprotected',
        });
    });
    it('should fail with 403 for protected routes without CSRF', async () => {
      await request(app.getHttpServer())
        .post('/protected')
        .send({})
        .expect(403)
        .expect({
          statusCode: 403,
          message: 'Forbidden',
          error: 'forbidden',
        });
    });
    it('should fail with 403 for protected routes with invalid CSRF', async () => {
      const agent = request.agent(app.getHttpServer());
      await agent
        .post('/login')
        .send({
          csrfId: 'test-session-id',
        })
        .expect(201);
      const csrfToken = 'invalid-csrf-token';
      await agent
        .post('/protected')
        .set('x-csrf-token', csrfToken)
        .send({})
        .expect(403);
    });
    it('should fail with 403 for protected routes with CSRF of another session', async () => {
      const agent = request.agent(app.getHttpServer());
      await agent
        .post('/login')
        .send({
          csrfId: 'different-test-session-id',
        })
        .expect(201);
      const csrfToken =
        agent.jar.getCookie('x-csrf-token-client', CookieAccessInfo.All)
          ?.value || '';
      await agent
        .post('/protected')
        .set('x-csrf-token', csrfToken)
        .send({})
        .expect(403);
    });
    it('should proceed with 200 for protected routes with valid CSRF', async () => {
      const agent = request.agent(app.getHttpServer());
      await agent
        .post('/login')
        .send({
          csrfId: 'test-session-id',
        })
        .expect(201);
      const csrfToken =
        agent.jar.getCookie('x-csrf-token-client', CookieAccessInfo.All)
          ?.value || '';
      await agent
        .post('/protected')
        .set('x-csrf-token', csrfToken)
        .send({})
        .expect(200);
    });
  });

  afterAll(async () => {
    await app.close();
  });
});
