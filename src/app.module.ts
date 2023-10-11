import { Module } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';
import { MongooseModule } from '@nestjs/mongoose';

import { UserModule } from './user/user.module';

import { ENV_FILE_PATH } from './constants/path';

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
    providers: [],
})
export class AppModule {}
