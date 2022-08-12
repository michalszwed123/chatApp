import { Injectable, CanActivate, ExecutionContext, UnauthorizedException } from '@nestjs/common';
import { AuthGuard } from '@nestjs/passport';
import { JwtService } from '@nestjs/jwt';
import { PrismaService } from 'src/prisma/prisma.service';
import { Observable } from 'rxjs';
import { WsException } from '@nestjs/websockets';


@Injectable()
export class WsGuard {
  constructor(
    private readonly prisma: PrismaService,
    private readonly jwtService: JwtService
  ) {
  }


  canActivate(context: ExecutionContext): boolean | Promise<boolean> {
    const request = context.switchToHttp().getRequest();

    const headers = context.switchToWs().getClient().request.headers
    console.log(headers.authorization);
    
    if(headers.authorization === undefined) throw new WsException('Unauthorized');

    const bearerToken = context.switchToWs().getClient().request.headers.authorization.split(' ')[1]

    try {
      const decode = this.jwtService.decode(bearerToken)
      request.user = decode
      
      //const user = await this.prisma.user.findUnique({ where: { id: decode.sub} })
      return new Promise(async (resolve, reject) => {
        return await this.prisma.user.findUnique({ where: { id: decode.sub } }).then(user => {
          if (user) {
            resolve(true)
          } else {
            reject(false)
          }
        }).catch(err => {
          return false
        })
      })

    } catch (ex) {
      console.log(ex)
      return false
    }
  }

  handleRequest(err, user) {

    if (err || !user) {
      throw err || new UnauthorizedException();
    }
    return user;
  }





  // async getRequest(context: ExecutionContext) {
  //   const headers = context.switchToWs().getClient().request.headers
  //   const token = headers.authorization
  //   console.log(token);

  // }
}
