import { ConflictException, Injectable, InternalServerErrorException, NotFoundException, UseGuards } from '@nestjs/common';
import { Room, User } from '@prisma/client';
import { PrismaClientKnownRequestError } from '@prisma/client/runtime';
import { PrismaService } from 'src/prisma/prisma.service';
import { RoomDto } from './dto';
import { generateTag } from './handlers';

@Injectable()
export class ChatService {
    constructor(private readonly prisma: PrismaService) { }


    async findRoomById(roomId: string): Promise<Room> {
        const room = await this.prisma.room.findUnique({
            where: {
                id: roomId
            },
        }).catch((err) => {
            throw new NotFoundException('The room not found')
        })
        if (!room) throw new NotFoundException('The room not found')

        return room
    }

    async deleteRoomById(roomId: string): Promise<void> {
        await this.prisma.room.delete({
            where: {
                id: roomId
            },
        }).catch((err) => {
            throw new NotFoundException('The Room not found')
        })
    }

    async appendUserRooms(roomId: string, userId: string): Promise<void> {
        const user: User = await this.prisma.user.findUnique({
            where: { id: userId }
        })
        user.joinedRoomIds.push(roomId)

        await this.prisma.user.update({
            where: { id: userId },
            data: {
                joinedRoomIds: user.joinedRoomIds
            }
        })
    }

    async appendRoomUsers(roomId: string, userId: string): Promise<void> {
        const room = await this.prisma.room.findUnique({
            where: { id: roomId }
        }).catch((err) => {
            throw new NotFoundException('The room not found')
        })

        room.joinedUserIds.push(userId)

        await this.prisma.room.update({
            where: { id: roomId },
            data: {
                joinedUserIds: room.joinedUserIds
            }
        })
    }

    async deleteUserRooms(roomId: string, userId: string): Promise<void> {
        const user: User = await this.prisma.user.findUnique({
            where: { id: userId }
        })

        user.joinedRoomIds = user.joinedRoomIds.filter(e => e !== roomId)

        await this.prisma.user.update({
            where: { id: userId },
            data: {
                joinedRoomIds: user.joinedRoomIds
            }
        })
    }

    async deleteRoomUsers(roomId: string, userId: string): Promise<void> {
        const room = await this.prisma.room.findUnique({
            where: { id: roomId }
        }).catch((err) => {
            throw new NotFoundException('The room not found')
        })

        room.joinedUserIds = room.joinedUserIds.filter(e => e !== userId)

        await this.prisma.room.update({
            where: { id: roomId },
            data: {
                joinedUserIds: room.joinedUserIds
            }
        })
    }

    async joinRoom(roomId: string, userId: string): Promise<void> {
        const room = await this.findRoomById(roomId)
        if (room.joinedUserIds.some(e => e === userId)) {
            throw new ConflictException('The user has already joined the selected room')
        }

        await this.appendRoomUsers(roomId, userId)
        await this.appendUserRooms(roomId, userId)
    }

    async quitRoom(roomId: string, userId: string): Promise<void> {
        const room = await this.findRoomById(roomId)
        if (!room.joinedUserIds.some(e => e === userId)) {
            throw new NotFoundException('The user not found in the selected room')
        }

        await this.deleteRoomUsers(roomId, userId)
        await this.deleteUserRooms(roomId, userId)
    }


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
                    throw new ConflictException('The room with given name already exists');
                }
            }
            throw err;
        });
        await this.joinRoom(room.id, userId)
        return await this.findRoomById(room.id)
    }

}
