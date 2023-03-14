<script lang="ts">
  import Total from "./BudgetCards/Total.svelte";
  import BudgetVsReal from "./BudgetCards/BudgetVsReal.svelte";
  import { budget } from "../stores/budget";
  import { purchases, type Purchase } from "../stores/purchases";
  import { convertToJPY } from "../stores/rates";
  import dayjs from "dayjs";

  export let currentYear = dayjs().year();

  function purchases_categories(purchases) {
    const purchases_categories = new Set(
      Object.entries(purchases)
        .filter(([, p]: [string, Purchase]) => dayjs(p.date).year() == currentYear)
        .map(([, p]: [string, Purchase]) => p.category)
    );
    const filteredArray = budget_categories.filter((value) =>
      [...purchases_categories].includes(value)
    );
    filteredArray.forEach((c) => purchases_categories.delete(c));
    return [...purchases_categories].map((c) => ({
      category: c,
      sum: Object.entries($purchases)
        .filter(([, p]) => p.category == c)
        .map(([, p]) => convertToJPY(p.amount, p.currency))
        .reduce((a, v) => a + v, 0),
    }));
  }

  function total_uncategorized(uncategorized) {
    return uncategorized.reduce((a, u) => a + u.sum, 0)
  }

  $: current_budget = $budget.find((b) => b.year === currentYear);
  $: budget_categories = current_budget
    ? current_budget.categories.map((c) => c.name)
    : [];
  $: uncategorized =  purchases_categories($purchases);
  $: uncategorized_sum = total_uncategorized(uncategorized);
</script>

<div class="grid">
  <div class="s12">
    <Total />
  </div>
  {#each budget_categories as category}
    <div class="s6 l4">
      <BudgetVsReal {category} />
    </div>
  {/each}
  <div class="s12">
    <h4>Uncategorized: {uncategorized_sum.toFixed(2)}¥ total</h4>
    <div class="grid">
      {#each uncategorized as category}
        <div class="s4">
          {category.category}: {category.sum.toFixed(2)}¥
        </div>
      {/each}
    </div>
  </div>
</div>
