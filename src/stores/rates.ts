import { writable, get } from 'svelte/store';

const rate_obj = JSON.parse(localStorage.getItem('rate'));
export const rate = writable<{ [currency: string]: {rate: number, date: Date} }>(rate_obj);
rate.subscribe((value) => localStorage.rate = JSON.stringify(value));

export function convertToJPY(amount:number, currency:string): number {
    const currentValue = get(rate);
    return amount * currentValue[currency].rate;
}