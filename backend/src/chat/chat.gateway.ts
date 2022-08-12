import { ConsoleLogger, Logger, Req, UseGuards } from '@nestjs/common';
import { SubscribeMessage, WebSocketGateway, WebSocketServer, OnGatewayConnection, OnGatewayDisconnect, ConnectedSocket, OnGatewayInit, WsResponse, WsException} from '@nestjs/websockets';
import { Prisma, User } from '@prisma/client';
import { Request, response } from 'express';
import { uuid } from 'short-uuid';
import { Server, Socket } from 'socket.io';
import { Client } from 'socket.io/dist/client';
import { AuthService } from 'src/auth/auth.service';
import { JwtPayload } from 'src/auth/types';
import { GetCurrentUser, GetCurrentUserId, GetCurrentWsUserId } from 'src/common/decorators';
import { WsGuard } from 'src/common/guards/ws.guard';
import { PrismaService } from 'src/prisma/prisma.service';
import { ChatService } from './chat.service';

@WebSocketGateway({cors: '*:*'})
export class ChatGateway implements OnGatewayInit, OnGatewayConnection, OnGatewayDisconnect {

  constructor(
    private readonly authService: AuthService, 
    private readonly chatService: ChatService,
    private readonly prisma: PrismaService
  ) {}

  @WebSocketServer() server: Server

  private wsClients = []

  private logger: Logger = new Logger('ChatGateway')


  afterInit(server: any) {
    // Signs headers to socket object
    server.on('connection', (client: any ,request: any) => {
      client['request'] = request
    })
    this.logger.log('Initialized!')
  }


  async handleConnection(client: any) {    
    // const multiplyClients = this.wsClients.filter(e => e.id === client.data.sub)
    // console.log(multiplyClients);
    
    // if(multiplyClients.length) client.close()
    // POSTMAN | client.request.headers.authorization.split(' ')[1])
    // VUE     | client.request.headers['sec-websocket-protocol']
    try {
      const token = client.request.headers['sec-websocket-protocol']
      const decodedToken = await this.authService.verifyJwt(token)
      const user = await this.prisma.user.findUnique({ where: { id: decodedToken.sub }})
      if(!user) client.close()
      client.data = decodedToken
      client.id = client.data.sub

    
      this.logger.log(`Client connected: ${client.id}`)
      this.wsClients.push(client) 

      // Emit join message to all users
      const data = {
        name: client.data.nick,
        total: this.wsClients.length
      }

      this.broadcast(this.wsClients, 'joined', data)

      // Asign room etc ....
         
    } catch {
      client.close()
    }
  }

  handleDisconnect(client: any) {
    if(client.id) {
      this.logger.log(`Client disconnected: ${client.id}`)
      this.wsClients = this.wsClients.filter(e => e.id !== client.id)
      

      // Emit join message to all users
      const data = {
        name: client.data.nick,
        total: this.wsClients.length
      }
      
      this.broadcast(this.wsClients,'quit', data)  
    }
  }



  // @SubscribeMessage('identity')
  // info(client: any, payload: any): WsResponse<JwtPayload>{    
  //   return { 
  //     event: 'identity',
  //     data: {
  //       nick: client.data.nick,
  //       sub: client.data.sub,
  //     }
  //   }
  // }




  @SubscribeMessage('typing')
  async typing(client: any) {
    const name = client.data.nick
    
    // clients without typing user
    const clients = this.wsClients.filter(e => e.id !== client.id)

    const data = {
      id: client.id,
      name: name
    }

    this.broadcast(clients, 'typing', data)
  }

  @SubscribeMessage('chatToServer')
  handleMessage(
    client: any, payload: any,
  ) {
    payload = {...payload, sender: client.data.nick}  
    this.chatService.saveMessage(payload)
      
    return this.broadcast(this.wsClients, 'chatToClient', payload)
  }


  @SubscribeMessage('getMessages')
  async getMessages() {
    const messages = await this.chatService.loadMessages()
    const response = {
      event: 'getMessages',
      data: messages
    }

    return response
  }
  
  @SubscribeMessage('getClients')
  getClients() {
    const clients = this.wsClients.map(client => client.data.nick)
    
    
    const response = {
      event: 'getClients',
      data: {
        total: this.wsClients.length,
        clients: clients
      }
    }
    return response
  }


  private broadcast(clients: any[], event: string, data: any) {
    const response = {
      event,
      data
    }
    
    const broadcastMessage = JSON.stringify(response)  
    for(let c of clients) {
      c.send(broadcastMessage)
    }
  }
}
