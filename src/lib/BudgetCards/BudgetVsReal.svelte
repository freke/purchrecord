<script lang="ts">
    import { budget } from "../../stores/budget";
    import type { Budget } from "../../stores/budget";
    import { rate, convertToJPY } from "../../stores/rates";
    import {nFormatter} from "../../functions/utils";
    import dayjs, {type ManipulateType} from "dayjs";
    import { Chart, Heading, Secondary } from 'flowbite-svelte';
    import { liveQuery } from "dexie";
    import { db, type IPurchase } from "../db";

    export let category = "";
    export let currentYear = dayjs().year();
    export let selectedMonth: number | null = null;

    let intervall: ManipulateType = 'year'
    let from_date = dayjs().startOf('year');
    $: to_date = from_date.add(1, intervall);
    $: purchases = liveQuery(() =>
        db.purchases.where("date").between(from_date, to_date).toArray(),
    );

    function monthTotals(r, purchases: IPurchase[], category: string, month: number) {
        console.log("monthly")
        if( selectedMonth == null){
            return purchases
                .filter((p: IPurchase) => p.payment.category === category)
                .reduce(
                    (acc, p: IPurchase) =>
                        acc + convertToJPY(r, p.payment.amount, p.payment.currency.currency),
                    0
                ).toFixed(2);
        }
        return purchases
            .filter((p: IPurchase) => p.payment.category === category && dayjs.unix(p.date).month() === month)
            .reduce(
                (acc, p: IPurchase) =>
                    acc + convertToJPY(r, p.payment.amount, p.payment.currency.currency),
                0
            ).toFixed(2);
    }

    function sumArray(budget: Budget[], category, month) {
        const currentBudget = budget.find((b) => b.year === currentYear);
        if (!currentBudget) {
            return 0;
        }
        if(selectedMonth == null) {
            return currentBudget.categories
                    .find((c) => c.name === category)
                    .row.reduce((a, r) => r.value + a, 0).toFixed(2);
        }
        return currentBudget.categories.find((c) => c.name === category).row.find(r => r.month === month).value.toFixed(2);
    }

    $: options = {
        series: [
            {
                name: "Expenses",
                data: $purchases ? [monthTotals($rate, $purchases, category, selectedMonth)] : [],
            },
            {
                name: "Budget",
                data: $budget ? [sumArray($budget, category, selectedMonth)] : [],
            },
        ],
        chart: {
            type: "bar",
            height: 350,
        },
        plotOptions: {
            bar: {
                horizontal: false,
                columnWidth: "55%",
                endingShape: "rounded",
            },
        },
        dataLabels: {
            enabled: false,
        },
        stroke: {
            show: true,
            width: 2,
            colors: ["transparent"],
        },
        xaxis: {
            categories: ["Sum"],
        },
        yaxis: {
            title: {
                text: "¥",
            },
            labels: {
                formatter: function (value) {
                    return nFormatter(value,2);
                }
            },
        },
        fill: {
            opacity: 1,
        },
        tooltip: {
            y: {
                formatter: function (val) {
                    return nFormatter(val,2)+"¥";
                },
            },
        },
    };
</script>

<div class="p-2">
    <Heading tag="h5">{category}
    <Secondary>Buget vs Expenses</Secondary></Heading>
    <Chart {options} />
</div>