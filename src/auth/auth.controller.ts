import {
    Body,
    Controller,
    Get,
    Post,
    Patch,
    Request,
    Response,
    UseGuards,
    UnauthorizedException,
} from '@nestjs/common';
import { CreateUserDto } from 'src/user/user.dto';
import { AuthService } from './auth.service';
import { LocalAuthGuard } from './guards/localAuth.guard';
import { Public } from './public.decorator';
import { GoogleAuthGuard } from './guards/googleAuth.guard';

@Controller('auth')
export class AuthController {
    constructor(private authService: AuthService) {}

    @Public()
    @Post('register')
    register(@Body() userDto: CreateUserDto) {
        return this.authService.register(userDto);
    }

    @Public()
    @UseGuards(LocalAuthGuard)
    @Post('login')
    login(@Request() req, @Response() res) {
        return this.authService.login(req.user, res);
    }

    @Public()
    @Post('refreshToken')
    async refresh(@Request() req) {
        const refreshToken = req.cookies?.refresh;

        if (!refreshToken) {
            throw new UnauthorizedException('리프레쉬 토큰이 없습니다.');
        }

        const user = await this.authService.validateRefreshToken(refreshToken);

        if (!user) {
            throw new UnauthorizedException('리프레쉬 토큰이 만료되었습니다.');
        }

        const access_token = this.authService.generateAccessToken(user);

        return { access_token };
    }

    @Public()
    @Post('logout')
    logout(@Response() res) {
        res.clearCookie('refresh');
        return res.json({ message: '로그아웃에 성공하였습니다.' });
    }

    @Get('profile')
    getProfile(@Request() req) {
        return req.user;
    }

    @Patch('avatarUrl')
    updateAvatar(@Request() req, @Body('avatarUrl') avatarUrl: string) {
        return this.authService.updateAvatar(req.user.email, avatarUrl);
    }

    @Public()
    @Get('to-google')
    @UseGuards(GoogleAuthGuard)
    googleAuth() {}

    @Public()
    @Get('google')
    @UseGuards(GoogleAuthGuard)
    googleAuthRedirect(@Request() req, @Response() res) {
        return this.authService.googleAuth(req.user, res);
    }
}
