import { Injectable } from '@nestjs/common';
import { UserMongoRepository } from './user.repository';
import { CreateUserDto, UpdateUserDto } from './user.dto';

@Injectable()
export class UserService {
    constructor(private readonly userRepository: UserMongoRepository) {}

    createUser(user: CreateUserDto) {
        return this.userRepository.createUser(user);
    }

    getUser(email: string) {
        return this.userRepository.getUser(email);
    }

    updateUser(email: string, user: UpdateUserDto) {
        return this.userRepository.updateUser(email, user);
    }

    deleteUser(email: string) {
        return this.userRepository.deleteUser(email);
    }
}
