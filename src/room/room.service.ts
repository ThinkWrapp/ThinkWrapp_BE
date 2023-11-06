import * as pathfinding from 'pathfinding';
import { Injectable } from '@nestjs/common';
import { Items, Room, RoomFormDataType } from 'src/types/room';
import { Server } from 'socket.io';
import { ClientsType } from 'src/types/auth';

@Injectable()
export class RoomService {
    private rooms = [];
    private clients = new Map<string, ClientsType>();
    private finder = new pathfinding.AStarFinder({
        allowDiagonal: true,
        dontCrossCorners: true,
    });
    private items: Items = {
        washer: {
            name: 'washer',
            size: [2, 2],
        },
        toiletSquare: {
            name: 'toiletSquare',
            size: [2, 2],
        },
        trashcan: {
            name: 'trashcan',
            size: [1, 1],
        },
        bathroomCabinetDrawer: {
            name: 'bathroomCabinetDrawer',
            size: [2, 2],
        },
        bathtub: {
            name: 'bathtub',
            size: [4, 2],
        },
        bathroomMirror: {
            name: 'bathroomMirror',
            size: [2, 1],
            wall: true,
        },
        bathroomCabinet: {
            name: 'bathroomCabinet',
            size: [2, 1],
            wall: true,
        },
        bathroomSink: {
            name: 'bathroomSink',
            size: [2, 2],
        },
        showerRound: {
            name: 'showerRound',
            size: [2, 2],
        },
        tableCoffee: {
            name: 'tableCoffee',
            size: [4, 2],
        },
        loungeSofaCorner: {
            name: 'loungeSofaCorner',
            size: [5, 5],
            rotation: 2,
        },
        bear: {
            name: 'bear',
            size: [2, 1],
            wall: true,
        },
        loungeSofaOttoman: {
            name: 'loungeSofaOttoman',
            size: [2, 2],
        },
        tableCoffeeGlassSquare: {
            name: 'tableCoffeeGlassSquare',
            size: [2, 2],
        },
        loungeDesignSofaCorner: {
            name: 'loungeDesignSofaCorner',
            size: [5, 5],
            rotation: 2,
        },
        loungeDesignSofa: {
            name: 'loungeDesignSofa',
            size: [5, 2],
            rotation: 2,
        },
        loungeSofa: {
            name: 'loungeSofa',
            size: [5, 2],
            rotation: 2,
        },
        bookcaseOpenLow: {
            name: 'bookcaseOpenLow',
            size: [2, 1],
        },
        bookcaseClosedWide: {
            name: 'bookcaseClosedWide',
            size: [3, 1],
            rotation: 2,
        },
        bedSingle: {
            name: 'bedSingle',
            size: [3, 6],
            rotation: 2,
        },
        bench: {
            name: 'bench',
            size: [2, 1],
            rotation: 2,
        },
        bedDouble: {
            name: 'bedDouble',
            size: [5, 5],
            rotation: 2,
        },
        benchCushionLow: {
            name: 'benchCushionLow',
            size: [2, 1],
        },
        loungeChair: {
            name: 'loungeChair',
            size: [2, 2],
            rotation: 2,
        },
        cabinetBedDrawer: {
            name: 'cabinetBedDrawer',
            size: [1, 1],
            rotation: 2,
        },
        cabinetBedDrawerTable: {
            name: 'cabinetBedDrawerTable',
            size: [1, 1],
            rotation: 2,
        },
        table: {
            name: 'table',
            size: [4, 2],
        },
        tableCrossCloth: {
            name: 'tableCrossCloth',
            size: [4, 2],
        },
        plant: {
            name: 'plant',
            size: [1, 1],
        },
        plantSmall: {
            name: 'plantSmall',
            size: [1, 1],
        },
        rugRounded: {
            name: 'rugRounded',
            size: [6, 4],
            walkable: true,
        },
        rugRound: {
            name: 'rugRound',
            size: [4, 4],
            walkable: true,
        },
        rugSquare: {
            name: 'rugSquare',
            size: [4, 4],
            walkable: true,
        },
        rugRectangle: {
            name: 'rugRectangle',
            size: [8, 4],
            walkable: true,
        },
        televisionVintage: {
            name: 'televisionVintage',
            size: [4, 2],
            rotation: 2,
        },
        televisionModern: {
            name: 'televisionModern',
            size: [4, 2],
            rotation: 2,
        },
        kitchenFridge: {
            name: 'kitchenFridge',
            size: [2, 1],
            rotation: 2,
        },
        kitchenFridgeLarge: {
            name: 'kitchenFridgeLarge',
            size: [2, 1],
        },
        kitchenBar: {
            name: 'kitchenBar',
            size: [2, 1],
        },
        kitchenCabinetCornerRound: {
            name: 'kitchenCabinetCornerRound',
            size: [2, 2],
        },
        kitchenCabinetCornerInner: {
            name: 'kitchenCabinetCornerInner',
            size: [2, 2],
        },
        kitchenCabinet: {
            name: 'kitchenCabinet',
            size: [2, 2],
        },
        kitchenBlender: {
            name: 'kitchenBlender',
            size: [1, 1],
        },
        dryer: {
            name: 'dryer',
            size: [2, 2],
        },
        chairCushion: {
            name: 'chairCushion',
            size: [1, 1],
            rotation: 2,
        },
        chair: {
            name: 'chair',
            size: [1, 1],
            rotation: 2,
        },
        deskComputer: {
            name: 'deskComputer',
            size: [3, 2],
        },
        desk: {
            name: 'desk',
            size: [3, 2],
        },
        chairModernCushion: {
            name: 'chairModernCushion',
            size: [1, 1],
            rotation: 2,
        },
        chairModernFrameCushion: {
            name: 'chairModernFrameCushion',
            size: [1, 1],
            rotation: 2,
        },
        kitchenMicrowave: {
            name: 'kitchenMicrowave',
            size: [1, 1],
        },
        coatRackStanding: {
            name: 'coatRackStanding',
            size: [1, 1],
        },
        kitchenSink: {
            name: 'kitchenSink',
            size: [2, 2],
        },
        lampRoundFloor: {
            name: 'lampRoundFloor',
            size: [1, 1],
        },
        lampRoundTable: {
            name: 'lampRoundTable',
            size: [1, 1],
        },
        lampSquareFloor: {
            name: 'lampSquareFloor',
            size: [1, 1],
        },
        lampSquareTable: {
            name: 'lampSquareTable',
            size: [1, 1],
        },
        toaster: {
            name: 'toaster',
            size: [1, 1],
        },
        kitchenStove: {
            name: 'kitchenStove',
            size: [2, 2],
        },
        laptop: {
            name: 'laptop',
            size: [1, 1],
        },
        radio: {
            name: 'radio',
            size: [1, 1],
        },
        speaker: {
            name: 'speaker',
            size: [1, 1],
        },
        speakerSmall: {
            name: 'speakerSmall',
            size: [1, 1],
            rotation: 2,
        },
        stoolBar: {
            name: 'stoolBar',
            size: [1, 1],
        },
        stoolBarSquare: {
            name: 'stoolBarSquare',
            size: [1, 1],
        },
    };

    generateRandomPosition(room: Room) {
        for (let i = 0; i < 100; i++) {
            const x = Math.floor(Math.random() * room.size[0] * room.gridDivision);
            const y = Math.floor(Math.random() * room.size[1] * room.gridDivision);
            if (room.grid.isWalkableAt(x, y)) {
                return [x, y];
            }
        }
    }

    findPath(room: Room, start: number[], end: number[]) {
        const gridClone = room.grid.clone();
        const path = this.finder.findPath(start[0], start[1], end[0], end[1], gridClone);
        return path;
    }

    updateGrid(room: Room) {
        for (let x = 0; x < room.size[0] * room.gridDivision; x++) {
            for (let y = 0; y < room.size[1] * room.gridDivision; y++) {
                room.grid.setWalkableAt(x, y, true);
            }
        }

        room.items.forEach((item) => {
            if (item.walkable || item.wall) {
                return;
            }
            const width =
                item.rotation === 1 || item.rotation === 3 ? item.size[1] : item.size[0];
            const height =
                item.rotation === 1 || item.rotation === 3 ? item.size[0] : item.size[1];
            for (let x = 0; x < width; x++) {
                for (let y = 0; y < height; y++) {
                    room.grid.setWalkableAt(
                        item.gridPosition[0] + x,
                        item.gridPosition[1] + y,
                        false,
                    );
                }
            }
        });
    }

    onRoomUpdate(email: string, server: Server) {
        const clientData = this.getClientData(email);
        const room = clientData.room;

        server.to(room.id).emit('character', room.characters);
        server.to(room.id).emit('video', room.videos);

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
            items: [],
            characters: [],
            videos: [],
            grid: new pathfinding.Grid(size[0] * gridDivision, size[1] * gridDivision),
        };

        this.rooms.push(room);
    }

    getItems() {
        return this.items;
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
