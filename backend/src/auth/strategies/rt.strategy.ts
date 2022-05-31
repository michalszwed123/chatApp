import { PassportStrategy } from "@nestjs/passport";
import { ExtractJwt, Strategy } from "passport-jwt";
import { ForbiddenException, Injectable } from "@nestjs/common";
import { Request } from "express";
import { JwtPayloadWithRt } from "../types";

@Injectable()
export class RtStrategy extends PassportStrategy(Strategy, 'jwt-refresh') {
    constructor() {
        super({
            jwtFromRequest: ExtractJwt.fromAuthHeaderAsBearerToken(),
            secretOrKey: process.env.RT_SECRET,
            passReqToCallback: true,
        })
    }

    validate(req: Request, payload: JwtPayloadWithRt): JwtPayloadWithRt {
        const refreshToken = req.get('authorization').replace('Bearer', '').trim();
        if (!refreshToken) throw new ForbiddenException('Refresh token violated');
        return {
            ...payload,
            refreshToken,
        };
    }
}