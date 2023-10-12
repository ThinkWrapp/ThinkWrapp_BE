import {
    ValidationOptions,
    registerDecorator,
    ValidationArguments,
} from 'class-validator';
import { CreateUserDto } from 'src/user/user.dto';

export function IsPasswordMatching(
    property: string,
    validationOptions?: ValidationOptions,
) {
    return (user: CreateUserDto, confirmPassword: string) => {
        registerDecorator({
            name: 'isPasswordMatching',
            target: user.constructor,
            propertyName: confirmPassword,
            constraints: [property],
            options: validationOptions,
            validator: {
                validate(confirmPassword: string, args: ValidationArguments) {
                    const [password] = args.constraints;
                    const originPassword = (args.object as CreateUserDto)[password];
                    return confirmPassword === originPassword;
                },
                defaultMessage() {
                    return '비밀번호와 비밀번호 확인이 일치하지 않습니다.';
                },
            },
        });
    };
}
