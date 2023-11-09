export type RoomFormDataType = {
    id: string;
    email: string;
    roomName: string;
    password?: string;
    roomLimitPeople: number;
    avatarUrl: string;
    peerId?: string;
    userName?: string;
};

export type Character = {
    id: string;
    session: number;
    position: number[];
    avatarUrl: string;
    path?: number[][];
};

export type Item = {
    name: string;
    size: [number, number];
    wall?: boolean;
    walkable?: boolean;
    rotation?: number;
    gridPosition?: number[];
};

export type Items = {
    [key: string]: Item;
};

export type Room = RoomFormDataType & {
    size: number[];
    gridDivision: number;
    characters: Character[];
    videos: any;
    grid: any;
    items: Item[];
};

export type Video = {
    id: string;
    isVideoMuted: boolean;
};

export type LoadRoomSendData = {
    map: {
        gridDivision: number;
        size: number[];
        items: Item[];
    };
    characters: any[];
    videos: Video[];
    id: string;
    password?: string;
};
