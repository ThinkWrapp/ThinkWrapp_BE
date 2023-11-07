import { Injectable } from '@nestjs/common';
import { PeerServerEvents, PeerServer } from 'peer';

@Injectable()
export class PeerService {
    private server: PeerServerEvents;

    constructor() {
        this.server = PeerServer({ port: 9000, path: '/peer' });
    }

    getServer() {
        return this.server;
    }
}
