import { ExtractJwt, Strategy } from 'passport-jwt';
import { Injectable } from '@nestjs/common';
import { PassportStrategy } from '@nestjs/passport';
import { AuthJwtPayloadType } from 'src/types/auth';
import { jwtConstants } from 'src/constants/secret';

@Injectable()
export class JwtStrategy extends PassportStrategy(Strategy) {
    constructor() {
        super({
            jwtFromRequest: ExtractJwt.fromAuthHeaderAsBearerToken(),
            ignoreExpiration: false,
            secretOrKey: jwtConstants.secret,
        });
    }

    async validate(payload: AuthJwtPayloadType) {
        return {
            username: payload.username,
            roles: payload.roles,
            email: payload.email,
            sub: payload.sub,
            avatarUrl: payload.avatarUrl,
        };
    }
}
