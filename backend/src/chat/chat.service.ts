import { ConflictException, Injectable, InternalServerErrorException, NotFoundException, UseGuards } from '@nestjs/common';
import { Room, User } from '@prisma/client';
import { PrismaClientKnownRequestError } from '@prisma/client/runtime';
import { PrismaService } from 'src/prisma/prisma.service';
import { RoomDto } from './dto';
import { generateTag } from './handlers';

@Injectable()
export class ChatService {
    constructor(private readonly prisma: PrismaService) {}

    
    async createRoom(dto: RoomDto, userId: string): Promise<Room> {
        const room = await this.prisma.room.create({
            data: {
                name: dto.name,
                isPublic: dto.isPublic,
                tag: generateTag(),
                creatorId: userId
            }
        }).catch((err) => {
            if (err instanceof PrismaClientKnownRequestError) {
                if (err.code === 'P2002') {                  
                  throw new ConflictException('Room with given name already exists');
                }
              }
            throw err;
        });

        return room
    }

  
}
