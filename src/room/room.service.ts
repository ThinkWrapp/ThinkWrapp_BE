import * as pathfinding from 'pathfinding';
import { Injectable } from '@nestjs/common';
import { RoomFormDataType } from 'src/types/room';
import { Server } from 'socket.io';

@Injectable()
export class RoomService {
    private rooms = [];
    private clients = new Map<string, any>();

    generateRandomPosition(room) {
        for (let i = 0; i < 100; i++) {
            const x = Math.floor(Math.random() * room.size[0] * room.gridDivision);
            const y = Math.floor(Math.random() * room.size[1] * room.gridDivision);
            if (room.grid.isWalkableAt(x, y)) {
                return [x, y];
            }
        }
    }

    onRoomUpdate(email: string, server: Server) {
        const clientData = this.getClientData(email);
        const room = clientData.room;

        server.to(room.id).emit('character', room.characters);

        server.emit(
            'roomsUpdate',
            this.rooms.map((room) => ({
                id: room.id,
                name: room.roomName,
                nbCharacters: room.characters.length,
                roomLimitPeople: room.roomLimitPeople,
            })),
        );
    }

    connectClientSet(email: string) {
        this.clients.set(email, {
            room: null,
            character: null,
            peerId: null,
        });
    }

    getClientData(email: string) {
        return this.clients.get(email);
    }

    setClientData(email: string, data) {
        this.clients.set(email, data);
    }

    createRoom(roomData: RoomFormDataType): void {
        const size = [7, 7];
        const gridDivision = 2;

        const room = {
            ...roomData,
            size,
            gridDivision,
            characters: [],
            videos: [],
            grid: new pathfinding.Grid(size[0] * gridDivision, size[1] * gridDivision),
        };

        this.rooms.push(room);
    }

    getRooms() {
        return this.rooms;
    }

    getRoom(roomId: string) {
        return this.rooms.find((room) => room.id === roomId);
    }

    removeRoom(roomId: string) {
        this.rooms = this.rooms.filter((room) => room.id !== roomId);
    }
}
