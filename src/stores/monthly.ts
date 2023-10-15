import { writable } from 'svelte/store';

export interface MonthlyTransfer {
    saved: boolean,
    date: string,
    naoko: {category: string, amount: number}[],
    naoko_private: {category: string, amount: number}[],
    david: {category: string, amount: number}[],
    david_private: {category: string, amount: number}[],
}

const monthly_obj = JSON.parse(localStorage.getItem('monthly'));
export const monthly = writable<MonthlyTransfer[]>(monthly_obj || []);
monthly.subscribe((value) => localStorage.monthly = JSON.stringify(value));