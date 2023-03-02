<script lang="ts">
    import { chart } from "svelte-apexcharts";
    import {purchases} from '../stores/purchases';
    import {convertToJPY} from '../stores/rates';
    import dayjs from 'dayjs';
    import localeData from 'dayjs/plugin/localeData';
    dayjs.extend(localeData)

    export let currentYear = dayjs().year()

    const months = dayjs.monthsShort();
    
    const groupedByMonth = Object.entries($purchases).reduce((acc, [,purchase]) => {
            const monthYear = dayjs(purchase.date).format('YYYY-MM');
            if (!acc[monthYear]) {
                acc[monthYear] = [];
            }
            acc[monthYear].push(purchase);
            return acc;
        }, {});

    const totalsByMonth = Object.entries(groupedByMonth).map(([monthYear, purchases]) => {
            const [year, month] = monthYear.split('-');
            const total = Object.entries(purchases).reduce((sum, [,purchase]) => sum + convertToJPY(purchase.amount, purchase.currency), 0);
            return {
                year: parseInt(year),
                month: parseInt(month),
                total,
            };
        });
    
    const monthTotals = Array.from({ length: 12 }, (_, i) => {
        const total = totalsByMonth.find(t => t.month === (i+1) && t.year == currentYear);
        return total ? total.total.toFixed(2) : 0;
    });

    const budget = [
        500000,
        500000,
        500000,
        500000,
        500000,
        500000,
        500000,
        500000,
        500000,
        500000,
        500000,
        500000
    ]

    var options = {
        series: [{
            name: 'Expenses',
            data: monthTotals
        },
        {
            name: 'Budget',
            data: budget
        }

        ],
          chart: {
          type: 'bar',
          height: 350
        },
        plotOptions: {
          bar: {
            horizontal: false,
            columnWidth: '55%',
            endingShape: 'rounded'
          },
        },
        dataLabels: {
          enabled: false
        },
        stroke: {
          show: true,
          width: 2,
          colors: ['transparent']
        },
        xaxis: {
          categories: months,
        },
        yaxis: {
          title: {
            text: '¥'
          }
        },
        fill: {
          opacity: 1
        },
        tooltip: {
          y: {
            formatter: function (val) {
              return "¥ " + val.toFixed(2)
            }
          }
        }
    };
</script>

<article class="no-padding round">
    <div class="responsive small top-round" use:chart={options}>
    <div class="padding">
        <h5>Total {currentYear}</h5>
        <p>Buget vs Expenses</p>
    </div>
</article>
  
  