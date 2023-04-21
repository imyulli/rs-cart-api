import { Controller, Get, Request, Post, UseGuards, HttpStatus, Header } from '@nestjs/common';
import { LocalAuthGuard, AuthService, JwtAuthGuard, BasicAuthGuard } from './auth';

@Controller()
export class AppController {

  constructor(private authService: AuthService) {}

  @Get([ '', 'ping' ])
  
  @Header("Access-Control-Allow-Origin", "*")
  @Header("Access-Control-Request-Method", "*")
  @Header("Access-Control-Allow-Headers", "*")
  healthCheck(): any {
    return {
      statusCode: HttpStatus.OK,
      message: 'OK',
    };
  }

  @UseGuards(LocalAuthGuard)
  @Post('api/auth/login')
  async login(@Request() req) {
    const token = this.authService.login(req.user, 'basic');

    return  {
      statusCode: HttpStatus.OK,
      message: 'OK',
      data: {
        ...token,
      },
    };
  }

  @UseGuards(BasicAuthGuard)
  @Get('api/profile')
  @Header("Access-Control-Allow-Origin", "*")
  @Header("Access-Control-Request-Method", "*")
  @Header("Access-Control-Allow-Headers", "*")
  async getProfile(@Request() req) {
    return {
      statusCode: HttpStatus.OK,
      message: 'OK',
      data: {
        user: req.user,
      },
    };
  }
}
