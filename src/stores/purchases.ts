import { writable } from 'svelte/store';

export interface Purchase {
    id: string;
    date: Date;
    category: string;
    currency: string;
    amount: number;
    note: string;
    image: string;
    sync: boolean;
    row: number;
}

const stored = localStorage.getItem('purchases')
let purchases_obj = JSON.parse(stored) || {} as { [key: string]: Purchase };
if(purchases_obj){
    Object.entries(purchases_obj).forEach(([key, value]) => {value.date = new Date(value.date);})
}
export const purchases = writable<{ [id: string]: Purchase }>(purchases_obj || {});
purchases.subscribe((value) => localStorage.purchases = JSON.stringify(value));
