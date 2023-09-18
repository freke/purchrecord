<script lang="ts">
    import dayjs from "dayjs";

    import {purchases, type Purchase} from '../stores/purchases';
    import {rate, convertToJPY} from '../stores/rates';

    let currentMonth = dayjs().startOf("month");

    function isInCurrentMonth(date): boolean {
        const currentDate = dayjs();
        return currentDate.month() === date.month();
    }

    function nextMonth() {
        currentMonth = currentMonth.add(1, "month");
    }

    function prevMonth() {
        currentMonth = currentMonth.subtract(1, "month");
    }

    function purchases_categories(purchases: {[id: string]: Purchase}, year, month) {
        return Array.from(new Set(
        Object.entries(purchases)
            .filter(([, p]: [string, Purchase]) => dayjs(p.date).year() == year && (month == null || dayjs(p.date).month() == month))
            .map(([, p]: [string, Purchase]) => p.category)
        )).map((c) => {return {name: c, selected: true}}).sort((a, b) => a.name.localeCompare(b.name));
    }

    function filter_private(value){
        return !(value.category.toLowerCase().includes("naoko") || value.category.toLowerCase().includes("david"))
    }

    function filter_current_month(value){
        return dayjs(value.date).month() == currentMonth.month();
    }

    function filter_selected_category(value, categories){
        return categories.find(c => c.name == value.category).selected
    }

    function filer_payer(value, payer){
        if((value.paid?.toLowerCase().includes("amex") && value.paid?.toLowerCase().includes("david")) || false){
            if(payer == "naoko") {
                return true
            } else {
                return false
            }
        } else {
            return value.paid?.toLowerCase().includes(payer) || false
        }
    }

    function filter_amex(value, payer) {
        if((value.category.toLowerCase().includes(payer) && value.paid?.toLowerCase().includes("amex") && value.paid?.toLowerCase().includes(payer)) || false){
        }
    }


    function get_purchases(rate, categories, payer){
        return $purchases ? Object.entries($purchases)
            .filter(([_, value]: [string, Purchase]) => filter_current_month(value) )
            .filter(([_, value]: [string, Purchase]) =>  filter_selected_category(value, categories) )
            .filter(([_, value]: [string, Purchase]) => filer_payer(value, payer))
            .filter(([_, value]: [string, Purchase]) => filter_private(value))
            .reduce((t, [_, value]: [string, Purchase]) => {
                let i = t.findIndex(c => c.category == value.category)
                if (i >= 0){
                    t[i] = {category: t[i].category, amount: t[i].amount + convertToJPY(rate, value.amount, value.currency)}
                }else{
                    t.push({category: value.category, amount: convertToJPY(rate, value.amount, value.currency)})
                }
                return t
            }, []).sort((a, b) => {
                if (a.category < b.category){
                    return -1;
                } else if (a.category > b.category){
                    return 1;
                }
                return 0;
            }) : []
    }

    function private_purchase_david(rate, categories){
        const payer = "david";
        return $purchases ? Object.entries($purchases)
            .filter(([_, value]: [string, Purchase]) => filter_current_month(value) )
            .filter(([_, value]: [string, Purchase]) =>  filter_selected_category(value, categories) )
            .filter(([_, value]: [string, Purchase]) => filter_amex(value, payer))
            .reduce((t, [_, value]: [string, Purchase]) => {
                let i = t.findIndex(c => c.category == value.category)
                if (i >= 0){
                    t[i] = {category: t[i].category, amount: t[i].amount + convertToJPY(rate, value.amount, value.currency)}
                }else{
                    t.push({category: value.category, amount: convertToJPY(rate, value.amount, value.currency)})
                }
                return t
            }, []).sort((a, b) => {
                if (a.category < b.category){
                    return -1;
                } else if (a.category > b.category){
                    return 1;
                }
                return 0;
            }) : []
    }

    function total(categories) {
        return categories.reduce((acc, value) => value.amount + acc, 0)
    }

    $: categories =  purchases_categories($purchases, currentMonth.year(), currentMonth.month());

    $: david_p = get_purchases($rate, categories, "david");
    $: naoko_p = get_purchases($rate, categories, "naoko");
    $: david = total(david_p);
    $: naoko = total(naoko_p);
    $: david_priv = private_purchase_david($rate, categories);
    $: david_priv_amex = total(david_priv);
</script>

<article>
<nav class="no-space">
    <button class="border left-round max" on:click={prevMonth}>
      <i>navigate_before</i>
    </button>
    <button
      class="border no-round max"
      class:fill={isInCurrentMonth(currentMonth)}
    >
      <span>{currentMonth.format("MMM YYYY")}</span>
    </button>
    <button class="border right-round max" on:click={nextMonth}>
      <i>navigate_next</i>
    </button>
  </nav>

  <div class="grid">
    <div class="s12 m6">
        <article>
            <h5>David Expenses</h5>
            <div class="grid">
                {#each david_p as d }
                    <div class="s6">{d.category}:</div><div class="s6">{d.amount.toFixed(2)}¥</div>
                {/each}
                <div class="space" />
                <div class="s12"><b>Private with AMEX:</b></div>
                {#each david_priv as d }
                    <div class="s6">{d.category}:</div><div class="s6">{d.amount.toFixed(2)}¥</div>
                {/each}
            </div>
            <div class="space" />
            <div><b>Total David: {david.toFixed(2)}¥</b></div>
        </article>
        </div>
        <div class="s12 m6">
        <article>
            <h5>Naoko Expenses</h5>
            <div class="grid">
            {#each naoko_p as n }
                <div class="s6">{n.category}:</div><div class="s6">{n.amount.toFixed(2)}¥</div>
            {/each}
            </div>
            <div class="space" />
            <div><b>Total Naoko: {naoko.toFixed(2)}¥</b></div>
        </article>
    </div>
</div>

<div class="space" />

    {#if david > (naoko+david_priv_amex)}
        <div>
            <b>Naoko pay David {((david - naoko)/2).toFixed(2)}¥</b>
        </div>
    {:else if david < naoko}
        <div>
            <b>David pay Naoko {((naoko - david)/2 + david_priv_amex).toFixed(2)}¥</b>
        </div>
    {:else}
        <div><b>Nothing to pay</b></div>
    {/if}
</article>