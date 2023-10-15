<script lang="ts">
    import { purchases } from "../../stores/purchases";
    import type { Purchase } from "../../stores/purchases";
    import { budget } from "../../stores/budget";
    import {nFormatter} from "../../functions/utils";
    import { rate, convertToJPY } from "../../stores/rates";
    import dayjs from "dayjs";
    import localeData from "dayjs/plugin/localeData";
    dayjs.extend(localeData);

    import { Chart, Heading, Secondary } from 'flowbite-svelte';

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

    function totalsByMonth(r, purchases) {
        return Object.entries(groupedByMonth(purchases)).map(
            ([monthYear, purchases]) => {
                const [year, month] = monthYear.split("-");
                const total = Object.entries(purchases).reduce(
                    (sum, [, purchase]) =>
                        sum + convertToJPY(r, purchase.amount, purchase.currency),
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
        if(budget == null) {
            return sumArray;
        }
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
        if(purchases == null){
            return [];
        }
        return Array.from({ length: 12 }, (_, i) => {
            const total = totalsByMonth($rate, purchases).find(
                (t) => t.month === i + 1 && t.year == currentYear
            );
            return total ? total.total : 0;
        });
    }

    function runningSum(nums: number[]): number[] {
        let sum = 0;
        return nums.map(num => {
            sum += num;
            return sum;
        });
    }

    $: month_purchases = monthTotals($purchases);
    $: month_budget = sumArray($budget);
    $: accumulation_purchases = runningSum(month_purchases);
    $: accumulation_budget = runningSum(month_budget);
    $: month_max = Math.max(...month_purchases, ...month_budget);
    $: accumulation_max = Math.max(...accumulation_purchases, ...accumulation_budget);

    $: options = {
        series: [
            {
                name: "Expenses",
                data: month_purchases,
                type: "bar",
            },
            {
                name: "Budget",
                data: month_budget,
                type: "bar",
            },
            {
                name: "PurchasesAccumulation",
                data: accumulation_purchases,
                type: "line",
            },
            {
                name: "BudgetAccumulation",
                data: accumulation_budget,
                type: "line",
            },
        ],
        chart: {
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
            width: [2,2,3,2],
        },
        xaxis: {
            categories: months,
        },
        yaxis: [{
            seriesName: 'Expenses',
            min: 0,
            max: month_max,
            title: {
                text: "Monthly (¥)",
            },
            labels: {
                formatter: function (value) {
                    return nFormatter(value,2);
                }
            },
        },{
            seriesName: 'Budget',
            min: 0,
            max: month_max,
            show: false
        },{
            seriesName: 'PurchasesAccumulation',
            min: 0,
            max: accumulation_max,
            opposite: true,
            title: {
                text: "Accumulation (¥)",
            },
            labels: {
                formatter: function (value) {
                    return nFormatter(value,2);
                }
            },
        },{
            seriesName: 'BudgetAccumulation',
            min: 0,
            max: accumulation_max,
            show: false
        }],
        fill: {
            opacity: 1,
        },
        tooltip: {
            y: {
                formatter: function (val) {
                    return nFormatter(val, 2) + "¥";
                },
            },
        },
    };
</script>

<div class="p-4">
    <Heading tag="h3">Total {currentYear}
    <Secondary>Buget vs Expenses</Secondary></Heading>
    <Chart {options} />
</div>
