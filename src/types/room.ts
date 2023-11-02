export type RoomFormDataType = {
    id: string;
    email: string;
    roomName: string;
    password?: string;
    roomLimitPeople: number;
    avatarUrl: string;
};

export type Character = {
    id: string;
    session: number;
    position: number[];
    avatarUrl: string;
    path?: number[][];
};

export type Room = RoomFormDataType & {
    size: number[];
    gridDivision: number;
    characters: Character[];
    videos: any;
    grid: any;
};

export type LoadRoomSendData = {
    map: {
        gridDivision: number;
        size: number[];
    };
    characters: any[];
    id: string;
    password?: string;
};
