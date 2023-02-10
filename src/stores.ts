import { writable } from 'svelte/store';

export interface Purchase {
    id: string;
    date: string;
    category: string;
    currency: string;
    amount: number;
    sync: boolean;
}

export const purchases = writable<{ [id: string]: Purchase }>(JSON.parse(localStorage.getItem('purchases')));
purchases.subscribe((value) => localStorage.purchases = JSON.stringify(value));

const obj = JSON.parse(localStorage.getItem('rate'));
const date = obj ? new Date(obj.date) : null;
export const rate = writable<{rate: number, date: Date}>(obj ? {...obj, date} : null);
rate.subscribe((value) => localStorage.rate = JSON.stringify(value));