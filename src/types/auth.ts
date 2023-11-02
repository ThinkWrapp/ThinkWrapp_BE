import { UserDocument } from 'src/user/user.schema';
import { Character, Room } from './room';

export type AuthUserType = Omit<UserDocument, 'password'>;
export type AuthJwtPayloadType = AuthUserType & { sub: string };
export type ClientsType = {
    room: Room;
    character: Character;
    peerId: string;
};
