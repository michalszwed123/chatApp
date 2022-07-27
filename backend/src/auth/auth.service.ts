import { ConflictException, ForbiddenException, Injectable } from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import { PrismaClientKnownRequestError } from '@prisma/client/runtime';
import { PrismaService } from 'src/prisma/prisma.service';
import { SignUpDto, SignInDto } from './dto';
import { hashData, verifyData } from './handlers';
import { Tokens } from './types';


@Injectable()
export class AuthService {
    constructor(
        private readonly jwtService: JwtService,
        private readonly prisma: PrismaService,
    ) {}

    async singUp(dto: SignUpDto): Promise<Tokens> {
        const { nick, password } = dto;
        const hashedPassword = await hashData(password)
        
        const user = await this.prisma.user.create({
            data: {
                nick,
                password: hashedPassword,
            }
        }).catch((err) => {
            if (err instanceof PrismaClientKnownRequestError) {
                if (err.code === 'P2002') {
                  throw new ConflictException('User with given nickname already exists');
                }
              }
            throw err;
        });
        const tokens = await this.generateTokens(user.id, nick)
        await this.updateRefreshToken(user.id, tokens.refresh_token)
        return tokens
    }

    async signIn(dto: SignInDto) {
        const { nick, password } = dto;
        const user = await this.prisma.user.findUnique({
            where: {
                nick
            }
        })
        if (!user) throw new ForbiddenException('Access Denied')
        const passwordMatches: boolean = await verifyData(user.password, password)
        if (!passwordMatches) throw new ForbiddenException('Invaild credentials')

        const tokens = await this.generateTokens(user.id, user.nick)
        await this.updateRefreshToken(user.id, tokens.refresh_token)
        return tokens
    }

    async refreshTokens(userId: string, rt: string): Promise<Tokens> {
        const user = await this.prisma.user.findUnique({
            where: {
                id: userId
            }
        })
        if (!user || !user.hashedRt) throw new ForbiddenException('Access Denied');
        const rtMatches: boolean = await verifyData(user.hashedRt, rt)
        if (!rtMatches) throw new ForbiddenException('Access Denied');

        const tokens = await this.generateTokens(user.id, user.nick)
        await this.updateRefreshToken(user.id, tokens.refresh_token)
        return tokens
    }

    async updateRefreshToken(userId: string, rt: string): Promise<void> {
        const hash = await hashData(rt)
        await this.prisma.user.update({
            where: {
                id: userId
            },
            data: {
                hashedRt: hash
            }
        })
    }

    async generateTokens(userId: string, nick: string): Promise<Tokens> {
        const [at, rt] = await Promise.all([
            this.jwtService.signAsync({
                sub: userId,
                nick
            }, {
                secret: process.env.AT_SECRET,
                expiresIn: 60 * 60
            }),
            this.jwtService.signAsync({
                sub: userId,
                nick
            }, {
                secret: process.env.RT_SECRET,
                expiresIn: 60 * 60 * 24 * 7
            })
        ])
        return { access_token: at, refresh_token: rt }
    }
}
