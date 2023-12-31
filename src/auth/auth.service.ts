import {
    Injectable,
    ConflictException,
    InternalServerErrorException,
} from '@nestjs/common';
import * as bcrypt from 'bcrypt';
import { JwtService } from '@nestjs/jwt';

import { CreateUserDto } from 'src/user/user.dto';
import { UserService } from 'src/user/user.service';

import { AuthJwtPayloadType, AuthUserType } from 'src/types/auth';
import { Response } from 'express';
import { ConfigService } from '@nestjs/config';

@Injectable()
export class AuthService {
    constructor(
        private userService: UserService,
        private jwtService: JwtService,
        private configService: ConfigService,
    ) {}

    async register(userDto: CreateUserDto) {
        const user = await this.userService.getUser(userDto.email);

        if (user) {
            throw new ConflictException('이미 가입한 유저입니다.');
        }

        const saltOrRounds = 10;
        const hashedPassword = await bcrypt.hash(userDto.password, saltOrRounds);

        try {
            await this.userService.createUser({
                ...userDto,
                password: hashedPassword,
            });

            return { message: '회원가입에 성공했습니다.' };
        } catch (err) {
            throw new InternalServerErrorException('서버 에러');
        }
    }

    async validateUser(email: string, password: string) {
        const user = await this.userService.getUser(email);

        if (!user) {
            throw new ConflictException('가입하지 않은 유저입니다.');
        }

        const { password: hashedPassword, ...userInfo } = user.toJSON();
        const isPasswordMatched = await bcrypt.compare(password, hashedPassword);

        if (isPasswordMatched) {
            return userInfo;
        }

        return null;
    }

    async login(user: AuthUserType, res: Response) {
        const payload = {
            username: user.username,
            roles: user.roles,
            email: user.email,
            avatarUrl: user.avatarUrl,
            sub: user._id,
        };
        const access_token = this.jwtService.sign(payload);
        const refresh_token = this.jwtService.sign(payload, { expiresIn: '7d' });

        res.cookie('refresh', refresh_token, {
            httpOnly: true,
            maxAge: 1000 * 60 * 60 * 24 * 7,
            sameSite: process.env.NODE_ENV === 'dev' ? 'lax' : 'none',
            secure: process.env.NODE_ENV === 'dev' ? false : true,
        });

        return res.json({ message: '로그인에 성공하였습니다.', access_token });
    }

    async validateRefreshToken(refreshToken: string): Promise<AuthJwtPayloadType | null> {
        try {
            const userPayload = this.jwtService.verify(refreshToken);

            return userPayload;
        } catch (e) {
            return null;
        }
    }

    async updateAvatar(email: string, newAvatarUrl: string) {
        const { avatarUrl } = await this.userService.updateAvatar(email, newAvatarUrl);
        return avatarUrl;
    }

    async updateUsername(email: string, newUsername: string) {
        const { username } = await this.userService.updateUser(email, {
            username: newUsername,
        });

        return username;
    }

    async generateAccessToken(user: AuthJwtPayloadType) {
        const payload = {
            username: user.username,
            email: user.email,
            roles: user.roles,
            avatarUrl: user.avatarUrl,
            sub: user.sub,
        };
        return this.jwtService.sign(payload);
    }

    async googleAuth(user: AuthUserType, res: Response) {
        const payload = {
            username: user.username,
            email: user.email,
            avatarUrl: user.avatarUrl,
            roles: user.roles,
            sub: user._id,
        };

        const refresh_token = this.jwtService.sign(payload, { expiresIn: '7d' });

        res.cookie('refresh', refresh_token, {
            httpOnly: true,
            maxAge: 1000 * 60 * 60 * 24 * 7,
            sameSite: process.env.NODE_ENV === 'dev' ? 'lax' : 'none',
            secure: process.env.NODE_ENV === 'dev' ? false : true,
        });

        return res.redirect(`${this.configService.get('FRONTEND_URL')}/social-auth`);
    }
}
