<script lang="ts">
    import { chart } from "svelte-apexcharts";
    import { purchases, type Purchase } from "../../stores/purchases";
    import { budget } from "../../stores/budget";
    import type { Budget } from "../../stores/budget";
    import { rate, convertToJPY } from "../../stores/rates";
    import {nFormatter} from "../../functions/utils";
    import dayjs from "dayjs";

    export let category = "";
    export let currentYear = dayjs().year();
    export let selectedMonth: number | null = null;

    function monthTotals(r, purchases, category, month) {
        if( selectedMonth == null){
            return Object.entries(purchases)
                .filter(([, p]: [string, Purchase]) => p.category === category)
                .reduce(
                    (acc, [, p]: [string, Purchase]) =>
                        acc + convertToJPY(r, p.amount, p.currency),
                    0
                ).toFixed(2);
        }
        return Object.entries(purchases)
            .filter(([, p]: [string, Purchase]) => p.category === category && dayjs(p.date).month() === month)
            .reduce(
                (acc, [, p]: [string, Purchase]) =>
                    acc + convertToJPY(r, p.amount, p.currency),
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

<article class="no-padding round">
    <div class="responsive small top-round" >
        <div class="padding">
            <h5>{category}</h5>
            <p>Buget vs Expenses</p>
            <div use:chart={options}/>
        </div>
    </div>
</article>
