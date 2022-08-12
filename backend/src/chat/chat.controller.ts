import { Body, Controller, Delete, Get, HttpCode, HttpStatus, Param, Post, Req, UseGuards } from '@nestjs/common';
import { Room, User } from '@prisma/client';
import { Request } from 'express';
import { GetCurrentUser, GetCurrentUserId } from 'src/common/decorators';
import { AtGuard } from 'src/common/guards';
import { ChatService } from './chat.service';
import { RoomDto } from './dto';

@Controller('chat')
export class ChatController {
    constructor(private readonly chatService: ChatService) {}

    // @Post('/room')
    // @UseGuards(AtGuard)
    // @HttpCode(HttpStatus.CREATED)
    // createRoom(
    //     @Body() dto: RoomDto,
    //     @GetCurrentUserId() userId: string,
    //     @Req() req: Request
    // ): Promise<Room>    {
    //     console.log(req);
        
    //     return this.chatService.createRoom(dto, userId)
    // }

    // @Post('/room/join/:roomId')
    // @UseGuards(AtGuard)
    // joinRoom(
    //     @Param('roomId') roomId: string,
    //     @GetCurrentUserId() userId: string
    // ): Promise<any> {
    //     return this.chatService.joinRoom(roomId, userId)
    // }

    // @Post('/room/quit/:roomId')
    // @UseGuards(AtGuard)
    // quitRoom(
    //     @Param('roomId') roomId: string,
    //     @GetCurrentUserId() userId: string
    // ): Promise<any> {
    //     return this.chatService.quitRoom(roomId, userId)
    // }


    // // Change to delete by TAG later
    // @Delete('/room/delete/:roomId')
    // deleteRoom(
    //     @Param('roomId') roomId: string
    // ): Promise<any> {
    //     return this.chatService.deleteRoomById(roomId)
    // }

    // @Get('/room/:roomId')
    // findRoom(@Param('roomId') roomId: string): Promise<Room> {
    //     return this.chatService.findRoomById(roomId)
    // }

}
