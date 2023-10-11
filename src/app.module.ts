import { Module } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';
import { MongooseModule } from '@nestjs/mongoose';

import { UserModule } from './user/user.module';
import { UserService } from './user/user.service';

import { ENV_FILE_PATH } from './constant/path';

@Module({
    imports: [
        ConfigModule.forRoot({
            isGlobal: true,
            envFilePath: ENV_FILE_PATH,
        }),
        MongooseModule.forRoot(process.env.MONGO_URI),
        UserModule,
    ],
    controllers: [],
    providers: [UserService],
})
export class AppModule {}
