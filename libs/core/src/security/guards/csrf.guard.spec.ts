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
    const sessionId = req.cookies['sessionId'];
    if (!sessionId) {
      return false;
    }
    // a test guard that simply enables csrf and sets the csrfId for later use
    req.csrfId = sessionId;
    return true;
  }
}

// Test Controller
@Controller('/')
class TestController {
  constructor(private readonly csrf: CsrfService) {}

  @Post('login')
  @HttpCode(204)
  login(@Req() req: Request, @Res({ passthrough: true }) res: Response) {
    // expects a sessionId (used as CSRF session ID also) in the body for demo purposes.
    const sessionId = req.body.sessionId;
    res.cookie('sessionId', sessionId); // attaches it to the req, to create the "session"
    req.csrfId = sessionId; // this is needed by CSRF token generator
    this.csrf.generate(req, res); // creates CSRF token and attaches it to cookies, enables CSRF protection
  }

  @Get('unprotected')
  @HttpCode(204)
  unprotected() {
    return;
  }

  @Post('protected')
  @HttpCode(204)
  @UseGuards(TestAuthGuard, CsrfGuard)
  protected() {
    return;
  }

  @Post('logout')
  @HttpCode(204)
  logout(@Req() req: Request, @Res({ passthrough: true }) res: Response) {
    this.csrf.destroy(req, res);
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
      await request(app.getHttpServer()).get('/unprotected').expect(204);
    });
    it('should fail with 403 for protected routes without CSRF', async () => {
      await request(app.getHttpServer())
        .post('/protected')
        .send({})
        .expect(403);
    });
    it('should fail with 403 for protected routes with invalid CSRF', async () => {
      const agent = request.agent(app.getHttpServer());
      await agent
        .post('/login')
        .send({
          sessionId: 'test-session-id',
        })
        .expect(204);
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
          sessionId: 'test-session-id',
        })
        .expect(204);
      agent.jar.setCookie('sessionId=different-session-id', '127.0.0.1'); // alter session id to emulate different session
      await agent
        .post('/protected')
        .set(
          'x-csrf-token',
          agent.jar.getCookie('x-csrf-token-client', CookieAccessInfo.All)
            ?.value || '',
        )
        .send({})
        .expect(403);
    });
    it('should proceed with 204 for protected routes with valid CSRF', async () => {
      const agent = request.agent(app.getHttpServer());
      await agent
        .post('/login')
        .send({
          sessionId: 'test-session-id',
        })
        .expect(204);
      await agent
        .post('/protected')
        .set(
          'x-csrf-token',
          agent.jar.getCookie('x-csrf-token-client', CookieAccessInfo.All)
            ?.value || '',
        )
        .send({})
        .expect(204);
    });
    it('should fail with 403 for protected routes after logout', async () => {
      const agent = request.agent(app.getHttpServer());
      await agent
        .post('/login')
        .send({
          sessionId: 'test-session-id',
        })
        .expect(204);
      await agent
        .post('/protected')
        .set(
          'x-csrf-token',
          agent.jar.getCookie('x-csrf-token-client', CookieAccessInfo.All)
            ?.value || '',
        )
        .send({})
        .expect(204);
      await agent.post('/logout').send().expect(204);
      await agent
        .post('/protected')
        .set(
          'x-csrf-token',
          agent.jar.getCookie('x-csrf-token-client', CookieAccessInfo.All)
            ?.value || '',
        )
        .send({})
        .expect(403);
    });
  });

  afterAll(async () => {
    await app.close();
  });
});
