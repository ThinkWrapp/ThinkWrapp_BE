import { IsEmail, IsNotEmpty, IsString, IsOptional, Matches } from 'class-validator';

export class CreateUserDto {
    @IsString()
    @IsNotEmpty()
    username: string;

    @IsEmail()
    @IsNotEmpty()
    email: string;

    @IsString()
    @IsOptional()
    @Matches(/^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)[a-zA-Z\d]{8,}$/, {
        message:
            '비밀번호는 최소 8자 이상이어야 하며 대문자, 소문자, 숫자가 각각 하나씩 포함되어야 합니다.',
    })
    password?: string;

    @IsString()
    @IsOptional()
    providerId?: string;
}

export class UpdateUserDto {
    @IsString()
    @IsOptional()
    username?: string;

    @IsString()
    @IsOptional()
    @Matches(/^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)[a-zA-Z\d]{8,}$/, {
        message:
            '비밀번호는 최소 8자 이상이어야 하며 대문자, 소문자, 숫자가 각각 하나씩 포함되어야 합니다.',
    })
    password?: string;
}
