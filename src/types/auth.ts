import { UserDocument } from 'src/user/user.schema';

export type AuthUserType = Omit<UserDocument, 'password'>;
export type AuthJwtPayloadType = AuthUserType & { sub: string };
