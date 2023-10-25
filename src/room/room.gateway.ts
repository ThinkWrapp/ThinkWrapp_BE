import {
    WebSocketGateway,
    WebSocketServer,
    SubscribeMessage,
    OnGatewayConnection,
} from '@nestjs/websockets';
import { Server, Socket } from 'socket.io';
import { RoomService } from './room.service';
import { RoomFormDataType } from 'src/types/room';

@WebSocketGateway({
    cors: { origin: 'http://localhost:5173' },
})
export class RoomGateway implements OnGatewayConnection {
    @WebSocketServer()
    server: Server;

    constructor(private readonly roomService: RoomService) {}

    @SubscribeMessage('createRoom')
    onCreateRoom(client: Socket, roomData: RoomFormDataType) {
        roomData.hostId = client.id;
        this.roomService.createRoom(roomData);

        const rooms = this.roomService.getRooms();

        this.server.emit(
            'roomsUpdate',
            ...rooms.map((room) => ({
                id: room.id,
                name: room.roomName,
                nbCharacters: room.characters.length,
                roomLimitPeople: room.roomLimitPeople,
            })),
        );

        client.emit('roomCreated', { password: roomData.password });
    }

    handleConnection(client: Socket) {
        this.roomService.connectClientSet(client.id);

        const rooms = this.roomService.getRooms();

        client.emit(
            'welcome',
            ...rooms.map((room) => ({
                id: room.id,
                name: room.roomName,
                nbCharacters: room.characters.length,
                roomLimitPeople: room.roomLimitPeople,
            })),
        );
    }
}
