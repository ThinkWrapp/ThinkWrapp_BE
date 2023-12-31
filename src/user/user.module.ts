import { MongooseModule } from '@nestjs/mongoose';
import { Module } from '@nestjs/common';
import { UserService } from './user.service';

import { User, UserSchema } from './user.schema';
import { UserMongoRepository } from './user.repository';

@Module({
    imports: [MongooseModule.forFeature([{ name: User.name, schema: UserSchema }])],
    providers: [UserService, UserMongoRepository],
    exports: [UserService],
})
export class UserModule {}
