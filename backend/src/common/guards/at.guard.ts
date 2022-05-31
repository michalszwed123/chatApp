import { UnauthorizedException } from "@nestjs/common";
import { AuthGuard } from "@nestjs/passport";

export class AtGuard extends AuthGuard('jwt') {
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