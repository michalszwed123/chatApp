import { Body, Controller, Delete, HttpCode, HttpStatus, Param, Post, UseGuards } from '@nestjs/common';
import { Room, User } from '@prisma/client';
import { GetCurrentUser, GetCurrentUserId } from 'src/common/decorators';
import { AtGuard } from 'src/common/guards';
import { ChatService } from './chat.service';
import { RoomDto } from './dto';

@Controller('chat')
export class ChatController {
    constructor(private readonly chatService: ChatService) {}

    @Post('/room')
    @UseGuards(AtGuard)
    @HttpCode(HttpStatus.CREATED)
    createRoom(
        @Body() dto: RoomDto,
        @GetCurrentUserId() userId: string
    ): Promise<Room>    {
        return this.chatService.createRoom(dto, userId)
    }

}
