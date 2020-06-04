process.env.NTBA_FIX_319="1";
import { from, interval, of, Observable, bindCallback } from "rxjs";
import { flatMap, toArray, map } from "rxjs/operators";
import dns from 'dns';
import DB, { Data } from './db';

require('dotenv').config();
require('./telegram');

// Endpoints to hit. Default is www.google.com
const hosts: Array<string> = process.env.HOSTS?.split(" ") || ["www.google.com"];
const INTERVAL = 10000;
async function checkConnection(host: string): Promise<Data> {
    return new Promise((resolve: any, reject: any) => {
    let startTime = new Date().getTime();
    dns.resolve4(host, (err, value) => {
            if (err) resolve({created: startTime, host, error: err.code, status: false });
            let duration = new Date().getTime() - startTime;
            if (value) resolve({created: startTime, host: value[0], duration, status: true});
        } );
    })
}

(async () => {
    try {
    let db = await DB();
    if (!db.has('data').value()) db.set('data', []).write();
    let servers = dns.getServers();
    db.set('servers', servers).write();

    let loop$ = interval(INTERVAL);
    loop$.subscribe(
        () => from(hosts).pipe(
            flatMap(checkConnection),
        ).subscribe((result) => {
            let data: Array<Data> = db.get('data').value();
            db.set('data', [result, ...data.slice(0, 17280 * hosts.length)]).write();
        }, 
        error => {
            console.log("Observable", error);
        })
        );
    } catch(error) {
        console.log(error);
    }
})();
