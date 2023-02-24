import { writable } from 'svelte/store';

export interface DelPurchase {
    id: string;
    row: number;
}

const deleted_obj = JSON.parse(localStorage.getItem('deleted'));
export const deleted = writable<DelPurchase[]>(deleted_obj || []);
deleted.subscribe((value) => localStorage.deleted = JSON.stringify(value));
