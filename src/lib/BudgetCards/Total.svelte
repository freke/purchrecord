<script lang="ts">
    import { chart } from "svelte-apexcharts";
    import { purchases } from "../../stores/purchases";
    import type { Purchase } from "../../stores/purchases";
    import { budget } from "../../stores/budget";
    import type { Budget } from "../../stores/budget";
    import { convertToJPY } from "../../stores/rates";
    import dayjs from "dayjs";
    import localeData from "dayjs/plugin/localeData";
    dayjs.extend(localeData);

    export let currentYear = dayjs().year();

    const months = dayjs.monthsShort();

    function groupedByMonth(purchases) {
        return Object.entries(purchases).reduce(
            (acc, [, purchase]: [string, Purchase]) => {
                const monthYear = dayjs(purchase.date).format("YYYY-MM");
                if (!acc[monthYear]) {
                    acc[monthYear] = [];
                }
                acc[monthYear].push(purchase);
                return acc;
            },
            {}
        );
    }

    function totalsByMonth(purchases) {
        return Object.entries(groupedByMonth(purchases)).map(
            ([monthYear, purchases]) => {
                const [year, month] = monthYear.split("-");
                const total = Object.entries(purchases).reduce(
                    (sum, [, purchase]) =>
                        sum + convertToJPY(purchase.amount, purchase.currency),
                    0
                );
                return {
                    year: parseInt(year),
                    month: parseInt(month),
                    total,
                };
            }
        );
    }

    function sumArray(budget) {
        let sumArray = new Array(12).fill(0);
        const currentBudget = budget.find((b) => b.year === currentYear);
        if (currentBudget) {
            currentBudget.categories.forEach((budget) => {
                budget.row.forEach((item) => {
                    sumArray[item.month] += item.value || 0;
                });
            });
        }
        return sumArray;
    }

    function monthTotals(purchases) {
        return Array.from({ length: 12 }, (_, i) => {
            const total = totalsByMonth(purchases).find(
                (t) => t.month === i + 1 && t.year == currentYear
            );
            return total ? total.total.toFixed(2) : "0";
        });
    }

    $: options = {
        series: [
            {
                name: "Expenses",
                data: $purchases ? monthTotals($purchases) : [],
            },
            {
                name: "Budget",
                data: $budget ? sumArray($budget) : [],
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
            categories: months,
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
    <div class="responsive small top-round">
        <div class="padding">
            <h5>Total {currentYear}</h5>
            <p>Buget vs Expenses</p>
            <div use:chart={options}/>
        </div>
    </div>
</article>
