<script lang="ts">
  import Total from "./BudgetCards/Total.svelte";
  import BudgetVsReal from "./BudgetCards/BudgetVsReal.svelte";
  import { budget } from "../stores/budget";
  import { purchases, type Purchase } from "../stores/purchases";
  import {nFormatter} from "../functions/utils";
  import { convertToJPY } from "../stores/rates";
  import dayjs from "dayjs";
  import localizedFormat from 'dayjs/plugin/localizedFormat';
  dayjs.extend(localizedFormat);

  export let currentYear = dayjs().year();

  function purchases_categories(purchases: {[id: string]: Purchase}, budget_categories, year, month) {
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
        .map(([, p]) => convertToJPY(p.amount, p.currency))
        .reduce((a, v) => a + v, 0),
    }));
  }

  function total_uncategorized(uncategorized) {
    return uncategorized.reduce((a, u) => a + u.sum, 0)
  }

  let selectedMonth = null;

  $: current_budget = $budget.find((b) => b.year === currentYear);
  $: budget_categories = current_budget
    ? current_budget.categories.map((c) => c.name)
    : [];
  $: uncategorized =  purchases_categories($purchases, budget_categories, currentYear, selectedMonth);
  $: uncategorized_sum = total_uncategorized(uncategorized);
</script>

<div class="grid">
  <div class="s12">
    <Total />
  </div>

  <div class="s12">
    <article class="no-padding round">
      <div class="responsive small top-round">
        <div class="padding">
          <div class="field label suffix border">
            <select id="month" bind:value={selectedMonth}>
              <option value={null}>Year</option>
              {#each dayjs.months() as month, i}
                <option value={i}>{month}</option>
              {/each}
            </select>
            <label for="month" class="active">Periode</label>
            <i>arrow_drop_down</i>
          </div>
        </div>
      </div>
    </article>
  </div>
  {#each budget_categories as category}
    <div class="s6 l4">
      <BudgetVsReal {category} selectedMonth={selectedMonth}/>
    </div>
  {/each}
  <div class="s12">
    <h4>Uncategorized: {nFormatter(uncategorized_sum, 2)}¥ total</h4>
    <div class="grid">
      {#each uncategorized as category}
        <div class="s4">
          {category.category}: {nFormatter(category.sum, 2)}¥
        </div>
      {/each}
    </div>
  </div>
</div>
