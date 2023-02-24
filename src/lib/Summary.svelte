<script lang="ts">
    import {purchases} from '../stores/purchases';
    import {rate} from '../stores/rates';
    import { deleted } from '../stores/deleted';

    function convertToJPY(amount, currency) {
        if($rate && currency == 'SEK')
            return amount * $rate.rate;
        return amount
    }

    const thisMonth = new Date();
    const lastMonth = new Date(new Date().setMonth(new Date().getMonth() - 1));

    $: sum = $purchases ? Object.entries($purchases).filter(([_, value]) => value.date.getMonth() === thisMonth.getMonth()).reduce((t, [_, value]) => t + parseFloat(convertToJPY(value.amount, value.currency)), 0) : 0;
    $: last_month_sum = $purchases ? Object.entries($purchases).filter(([_, value]) => value.date.getMonth() === lastMonth.getMonth()).reduce((t, [_, value]) => t + parseFloat(convertToJPY(value.amount, value.currency)), 0) : 0;
    $: all_synced = (Object.entries($purchases).reduce((t, [_,value]) => t && value.sync, true) && $deleted.length === 0)
</script>

<i class="absolute right top" class:red-text={!all_synced} class:green-text={all_synced}>{all_synced ? 'check_circle' : 'error'}</i>
<h5>Total {thisMonth.toLocaleString('default', { month: 'short' })}: {sum.toFixed(2)} JPY</h5>
<h7>Total {lastMonth.toLocaleString('default', { month: 'short' })}: {last_month_sum.toFixed(2)} JPY</h7>
