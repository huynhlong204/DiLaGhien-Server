import { OnGatewayDisconnect, OnGatewayConnection } from '@nestjs/websockets';
import { Server, Socket } from 'socket.io';
import { Redis } from 'ioredis';
export declare class TicketsGateway implements OnGatewayDisconnect, OnGatewayConnection {
    private readonly redis;
    server: Server;
    private logger;
    private readonly HOLD_DURATION_SECONDS;
    constructor(redis: Redis);
    handleConnection(client: Socket): void;
    handleDisconnect(client: Socket): Promise<void>;
    handleJoinRoom(client: Socket, tripId: number): Promise<void>;
    handleLeaveRoom(client: Socket, tripId: number): void;
    handleHoldSeat(client: Socket, payload: {
        tripId: number;
        seatCode: string;
    }): Promise<void>;
    handleUnholdSeat(client: Socket, payload: {
        tripId: number;
        seatCode: string;
    }): Promise<void>;
    emitSeatUpdate(tripId: number, ticketData: any): void;
}
