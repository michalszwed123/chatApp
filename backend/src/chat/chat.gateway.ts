import { Logger, UseGuards } from '@nestjs/common';
import { SubscribeMessage, WebSocketGateway, OnGatewayInit, WebSocketServer } from '@nestjs/websockets';
import { Socket, Server } from 'socket.io';

@WebSocketGateway({namespace: '/chat'})
export class ChatGateway implements OnGatewayInit {

  @WebSocketServer() wss: Server

  private logger: Logger = new Logger('ChatGateway')

  afterInit(server: any) {
    this.logger.log('Initialized!')
  }
  
  handleConnect(client: Socket, args: any[]) {
    this.logger.log(`Client has connected: ${client.id}`)
  }
  handleDisconnect(client: Socket, args: any[]) {
    this.logger.log(`Client has disconnected: ${client.id}`)
  }


  //@UseGuards(AtGuard)
  @SubscribeMessage('chatToServer')
  handleMessage(client: Socket, message: { sender: string, message: string}) {

    
    this.wss.emit('chatToClient')
  }
}
