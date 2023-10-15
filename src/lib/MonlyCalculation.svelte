<script lang="ts">
    import dayjs from "dayjs";

    import {purchases, type Purchase} from '../stores/purchases';
    import {rate, convertToJPY} from '../stores/rates';
    import { Button, ButtonGroup, Card, Heading, Hr, P } from 'flowbite-svelte';
    import { ChevronLeftOutline, ChevronRightOutline } from 'flowbite-svelte-icons';
    import { monthly } from "../stores/monthly";

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
        const result = categories.find(c => c.name == value.category)
        if (result) {
            return result.selected;
        }
        return false;
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
        return (value.category.toLowerCase().includes(payer) && value.paid?.toLowerCase().includes("amex") && value.paid?.toLowerCase().includes(payer)) || false
    }


    function get_purchases(rate, categories, payer) : {category: string, amount: number}[]{
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

    function private_purchase_david(rate, categories) : {category: string, amount: number}[]{
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

    function get_monthly(monthly, month) {
        const foundTransfer = monthly.filter(transfer => transfer.date === month.format("MMM YYYY"));
        return foundTransfer[0] || null;
    }

    function save_monthly() {
        let monthly_to_save = {
            saved: false,
            date: currentMonth.format("MMM YYYY"),
            david: david_p,
            naoko: naoko_p,
            naoko_private: [],
            david_private: david_priv,
        }
        $monthly.push(monthly_to_save)
        $monthly = $monthly
    }

    function get_this_monthly_totals(this_monthly) {
        if(!this_monthly)
            return {david: 0, david_private: 0, naoko: 0};

        return {
            david: this_monthly.david.reduce((acc, value) => value.amount + acc, 0),
            david_private: this_monthly.david_private.reduce((acc, value) => value.amount + acc, 0),
            naoko: this_monthly.naoko.reduce((acc, value) => value.amount + acc, 0),
        }
    }

    $: this_monthly = get_monthly($monthly, currentMonth);
    $: this_month_totals = get_this_monthly_totals(this_monthly);

    $: categories =  purchases_categories($purchases, currentMonth.year(), currentMonth.month());

    $: david_p = get_purchases($rate, categories, "david");
    $: naoko_p = get_purchases($rate, categories, "naoko");
    $: david = total(david_p);
    $: naoko = total(naoko_p);
    $: david_priv = private_purchase_david($rate, categories);
    $: david_priv_amex = total(david_priv);
</script>


<div class="my-4">
  <ButtonGroup>
    <Button on:click={prevMonth}>
      <ChevronLeftOutline />
    </Button>
    <Button color={isInCurrentMonth(currentMonth)?"primary":"alternative"}>
      <span>{currentMonth.format("MMM YYYY")}</span>
    </Button>
    <Button on:click={nextMonth}>
      <ChevronRightOutline />
    </Button>
  </ButtonGroup>
</div>

{#if this_monthly}
    {#if this_month_totals.david > (this_month_totals.naoko+this_month_totals.david_private)}
        <div>
            <b>Naoko payed David {((this_month_totals.david - this_month_totals.naoko)/2).toFixed(2)}¥</b>
        </div>
    {:else if this_month_totals.david < (this_month_totals.naoko+this_month_totals.david_private)}
        <div>
            <b>David payed Naoko {((this_month_totals.naoko - this_month_totals.david)/2 + this_month_totals.david_private).toFixed(2)}¥</b>
        </div>
    {:else}
        <div><b>Nothing to pay</b></div>
    {/if}

    <Hr classHr="my-8"/>
    <div class="grid grid-cols-1 lg:grid-cols-2 lg:place-content-center gap-4">
        <Card size="lg">
            <Heading tag="h4">David Expenses</Heading>
            <div class="grid grid-cols-2">
                {#each this_monthly.david as d }
                    <div>{d.category}:</div><div>{d.amount.toFixed(2)}¥</div>
                {/each}
            </div>
            <Hr classHr="my-8"/>
            <Heading tag="h5">Private with AMEX</Heading>
            <div class="grid grid-cols-2">
            {#each this_monthly.david_private as d }
                <div>{d.category}:</div><div>{d.amount.toFixed(2)}¥</div>
            {/each}
            </div>
            <Hr classHr="my-8"/>
            <P>Total David: {david.toFixed(2)}¥</P>
        </Card>
        <Card size="lg">
            <Heading tag="h4">Naoko Expenses</Heading>
            <div class="flex flex-row flex-wrap">
            {#each this_monthly.naoko as n }
                <div class="basis-1/2">{n.category}:</div><div class="basis-1/2">{n.amount.toFixed(2)}¥</div>
            {/each}
            </div>
            <Hr classHr="my-8"/>
            <P>Total Naoko: {naoko.toFixed(2)}¥</P>
        </Card>
    </div>
{:else}
    {#if david > (naoko+david_priv_amex)}
        <div>
            <b>Naoko pay David {((david - naoko)/2).toFixed(2)}¥</b>
        </div>
        <Button on:click={save_monthly}>Payed</Button>
    {:else if david < naoko}
        <div>
            <b>David pay Naoko {((naoko - david)/2 + david_priv_amex).toFixed(2)}¥</b>
        </div>
        <Button on:click={save_monthly}>Payed</Button>
    {:else}
        <div><b>Nothing to pay</b></div>
    {/if}

    <Hr classHr="my-8"/>

    <div class="grid grid-cols-1 lg:grid-cols-2 lg:place-content-center gap-4">
        <Card size="lg">
            <Heading tag="h4">David Expenses</Heading>
            <div class="grid grid-cols-2">
                {#each david_p as d }
                    <div>{d.category}:</div><div>{d.amount.toFixed(2)}¥</div>
                {/each}
            </div>
            <Hr classHr="my-8"/>
            <Heading tag="h5">Private with AMEX</Heading>
            <div class="grid grid-cols-2">
            {#each david_priv as d }
                <div>{d.category}:</div><div>{d.amount.toFixed(2)}¥</div>
            {/each}
            </div>
            <Hr classHr="my-8"/>
            <P>Total David: {david.toFixed(2)}¥</P>
        </Card>
        <Card size="lg">
            <Heading tag="h4">Naoko Expenses</Heading>
            <div class="flex flex-row flex-wrap">
            {#each naoko_p as n }
                <div class="basis-1/2">{n.category}:</div><div class="basis-1/2">{n.amount.toFixed(2)}¥</div>
            {/each}
            </div>
            <Hr classHr="my-8"/>
            <P>Total Naoko: {naoko.toFixed(2)}¥</P>
        </Card>
    </div>
{/if}