import { Injectable } from '@nestjs/common';
import { UserMongoRepository } from './user.repository';
import { CreateUserDto, UpdateUserDto } from './user.dto';
import { AuthUserType } from 'src/types/auth';

@Injectable()
export class UserService {
    constructor(private readonly userRepository: UserMongoRepository) {}

    async createUser(user: CreateUserDto) {
        return this.userRepository.createUser(user);
    }

    async getUser(email: string) {
        return this.userRepository.getUser(email);
    }

    async updateUser(email: string, user: UpdateUserDto) {
        return this.userRepository.updateUser(email, user);
    }

    async deleteUser(email: string) {
        return this.userRepository.deleteUser(email);
    }

    async findByEmailOrSave(email: string, username: string): Promise<AuthUserType> {
        const foundUser = await this.getUser(email);

        if (foundUser) {
            return foundUser;
        }

        const newUser = await this.userRepository.createUser({
            email,
            username,
        });

        return newUser;
    }

    async updateAvatar(email: string, avatarUrl: string) {
        return this.userRepository.updateAvatar(email, avatarUrl);
    }
}
