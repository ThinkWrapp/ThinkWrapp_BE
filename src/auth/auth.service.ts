import {
    Injectable,
    ConflictException,
    InternalServerErrorException,
} from '@nestjs/common';
import * as bcrypt from 'bcrypt';
import { JwtService } from '@nestjs/jwt';

import { CreateUserDto } from 'src/user/user.dto';
import { UserService } from 'src/user/user.service';

import { AuthUserType } from 'src/types/auth';

@Injectable()
export class AuthService {
    constructor(
        private userService: UserService,
        private jwtService: JwtService,
    ) {}

    async register(userDto: CreateUserDto) {
        const user = await this.userService.getUser(userDto.email);

        if (user) {
            throw new ConflictException('이미 가입한 유저입니다.');
        }

        const saltOrRounds = 10;
        const hashedPassword = await bcrypt.hash(userDto.password, saltOrRounds);

        try {
            const newUser = await this.userService.createUser({
                ...userDto,
                password: hashedPassword,
            });

            newUser.password = undefined;
            return { message: '회원가입에 성공했습니다.', user: newUser };
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

    login(user: AuthUserType) {
        const payload = { username: user.username, roles: user.roles, sub: user._id };

        return {
            access_token: this.jwtService.sign(payload),
        };
    }
}
