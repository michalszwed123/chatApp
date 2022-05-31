import { UnauthorizedException } from "@nestjs/common";
import { AuthGuard } from "@nestjs/passport";

export class RtGuard extends AuthGuard('jwt-refresh') {
    constructor() {
        super();
    }

    handleRequest(err, user) {
      
        if (err || !user) {
          throw err || new UnauthorizedException();
        }
        return user;
      }
}
