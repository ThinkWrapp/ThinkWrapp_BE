import {
    WebSocketGateway,
    WebSocketServer,
    SubscribeMessage,
    OnGatewayConnection,
    OnGatewayDisconnect,
} from '@nestjs/websockets';
import { Server, Socket } from 'socket.io';
import { RoomService } from './room.service';
import { LoadRoomSendData, RoomFormDataType } from 'src/types/room';

@WebSocketGateway({
    cors: { origin: 'http://localhost:5173' },
})
export class RoomGateway implements OnGatewayConnection, OnGatewayDisconnect {
    @WebSocketServer()
    server: Server;

    constructor(private readonly roomService: RoomService) {}

    handleConnection(client: Socket) {
        console.log('서버 접속');
        const rooms = this.roomService.getRooms();

        client.emit(
            'welcome',
            rooms.map((room) => ({
                id: room.id,
                name: room.roomName,
                nbCharacters: room.characters.length,
                roomLimitPeople: room.roomLimitPeople,
            })),
        );

        if (!client.handshake.query.email) return;

        this.roomService.connectClientSet(client.handshake.query.email as string);
    }

    @SubscribeMessage('createRoom')
    onCreateRoom(client: Socket, roomData: RoomFormDataType) {
        const email = client.handshake.query.email as string;
        this.roomService.createRoom({ ...roomData, email });

        const clientData = this.roomService.getClientData(email);
        const rooms = this.roomService.getRooms();
        const room = this.roomService.getRoom(roomData.id);

        const character = {
            id: email,
            session: parseInt(`${Math.random() * 10000}`),
            position: this.roomService.generateRandomPosition(room),
            avatarUrl: roomData.avatarUrl,
        };

        room.characters.push(character);

        this.server.emit(
            'roomsUpdate',
            rooms.map((room) => ({
                id: room.id,
                name: room.roomName,
                nbCharacters: room.characters.length,
                roomLimitPeople: room.roomLimitPeople,
            })),
        );

        clientData.room = room;
        clientData.character = character;

        this.roomService.setClientData(client.id, clientData);
    }

    @SubscribeMessage('loadRoom')
    onLoadRoom(client: Socket, roomId: string) {
        const room = this.roomService.getRoom(roomId);
        const email = client.handshake.query.email as string;
        if (!room || !email) return;

        client.join(roomId);

        const sendData: LoadRoomSendData = {
            map: {
                gridDivision: room.gridDivision,
                size: room.size,
            },
            characters: room.characters,
            id: email,
        };

        if (room.password && room.email === email) {
            sendData.password = room.password;
        }

        client.emit('roomJoined', sendData);
    }

    @SubscribeMessage('joinRoom')
    onJoinRoom(client: Socket, roomId: string) {
        const room = this.roomService.getRoom(roomId);
        const email = client.handshake.query.email as string;

        if (!room) return;

        client.join(roomId);

        const character = {
            id: email,
            session: parseInt(`${Math.random() * 10000}`),
            position: this.roomService.generateRandomPosition(room),
        };

        room.characters.push(character);
    }

    @SubscribeMessage('leaveRoom')
    onLeaveRoom(client: Socket, email: string) {}

    handleDisconnect(client: Socket) {
        console.log('서버 접속해제');
    }
}
