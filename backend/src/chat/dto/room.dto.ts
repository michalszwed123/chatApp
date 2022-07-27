import { IsBoolean, IsNotEmpty, IsOptional, IsString } from "class-validator";

export class RoomDto {

    @IsString()
    @IsNotEmpty()
    name: string

    @IsOptional()
    @IsBoolean()
    isPublic: boolean
}