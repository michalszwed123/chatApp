import { IsEmail, IsNotEmpty, IsString } from "class-validator";

export class SignUpDto {

    @IsString()
    @IsNotEmpty()
    nick: string;

    @IsString()
    @IsNotEmpty()
    password: string;   
}