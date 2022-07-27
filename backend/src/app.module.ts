import { Module } from '@nestjs/common';
import { ChatGateway } from './chat/chat.gateway';
import { AuthModule } from './auth/auth.module';
import { ConfigModule } from '@nestjs/config';
import { PrismaModule } from './prisma/prisma.module';
import { ChatController } from './chat/chat.controller';
import { ChatService } from './chat/chat.service';

@Module({
  imports: [ConfigModule.forRoot(), AuthModule, PrismaModule],
  controllers: [ChatController],
  providers: [
    ChatGateway, ChatService],
})
export class AppModule { }
