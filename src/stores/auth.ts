import { writable } from 'svelte/store';

export type User = {
    picture: string,
    name: string,
    email: string,
    sub: string,
}
export const user = writable<User|null>(null);