<script lang="ts">
    import {purchases} from '../stores/purchases';
    import type {Purchase} from '../stores/purchases';
    import {convertToJPY} from '../stores/rates';
    import dayjs from 'dayjs';
    import localizedFormat from 'dayjs/plugin/localizedFormat';
    dayjs.extend(localizedFormat);

    export let month = dayjs()
    export let pur = []

    $: lastMonth = month.subtract(1,'month');
    $: sum = $purchases ? Object.entries($purchases).filter(([_, value]: [string, Purchase]) => dayjs(value.date).month() === month.month()).reduce((t, [_, value]: [string, Purchase]) => t + convertToJPY(value.amount, value.currency), 0).toFixed(2) : "0.00";
    $: last_month_sum = $purchases ? Object.entries($purchases).filter(([_, value]: [string, Purchase]) => dayjs(value.date).month() === lastMonth.month()).reduce((t, [_, value]: [string, Purchase]) => t + convertToJPY(value.amount, value.currency), 0).toFixed(2) : "0.00";

    $: sum_category = pur.reduce((acc, cur) => {
        const existing = acc.find((item) => item.category === cur.category);
        if (existing) {
            existing.amount += convertToJPY(cur.amount, cur.currency);
        } else {
            acc.push({ category: cur.category, amount: convertToJPY(cur.amount, cur.currency) });
        }
        return acc;
    }, []).sort((a, b) => a.category.localeCompare(b.category));
</script>

<h5>Total {month.format('MMM')}: {sum} JPY</h5>
<h7>Total {lastMonth.format('MMM')}: {last_month_sum} JPY</h7>
<div class="space"></div>
{#each sum_category as category}
        <div class="row"><div class="max">{category.category}</div><div>{category.amount.toFixed(2)} JPY</div> </div>
        <div class="divider"></div>
{/each}
