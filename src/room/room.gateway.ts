import {
    WebSocketGateway,
    WebSocketServer,
    SubscribeMessage,
    OnGatewayConnection,
    OnGatewayDisconnect,
} from '@nestjs/websockets';
import { Server, Socket } from 'socket.io';
import { RoomService } from './room.service';
import { Item, LoadRoomSendData, RoomFormDataType } from 'src/types/room';
import { gatewayCorsUrl } from 'src/constants/secret';

@WebSocketGateway({
    cors: { origin: gatewayCorsUrl },
})
export class RoomGateway implements OnGatewayConnection, OnGatewayDisconnect {
    @WebSocketServer()
    server: Server;

    constructor(private readonly roomService: RoomService) {}

    handleConnection(client: Socket) {
        console.log('서버 접속');
        const items = this.roomService.getItems();
        const rooms = this.roomService.getRooms();

        client.emit('welcome', {
            rooms: rooms.map((room) => ({
                id: room.id,
                name: room.roomName,
                nbCharacters: room.characters.length,
                roomLimitPeople: room.roomLimitPeople,
            })),
            items,
        });

        if (!client.handshake.query.email) return;

        this.roomService.connectClientSet(client.handshake.query.email as string);
    }

    @SubscribeMessage('createRoom')
    onCreateRoom(client: Socket, roomData: RoomFormDataType) {
        const email = client.handshake.query.email as string;
        const { peerId, ...data } = roomData;
        this.roomService.createRoom({ ...data, email });

        const clientData = this.roomService.getClientData(email);
        const rooms = this.roomService.getRooms();
        const room = this.roomService.getRoom(roomData.id);

        if (!room) return;

        client.join(roomData.id);

        const character = {
            id: client.id,
            session: parseInt(`${Math.random() * 10000}`),
            position: this.roomService.generateRandomPosition(room),
            avatarUrl: roomData.avatarUrl,
        };

        const video = {
            id: peerId,
            isVideoMuted: true,
            isPlaying: false,
        };

        room.characters.push(character);
        room.videos.push(video);

        const sendData: LoadRoomSendData = {
            map: {
                gridDivision: room.gridDivision,
                size: room.size,
                items: room.items,
            },
            characters: room.characters,
            videos: room.videos,
            id: client.id,
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
        clientData.peerId = peerId;

        this.roomService.setClientData(email, clientData);
    }

    @SubscribeMessage('joinRoom')
    onJoinRoom(client: Socket, { roomId, avatarUrl, peerId }) {
        const email = client.handshake.query.email as string;
        const room = this.roomService.getRoom(roomId);
        const clientData = this.roomService.getClientData(email);

        if (!room) return;

        client.join(room.id);

        const character = {
            id: client.id,
            session: parseInt(`${Math.random() * 10000}`),
            position: this.roomService.generateRandomPosition(room),
            avatarUrl,
        };

        const video = {
            id: peerId,
            isVideoMuted: true,
            isPlaying: false,
        };

        room.characters.push(character);
        room.videos.push(video);

        client.emit('roomJoined', {
            map: {
                gridDivision: room.gridDivision,
                size: room.size,
                items: room.items,
            },
            characters: room.characters,
            id: client.id,
        });

        this.server.to(room.id).emit('video', room.videos);

        clientData.room = room;
        clientData.character = character;
        clientData.peerId = peerId;
        this.roomService.setClientData(email, clientData);
        this.roomService.onRoomUpdate(email, this.server);
    }

    @SubscribeMessage('leaveRoom')
    onLeaveRoom(client: Socket) {
        const email = client.handshake.query.email as string;
        const cliendData = this.roomService.getClientData(email);
        const room = cliendData.room;
        const peerId = cliendData.peerId;

        if (!room) return;
        client.to(room.id).emit('userDisconnect', peerId);

        client.leave(room.id);

        room.characters.splice(
            room.characters.findIndex((character) => character.id === client.id),
            1,
        );

        room.videos.splice(
            room.videos.findIndex((video) => video.id === cliendData.peerId),
            1,
        );

        if (room.characters.length === 0) {
            this.roomService.removeRoom(room.id);
        }
        this.roomService.onRoomUpdate(email, this.server);

        cliendData.room = null;
        cliendData.character = null;
        cliendData.peerId = null;
        this.roomService.setClientData(email, cliendData);
    }

    @SubscribeMessage('itemsUpdate')
    onItemsUpdate(client: Socket, items: Item[]) {
        const email = client.handshake.query.email as string;
        const clientData = this.roomService.getClientData(email);
        const room = clientData.room;

        if (!items || !room) return;

        room.items = items;
        this.roomService.updateGrid(room);

        room.characters.forEach((character) => {
            character.path = [];
            character.position = this.roomService.generateRandomPosition(room);
        });
        this.server.to(room.id).emit('mapUpdate', {
            map: {
                gridDivision: room.gridDivision,
                size: room.size,
                items: room.items,
            },
            characters: room.characters,
        });
    }

    @SubscribeMessage('move')
    onMove(client: Socket, { from, to }) {
        const email = client.handshake.query.email as string;
        const clientData = this.roomService.getClientData(email);
        const room = clientData.room;
        const character = clientData.character;
        const path = this.roomService.findPath(room, from, to);

        if (!path) return;

        character.position = from;
        character.path = path;
        this.server.to(room.id).emit('playerMove', character);
    }

    @SubscribeMessage('dance')
    onDance(client: Socket, danceName: string) {
        const email = client.handshake.query.email as string;
        const clientData = this.roomService.getClientData(email);
        const room = clientData.room;

        this.server.to(room.id).emit('playerDance', {
            id: email,
            danceName,
        });
    }

    @SubscribeMessage('chatMessage')
    onChatMessage(client: Socket, message: string) {
        const email = client.handshake.query.email as string;
        const clientData = this.roomService.getClientData(email);
        const room = clientData.room;

        if (!room) return;

        this.server.to(room.id).emit('playerChatMessage', {
            id: email,
            message,
        });
    }

    @SubscribeMessage('videoMute')
    onUpdateVideo(client: Socket, isVideoMuted: boolean) {
        const email = client.handshake.query.email as string;
        const clientData = this.roomService.getClientData(email);
        const room = clientData.room;
        const peerId = clientData.peerId;

        if (!room || !room.videos) {
            return;
        }

        const video = room.videos.find((video) => video.id === clientData.peerId);

        video.isVideoMuted = isVideoMuted;
        client.to(room.id).emit('userVideoMute', { peerId, isVideoMuted });
    }

    handleDisconnect(client: Socket) {
        console.log('서버 접속해제');

        const email = client.handshake.query.email as string;
        const cliendData = this.roomService.getClientData(email);
        const room = cliendData.room;
        const peerId = cliendData.peerId;

        if (!room) return;
        client.to(room.id).emit('userDisconnect', peerId);

        client.leave(room.id);

        room.characters.splice(
            room.characters.findIndex((character) => character.id === client.id),
            1,
        );

        room.videos.splice(
            room.videos.findIndex((video) => video.id === cliendData.peerId),
            1,
        );

        if (room.characters.length === 0) {
            this.roomService.removeRoom(room.id);
        }
        this.roomService.onRoomUpdate(email, this.server);

        cliendData.room = null;
        cliendData.character = null;
        cliendData.peerId = null;
        this.roomService.setClientData(email, cliendData);
    }
}
