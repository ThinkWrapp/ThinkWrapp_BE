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

        if (!room) return;

        client.join(roomData.id);

        const character = {
            id: email,
            session: parseInt(`${Math.random() * 10000}`),
            position: this.roomService.generateRandomPosition(room),
            avatarUrl: roomData.avatarUrl,
        };

        room.characters.push(character);

        const sendData: LoadRoomSendData = {
            map: {
                gridDivision: room.gridDivision,
                size: room.size,
            },
            characters: room.characters,
            id: email,
            password: room.password,
        };

        client.emit('roomJoined', sendData);

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

        this.roomService.setClientData(email, clientData);
    }

    // @SubscribeMessage('loadRoom')
    // onLoadRoom(client: Socket, roomId: string) {
    //     const room = this.roomService.getRoom(roomId);
    //     const email = client.handshake.query.email as string;
    //     if (!room || !email) return;

    //     client.join(roomId);

    // const sendData: LoadRoomSendData = {
    //     map: {
    //         gridDivision: room.gridDivision,
    //         size: room.size,
    //     },
    //     characters: room.characters,
    //     id: email,
    // };

    //     if (room.password && room.email === email) {
    //         sendData.password = room.password;
    //     }

    //     console.log('센드데이터', sendData);
    //     client.emit('roomJoined', sendData);
    // }

    @SubscribeMessage('joinRoom')
    onJoinRoom(client: Socket, { roomId, avatarUrl }) {
        const email = client.handshake.query.email as string;
        const room = this.roomService.getRoom(roomId);
        const clientData = this.roomService.getClientData(email);

        if (!room) return;

        client.join(room.id);

        const character = {
            id: email,
            session: parseInt(`${Math.random() * 10000}`),
            position: this.roomService.generateRandomPosition(room),
            avatarUrl,
        };

        room.characters.push(character);

        client.emit('roomJoined', {
            map: {
                gridDivision: room.gridDivision,
                size: room.size,
                items: room.items,
            },
            characters: room.characters,
            id: email,
        });

        clientData.room = room;
        clientData.character = character;
        this.roomService.setClientData(email, clientData);
        this.roomService.onRoomUpdate(email, this.server);
    }

    @SubscribeMessage('leaveRoom')
    onLeaveRoom(client: Socket) {
        const email = client.handshake.query.email as string;
        const cliendData = this.roomService.getClientData(email);
        const room = cliendData.room;

        if (!room) return;

        client.leave(room.id);

        room.characters.splice(
            room.characters.findIndex((character) => character.id === email),
            1,
        );

        if (room.characters.length === 0) {
            this.roomService.removeRoom(room.id);
        }
        this.roomService.onRoomUpdate(email, this.server);

        cliendData.room = null;
        this.roomService.setClientData(email, cliendData);
    }

    handleDisconnect(client: Socket) {
        console.log('서버 접속해제');
    }
}
