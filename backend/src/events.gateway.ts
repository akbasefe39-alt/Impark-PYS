import {
  WebSocketGateway,
  WebSocketServer,
  OnGatewayConnection,
  OnGatewayDisconnect,
} from '@nestjs/websockets';
import { Server, Socket } from 'socket.io';
import { JwtService } from '@nestjs/jwt';

@WebSocketGateway({
  cors: {
    origin: process.env.FRONTEND_URL || 'http://localhost:5173', // 🛡️ GÜVENLİK: Env'den veya varsayılan yerelden al
    credentials: true,
  },
})
export class EventsGateway implements OnGatewayConnection, OnGatewayDisconnect {
  constructor(private jwtService: JwtService) {}

  @WebSocketServer()
  server: Server;

  handleConnection(client: Socket) {
    try {
      // 🛡️ GÜVENLİK: Token'ı handshake'den çek (Header veya query)
      const authHeader = client.handshake.headers.authorization;
      const token =
        authHeader?.split(' ')[1] ||
        client.handshake.auth.token ||
        client.handshake.query.token;

      if (!token) {
        console.log('[WebSocket] Connection rejected: No token provided.');
        return client.disconnect();
      }

      // Token'ı doğrula
      const payload = this.jwtService.verify(token);
      const userId = payload.sub;

      if (userId) {
        client.join(`user_${userId}`);
        console.log(
          `[WebSocket] Client authenticated and joined room user_${userId} (id: ${client.id})`,
        );
      } else {
        throw new Error('Invalid payload');
      }
    } catch (e) {
      console.log(
        `[WebSocket] Connection rejected: Invalid token. Error: ${e.message}`,
      );
      client.disconnect();
    }
  }

  handleDisconnect(client: Socket) {
    // Optionally log disconnect
  }
}
