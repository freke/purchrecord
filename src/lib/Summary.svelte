<script lang="ts">
    import {purchases} from '../stores/purchases';
    import type {Purchase} from '../stores/purchases';
    import {rate} from '../stores/rates';
    import { deleted } from '../stores/deleted';
    import dayjs from 'dayjs';
    import localizedFormat from 'dayjs/plugin/localizedFormat';
    dayjs.extend(localizedFormat);

    function convertToJPY(amount:number, currency:string): number {
        if($rate && currency == 'SEK')
            return amount * $rate.rate;
        return amount
    }

    const thisMonth = dayjs();
    const lastMonth = dayjs().subtract(1,'month');

    $: sum = $purchases ? Object.entries($purchases).filter(([_, value]: [string, Purchase]) => dayjs(value.date).month() === thisMonth.month()).reduce((t, [_, value]: [string, Purchase]) => t + convertToJPY(value.amount, value.currency), 0).toFixed(2) : "0.00";
    $: last_month_sum = $purchases ? Object.entries($purchases).filter(([_, value]: [string, Purchase]) => dayjs(value.date).month() === lastMonth.month()).reduce((t, [_, value]: [string, Purchase]) => t + convertToJPY(value.amount, value.currency), 0).toFixed(2) : "0.00";
    $: all_synced = (Object.entries($purchases).reduce((t, [_,value]: [string, Purchase]) => t && value.sync, true) && $deleted.length === 0)
</script>

<i class="absolute right top" class:red-text={!all_synced} class:green-text={all_synced}>{all_synced ? 'check_circle' : 'error'}</i>
<h5>Total {thisMonth.format('MMM')}: {sum} JPY</h5>
<h7>Total {lastMonth.format('MMM')}: {last_month_sum} JPY</h7>
