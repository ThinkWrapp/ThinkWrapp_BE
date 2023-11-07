import { Module } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';
import { MongooseModule } from '@nestjs/mongoose';

import { UserModule } from './user/user.module';

import { ENV_FILE_PATH } from './constants/path';
import { AuthModule } from './auth/auth.module';
import { RoomGateway } from './room/room.gateway';
import { RoomService } from './room/room.service';
import { PeerService } from './peer/peer.service';

@Module({
    imports: [
        ConfigModule.forRoot({
            isGlobal: true,
            envFilePath: ENV_FILE_PATH,
        }),
        MongooseModule.forRoot(process.env.MONGO_URI),
        UserModule,
        AuthModule,
    ],
    controllers: [],
    providers: [RoomGateway, RoomService, PeerService],
})
export class AppModule {}
