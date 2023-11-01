export type RoomFormDataType = {
    id: string;
    email: string;
    roomName: string;
    password?: string;
    roomLimitPeople: number;
    avatarUrl: string;
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
