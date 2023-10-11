import { InjectModel } from '@nestjs/mongoose';
import { Injectable } from '@nestjs/common';
import { Model } from 'mongoose';

import { User, UserDocument } from './user.schema';
import { CreateUserDto, UpdateUserDto } from './user.dto';

export interface UserRepository {
    createUser(user: CreateUserDto): Promise<UserDocument>;
    getUser(email: string): Promise<UserDocument>;
    updateUser(email: string, user: UpdateUserDto): Promise<UserDocument>;
    deleteUser(email: string): Promise<unknown>;
}

@Injectable()
export class UserMongoRepository implements UserRepository {
    constructor(
        @InjectModel(User.name) private readonly userModel: Model<UserDocument>,
    ) {}

    createUser(user: CreateUserDto): Promise<UserDocument> {
        return this.userModel.create(user);
    }

    getUser(email: string): Promise<UserDocument> {
        return this.userModel.findOne({ email });
    }

    updateUser(email: string, user: UpdateUserDto): Promise<UserDocument> {
        return this.userModel.findOneAndUpdate(
            { email },
            { $set: { ...user, updatedAt: new Date() } },
            { new: true },
        );
    }

    deleteUser(email: string): Promise<unknown> {
        return this.userModel.deleteOne({ email });
    }
}
