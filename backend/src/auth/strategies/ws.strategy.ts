import { PassportStrategy } from "@nestjs/passport";
import { ExtractJwt, Strategy } from "passport-jwt";
import { Injectable } from "@nestjs/common";
import { JwtPayload } from "../types";

@Injectable()
export class WsStrategy extends PassportStrategy(Strategy, 'wsjwt') {
    constructor() {
        super({
            jwtFromRequest: ExtractJwt.fromAuthHeaderAsBearerToken(),
            secretOrKey: process.env.AT_SECRET,
        })
    }

    validate(payload: JwtPayload): JwtPayload {     
        return payload
    }
}