import lowdb from 'lowdb';
import FileAsync from 'lowdb/adapters/FileAsync';

export interface Data {
    created: number;
    host: string;
    status: boolean;
    duration?: number;
    error?: string;
}

interface DB {
    data: Data[],
    servers: string[]
}

async function setupDb() {
    let adapter = new FileAsync<DB>('db.json');
    let db = await lowdb(adapter);
    return db;
};

export default setupDb;