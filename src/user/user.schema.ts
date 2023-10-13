import { Prop, Schema, SchemaFactory, SchemaOptions } from '@nestjs/mongoose';
import { Document } from 'mongoose';

export type UserDocument = User & Document;

const options: SchemaOptions = {
    timestamps: true,
};

@Schema(options)
export class User {
    @Prop({ required: true })
    username: string;

    @Prop({ required: true, unique: true })
    email: string;

    @Prop()
    password: string;

    @Prop()
    providerId: string;

    @Prop({
        type: [String],
        default: ['user'],
    })
    roles: string[];
}

export const UserSchema = SchemaFactory.createForClass(User);
