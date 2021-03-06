import { Singleton } from "typescript-ioc";
import * as _ from "lodash";
import { Inject } from "typescript-ioc";
import { DataBaseSDK } from "./../../sdks/DataBaseSDK";
import { ISystemQueue, INetworkQueue, IQuery, IUpdateQuery } from './IQueue';
const dbName = 'queue';
export enum QUEUE_TYPE {
    System = "SYSTEM",
    Network = "NETWORK"
};

@Singleton
export class Queue {

    @Inject
    private dbSDK: DataBaseSDK;

    enQueue(data: ISystemQueue | INetworkQueue, docId: string = '') {
        return this.dbSDK.insertDoc(dbName, data, docId)
            .then(result => result.id)
            .catch(err => { throw this.dbSDK.handleError(err); });
    }

    updateQueue(docId: string, query: IUpdateQuery) {
        return this.dbSDK.updateDoc(dbName, docId, query);
    }

    deQueue(id: string) {
        return this.dbSDK.delete(dbName, id);
    }

    length() {
        return this.dbSDK.list(dbName)
            .then(result => _.get(result, 'rows.length'))
            .catch(err => { throw this.dbSDK.handleError(err); });
    }

    getById(id: string) {
        return this.dbSDK.getDoc(dbName, id)
            .then(result => result.docs)
            .catch(err => { throw this.dbSDK.handleError(err); });
    }

    getByQuery(query: IQuery) {
        return this.dbSDK.find(dbName, query)
            .then(result => result.docs)
            .catch(err => { throw this.dbSDK.handleError(err); });
    }
}

export * from './IQueue';
