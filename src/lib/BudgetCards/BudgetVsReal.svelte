<script lang="ts">
    import { chart } from "svelte-apexcharts";
    import { purchases, type Purchase } from "../../stores/purchases";
    import { budget } from "../../stores/budget";
    import { convertToJPY } from "../../stores/rates";
    import dayjs from "dayjs";

    export let category = "";
    export let currentYear = dayjs().year();

    function monthTotals(purchases, category) {
        return Object.entries(purchases)
            .filter(([, p]: [string, Purchase]) => p.category === category)
            .reduce(
                (acc, [, p]: [string, Purchase]) =>
                    acc + convertToJPY(p.amount, p.currency),
                0
            ).toFixed(2);
    }

    function sumArray(budget, category) {
        const currentBudget = budget.find((b) => b.year === currentYear);
        if (currentBudget) {
            return currentBudget.categories
                .find((c) => c.name === category)
                .row.reduce((a, r) => r.value + a, 0).toFixed(2);
        }
        return 0;
    }

    $: options = {
        series: [
            {
                name: "Expenses",
                data: $purchases ? [monthTotals($purchases, category)] : [],
            },
            {
                name: "Budget",
                data: $budget ? [sumArray($budget, category)] : [],
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
        },
        fill: {
            opacity: 1,
        },
        tooltip: {
            y: {
                formatter: function (val) {
                    return "¥ " + val.toFixed(2);
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
