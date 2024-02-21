import { v4 as uuidv4 } from 'uuid';
import Dexie, { type Table } from 'dexie';
import dayjs from 'dayjs';

export interface IPurchase {
    id: string,
    date: number,
    payment: IPayment,
    priv: boolean,
    note?: string,
    file?: string,
    sync?: ISync,
    resolved?: IResolved
}

export interface IBudget {
    id: string,
    year: number,
    month: number,
    category: string,
    amount: number
}

export interface ICurrency {
    id: string,
    currency: string,
    rate: number
}

export interface IPayment {
    id: string,
    category: string,
    amount: number,
    currency: ICurrency,
    paid?: string,
    method?: string
}

export interface IResolved {
    id: string,
    date: number
}

export interface ISync {
    id: string,
    date: number
}

export class PurchaseDatabase extends Dexie {   
    purchases!: Table<IPurchase, string>;
    budgets!: Table<IBudget, string>;
    currencies!: Table<ICurrency, string>;
    payments!: Table<IPayment, string>;
    resolved!: Table<IResolved, string>;
    sync!: Table<ISync, string>;

    constructor() {
        super('PurchaseRecordDatabase');
        this.version(1).stores({
            purchases: '&id, date, resolved, priv, sync',
            bugdets: '&id, year, month',
            currencies: '&id, currency',
            payments: '&id, paid, method',
            resolved: '&id, date',
            sync: '&id, date'
        });
    }
}

export class Payment implements IPayment {
    id: string;
    category: string;
    amount: number;
    currency: ICurrency;
    paid?: string;
    method?: string;

    constructor({id = null, category, amount, currency, paid, method}:
            {id?: string, category: string, amount: number, currency: ICurrency, paid?: string, method?: string}) {
        if(id) this.id = id;
        this.category = category;
        this.amount = amount;
        this.currency = currency;
        if(paid) this.paid = paid;
        if(method) this.method = method;
    }
}

export class Purchase implements IPurchase {
    id: string;
    date: number;
    payment: IPayment;
    priv: boolean;
    note?: string;
    file?: string;
    sync?: ISync;
    resolved?: IResolved;

    constructor({id = null, date = null, payment, priv = false, note, file, sync, resolved}:
            {id?: string, date?: number, payment: IPayment, priv?: boolean, note?: string, file?: string, sync?: ISync, resolved?: IResolved}) {
        if (id) this.id = id;
        else this.id = uuidv4();
        if (date) this.date = date;
        else this.date = dayjs().unix();
        this.payment = payment;
        this.priv = priv;
        if (note) this.note = note;
        if (file) this.file = file;
        if(sync) this.sync = sync;
        if(resolved) this.resolved = resolved;
    }
}

export class Currency implements ICurrency {
    id: string;
    currency: string;
    rate: number;

    constructor({id = null, currency, rate}:
            {id?: string, currency: string, rate: number}) {
        if (id) this.id = id;
        else this.id = uuidv4();
        this.currency = currency;
        this.rate = rate;
    }
}

export const db = new PurchaseDatabase();
db.purchases.mapToClass(Purchase);