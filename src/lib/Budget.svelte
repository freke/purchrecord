<script lang="ts">
  import Total from "./BudgetCards/Total.svelte";
  import BudgetVsReal from "./BudgetCards/BudgetVsReal.svelte";
  import { budget } from "../stores/budget";
  import { purchases, type Purchase } from "../stores/purchases";
  import {nFormatter} from "../functions/utils";
  import { rate, convertToJPY } from "../stores/rates";
  import dayjs from "dayjs";
  import localizedFormat from 'dayjs/plugin/localizedFormat';
  import localeData from 'dayjs/plugin/localeData';
  dayjs.extend(localizedFormat);
  dayjs.extend(localeData);
  import { Select, Label, Card, Heading } from 'flowbite-svelte';

  export let currentYear = dayjs().year();

  function purchases_categories(r, purchases: {[id: string]: Purchase}, budget_categories, year, month) {
    const purchases_categories = new Set(
      Object.entries(purchases)
        .filter(([, p]: [string, Purchase]) => dayjs(p.date).year() == year && (month == null || dayjs(p.date).month() == month))
        .map(([, p]: [string, Purchase]) => p.category)
    );
    const filteredArray = budget_categories.filter((value) =>
      [...purchases_categories].includes(value)
    );
    filteredArray.forEach((c) => purchases_categories.delete(c));
    return [...purchases_categories].map((c) => ({
      category: c,
      sum: Object.entries(purchases)
        .filter(([, p]) => p.category == c && (month == null || dayjs(p.date).month() == month))
        .map(([, p]) => convertToJPY(r, p.amount, p.currency))
        .reduce((a, v) => a + v, 0),
    }));
  }

  function total_uncategorized(uncategorized) {
    return uncategorized.reduce((a, u) => a + u.sum, 0)
  }

  let selectedMonth = null;
  let months = [{name:"Year", value:null},...dayjs.months().map(function (value, index){ return {name:value, value:index}})]

  $: current_budget = $budget.find((b) => b.year === currentYear);
  $: budget_categories = current_budget
    ? current_budget.categories.map((c) => c.name)
    : [];
  $: uncategorized =  purchases_categories($rate, $purchases, budget_categories, currentYear, selectedMonth);
  $: uncategorized_sum = total_uncategorized(uncategorized);
</script>

<div class="flex flex-row flex-wrap place-content-between gap-y-4 gap-x-2">
  <div class="basis-full">
    <Card size="xl">
      <Total />
    </Card>
  </div>
  <div class="basis-full">
    <Card size="xl">
      <Label for="month" class="active">Periode</Label>
      <Select id="month" items={months} bind:value={selectedMonth} />
    </Card>
  </div>
  {#each budget_categories as category}
    <Card size="xl" class="grow">
      <BudgetVsReal {category} selectedMonth={selectedMonth}/>
    </Card>
  {/each}
  <div class="basis-full">
    <Heading tag="h4">Uncategorized: {nFormatter(uncategorized_sum, 2)}¥ total</Heading>
    <div class="flex flex-row flex-wrap">
      {#each uncategorized as category}
        <div class="basis-full md:basis-1/2 lg:basis-1/4">
          {category.category}: {nFormatter(category.sum, 2)}¥
        </div>
      {/each}
    </div>
  </div>
</div>
