import {
    SubscribeMessage,
    WebSocketGateway,
    WebSocketServer,
    OnGatewayDisconnect,
    OnGatewayConnection
} from '@nestjs/websockets';
import { Logger } from '@nestjs/common';
import { Server, Socket } from 'socket.io';
import { Redis } from 'ioredis';
import { InjectRedis } from '@nestjs-modules/ioredis';

@WebSocketGateway({
    cors: {
        origin: process.env.URL_FRONTEND || 'http://localhost:3000',
    },
})


export class TicketsGateway implements OnGatewayDisconnect, OnGatewayConnection {
    @WebSocketServer() server: Server;
    private logger: Logger = new Logger('TicketsGateway');
    private readonly HOLD_DURATION_SECONDS = 300;

    constructor(@InjectRedis() private readonly redis: Redis) { }

    handleConnection(client: Socket) {
        this.logger.log(`Client connected: ${client.id}`);
    }

    async handleDisconnect(client: Socket) {
        const pattern = `hold:trip:*:seat:*`;
        const keys = await this.redis.keys(pattern);
        for (const key of keys) {
            const holderId = await this.redis.get(key);
            if (holderId === client.id) {
                const parts = key.split(':');
                const tripId = parts[2];
                const seatCode = parts[4];
                await this.redis.del(key);
                this.server.to(`trip-${tripId}`).emit('seatStatusChanged', { seatCode, status: 'available' });
                this.logger.log(`Auto-unheld seat ${seatCode} for disconnected client ${client.id}`);
            }
        }
        this.logger.log(`Client disconnected: ${client.id}`);
    }

    @SubscribeMessage('joinTripRoom')
    async handleJoinRoom(client: Socket, tripId: number) {
        const room = `trip-${tripId}`;
        client.join(room);
        this.logger.log(`Client ${client.id} joined room: ${room}`);

        const pattern = `hold:trip:${tripId}:seat:*`;
        const heldKeys = await this.redis.keys(pattern);
        const currentHeldSeats: Record<string, string> = {};
        for (const key of heldKeys) {
            const holderId = await this.redis.get(key);
            const seatCode = key.split(':')[4];
            if (seatCode && holderId) {
                currentHeldSeats[seatCode] = holderId;
            }
        }
        client.emit('currentHeldSeats', currentHeldSeats);
    }

    @SubscribeMessage('leaveTripRoom')
    handleLeaveRoom(client: Socket, tripId: number) {
        const room = `trip-${tripId}`;
        client.leave(room);
        this.logger.log(`Client ${client.id} left room: ${room}`);
    }

    @SubscribeMessage('holdSeat')
    async handleHoldSeat(client: Socket, payload: { tripId: number, seatCode: string }): Promise<void> {
        const { tripId, seatCode } = payload;
        const room = `trip-${tripId}`;
        const holdKey = `hold:trip:${tripId}:seat:${seatCode}`;

        const result = await this.redis.set(holdKey, client.id, 'EX', this.HOLD_DURATION_SECONDS, 'NX');

        if (result === 'OK') {
            this.server.to(room).emit('seatStatusChanged', { seatCode, status: 'held', holderId: client.id });
            this.logger.log(`Seat ${seatCode} held by ${client.id} for trip ${tripId}`);
        } else {
            client.emit('holdFailed', { seatCode, message: 'Ghế này đã được người khác chọn.' });
        }
    }

    @SubscribeMessage('unholdSeat')
    async handleUnholdSeat(client: Socket, payload: { tripId: number, seatCode: string }): Promise<void> {
        const { tripId, seatCode } = payload;
        const room = `trip-${tripId}`;
        const holdKey = `hold:trip:${tripId}:seat:${seatCode}`;

        const holderId = await this.redis.get(holdKey);
        if (holderId === client.id || !holderId) {
            await this.redis.del(holdKey);
            this.server.to(room).emit('seatStatusChanged', { seatCode, status: 'available' });
            this.logger.log(`Seat ${seatCode} unheld by ${client.id} for trip ${tripId}`);
        }
    }

    emitSeatUpdate(tripId: number, ticketData: any) {
        const room = `trip-${tripId}`;
        this.server.to(room).emit('seatUpdate', ticketData);
        this.logger.log(`Emitted seatUpdate to room ${room}`);
    }
}