import { Module } from '@nestjs/common';
import { UserService } from './user/user.service';
import { UserModule } from './user/user.module';

@Module({
    imports: [UserModule],
    controllers: [],
    providers: [UserService],
})
export class AppModule {}
