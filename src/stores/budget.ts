import { writable } from 'svelte/store';

export interface Budget {
    year: number;
    categories: [
        {
            name: string;
            row: {
                month: number;
                value: number;
            }[];
        }
    ]
}

const budget_obj = JSON.parse(localStorage.getItem('budget'));
export const budget = writable<Budget[]>(budget_obj || []);
budget.subscribe((value) => localStorage.budget = JSON.stringify(value));