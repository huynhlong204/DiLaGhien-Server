"use strict";
var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
var __metadata = (this && this.__metadata) || function (k, v) {
    if (typeof Reflect === "object" && typeof Reflect.metadata === "function") return Reflect.metadata(k, v);
};
var __param = (this && this.__param) || function (paramIndex, decorator) {
    return function (target, key) { decorator(target, key, paramIndex); }
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.TicketsGateway = void 0;
const websockets_1 = require("@nestjs/websockets");
const common_1 = require("@nestjs/common");
const socket_io_1 = require("socket.io");
const ioredis_1 = require("ioredis");
const ioredis_2 = require("@nestjs-modules/ioredis");
let TicketsGateway = class TicketsGateway {
    redis;
    server;
    logger = new common_1.Logger('TicketsGateway');
    HOLD_DURATION_SECONDS = 300;
    constructor(redis) {
        this.redis = redis;
    }
    handleConnection(client) {
        this.logger.log(`Client connected: ${client.id}`);
    }
    async handleDisconnect(client) {
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
    async handleJoinRoom(client, tripId) {
        const room = `trip-${tripId}`;
        client.join(room);
        this.logger.log(`Client ${client.id} joined room: ${room}`);
        const pattern = `hold:trip:${tripId}:seat:*`;
        const heldKeys = await this.redis.keys(pattern);
        const currentHeldSeats = {};
        for (const key of heldKeys) {
            const holderId = await this.redis.get(key);
            const seatCode = key.split(':')[4];
            if (seatCode && holderId) {
                currentHeldSeats[seatCode] = holderId;
            }
        }
        client.emit('currentHeldSeats', currentHeldSeats);
    }
    handleLeaveRoom(client, tripId) {
        const room = `trip-${tripId}`;
        client.leave(room);
        this.logger.log(`Client ${client.id} left room: ${room}`);
    }
    async handleHoldSeat(client, payload) {
        const { tripId, seatCode } = payload;
        const room = `trip-${tripId}`;
        const holdKey = `hold:trip:${tripId}:seat:${seatCode}`;
        const result = await this.redis.set(holdKey, client.id, 'EX', this.HOLD_DURATION_SECONDS, 'NX');
        if (result === 'OK') {
            this.server.to(room).emit('seatStatusChanged', { seatCode, status: 'held', holderId: client.id });
            this.logger.log(`Seat ${seatCode} held by ${client.id} for trip ${tripId}`);
        }
        else {
            client.emit('holdFailed', { seatCode, message: 'Ghế này đã được người khác chọn.' });
        }
    }
    async handleUnholdSeat(client, payload) {
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
    emitSeatUpdate(tripId, ticketData) {
        const room = `trip-${tripId}`;
        this.server.to(room).emit('seatUpdate', ticketData);
        this.logger.log(`Emitted seatUpdate to room ${room}`);
    }
};
exports.TicketsGateway = TicketsGateway;
__decorate([
    (0, websockets_1.WebSocketServer)(),
    __metadata("design:type", socket_io_1.Server)
], TicketsGateway.prototype, "server", void 0);
__decorate([
    (0, websockets_1.SubscribeMessage)('joinTripRoom'),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [socket_io_1.Socket, Number]),
    __metadata("design:returntype", Promise)
], TicketsGateway.prototype, "handleJoinRoom", null);
__decorate([
    (0, websockets_1.SubscribeMessage)('leaveTripRoom'),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [socket_io_1.Socket, Number]),
    __metadata("design:returntype", void 0)
], TicketsGateway.prototype, "handleLeaveRoom", null);
__decorate([
    (0, websockets_1.SubscribeMessage)('holdSeat'),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [socket_io_1.Socket, Object]),
    __metadata("design:returntype", Promise)
], TicketsGateway.prototype, "handleHoldSeat", null);
__decorate([
    (0, websockets_1.SubscribeMessage)('unholdSeat'),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [socket_io_1.Socket, Object]),
    __metadata("design:returntype", Promise)
], TicketsGateway.prototype, "handleUnholdSeat", null);
exports.TicketsGateway = TicketsGateway = __decorate([
    (0, websockets_1.WebSocketGateway)({
        cors: {
            origin: process.env.URL_FRONTEND || '*',
        },
    }),
    __param(0, (0, ioredis_2.InjectRedis)()),
    __metadata("design:paramtypes", [ioredis_1.Redis])
], TicketsGateway);
//# sourceMappingURL=tickets.gateway.js.map