import { Logger } from '@nestjs/common';
import { SubscribeMessage, WebSocketGateway, OnGatewayInit, WebSocketServer, OnGatewayConnection, OnGatewayDisconnect, MessageBody, ConnectedSocket } from '@nestjs/websockets';
import { Socket, Server } from 'socket.io';

@WebSocketGateway({cors: '*:*', namespace: '/chat'})
export class ChatGateway implements OnGatewayConnection, OnGatewayDisconnect {

  @WebSocketServer() server: Server

  private logger: Logger = new Logger('ChatGateway')

  static afterInit(server: any) {
    //this.logger.log('Initialized!')
  }

  handleConnection(@ConnectedSocket() socket: Socket) {
    this.logger.log(`Client connected: ${socket.id}`)
  }

  handleDisconnect(@ConnectedSocket() socket: Socket) {
    this.logger.log(`Client disconnected: ${socket.id}`)
  }

  @SubscribeMessage('info')
  info(@ConnectedSocket() socket: Socket) {
    console.log(socket.rooms);
    console.log(this.server.adapter);
    
  }


  @SubscribeMessage('chatToRoom')
  handleMessage(
    @ConnectedSocket() socket: Socket, 
    @MessageBody() message: { sender: string, message: string, room: string }
  ) { 
    console.log(`Sending message to ${message.room} from ${socket.id}`);
    console.log(typeof(socket.id));
    
    this.server.of('/chat').in(message.room).emit('chatToClient', message.message)
  }

  @SubscribeMessage('joinRoom')
  handleJoinRoom(
    @ConnectedSocket() socket: Socket,
    @MessageBody() room: string
  ) {
    socket.join(room)
    socket.emit('joinedRoom', room)
    
    this.logger.log(`Client ${socket.id} joined ${room}`)
  } 

  @SubscribeMessage('leaveRoom')
  handleLeaveRoom(
    @ConnectedSocket() socket: Socket,
    @MessageBody() room: string
  ) {
    socket.leave(room)
    socket.emit('leftRoom', room)

    this.logger.log(`Client ${socket.id} left ${room}`)
  }
}
