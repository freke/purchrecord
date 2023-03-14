import { writable, get } from 'svelte/store';

const rate_obj = JSON.parse(localStorage.getItem('rate'));
const rate_date = rate_obj ? new Date(rate_obj.date) : null;
export const rate = writable<{rate: number, date: Date}>(rate_obj ? {...rate_obj, date: rate_date} : null);
rate.subscribe((value) => localStorage.rate = JSON.stringify(value));

export function convertToJPY(amount:number, currency:string): number {
    const currentValue = get(rate);
    if(currentValue && currency == 'SEK')
        return amount * currentValue.rate;
    return amount
}