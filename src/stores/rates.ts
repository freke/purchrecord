import dayjs from "dayjs";
import { writable, get } from 'svelte/store';

const cache = JSON.parse(localStorage.getItem('rate'));

let rate_obj = new Promise<{ [currency: string]: {rate: number, date: Date}}>(() => {});

if(!cache||
    !cache['JPY'] ||
    cache['JPY'].date == null ||
    dayjs().unix()  - dayjs(cache['JPY'].date).unix() > 86400
){
    rate_obj = update_rates();
}

async function update_rates() {
    const response = await fetch(
      "https://v6.exchangerate-api.com/v6/2a8dab30a85314fff7fabb79/latest/JPY"
    );
    const data = await response.json();
    const rate = { 
      'JPY': { rate: 1/data.conversion_rates.JPY, date: new Date() },
      'SEK': { rate: 1/data.conversion_rates.SEK, date: new Date() },
      'DKK': { rate: 1/data.conversion_rates.DKK, date: new Date() },
      'GBP': { rate: 1/data.conversion_rates.GBP, date: new Date() },
    };
    localStorage.rate = JSON.stringify(rate);
    return rate;
}

export function convertToJPY(amount:number, currency:string): number {
    const currentValue = get(rate);
    if(!currentValue) return 0;
    return amount * currentValue[currency].rate;
}

function createRateStore() {
    const { subscribe, set } = writable<{ [currency: string]: {rate: number, date: Date}}>(null);

    set(null);
    rate_obj.then((rate) => set(rate));

    return {
        subscribe
    }
}

export const rate = createRateStore();