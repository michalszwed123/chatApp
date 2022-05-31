import { IsEmail, IsNotEmpty, IsString } from "class-validator";

export class SignInDto {

    @IsString()
    @IsNotEmpty()
    nick: string;

    @IsString()
    @IsNotEmpty()
    password: string;   
}