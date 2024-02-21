<script lang="ts">
    import {rate, convertToJPY} from '../../stores/rates';
    import dayjs from 'dayjs';
    import localizedFormat from 'dayjs/plugin/localizedFormat';
    dayjs.extend(localizedFormat);

    import { Heading, Listgroup, ListgroupItem } from 'flowbite-svelte';
    import type { IPurchase } from '../db';


    export let month = dayjs()
    export let purchases: IPurchase[] = []

    function sum_categories(r, p: IPurchase[]) {
        return p.reduce((acc, cur) => {
            const existing = acc.find((item) => item.category === cur.payment.category);
            if (existing) {
                existing.amount += convertToJPY(r, cur.payment.amount, cur.payment.currency.currency);
            } else {
                acc.push({ category: cur.payment.category, amount: convertToJPY(r, cur.payment.amount, cur.payment.currency.currency) });
            }
            return acc;
        }, []).sort((a, b) => a.category.localeCompare(b.category));
    }

    $: sum = purchases ? purchases.reduce((t, value: IPurchase) => t + convertToJPY($rate, value.payment.amount, value.payment.currency.currency), 0).toFixed(2) : "0.00";

    $: sum_category = sum_categories($rate, purchases);
</script>

<Heading tag="h2">Total {month.format('MMM')}: {sum}¥</Heading>
<Listgroup class="m-4">
{#each sum_category as category}
        <ListgroupItem class="flex flex-row space-x-2">
            <div class="basis-full">{category.category}</div><div>{category.amount.toFixed(2)}¥</div>
        </ListgroupItem>
{/each}
</Listgroup>