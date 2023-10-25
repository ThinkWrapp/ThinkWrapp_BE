import * as pathfinding from 'pathfinding';
import { Injectable } from '@nestjs/common';
import { RoomFormDataType } from 'src/types/room';

@Injectable()
export class RoomService {
    private rooms = [];
    private clients = new Map<string, any>();

    connectClientSet(clientId: string) {
        this.clients.set(clientId, {
            room: null,
            character: null,
            peerId: null,
        });
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
}
