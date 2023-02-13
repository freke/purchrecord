<script lang="ts">
  import { onMount } from 'svelte';
  import "beercss";
	import "material-dynamic-colors";
  import {purchases} from '../stores/purchases';
  import {rate} from '../stores/rates';
  import GoogleSync from './GoogleSync.svelte';

  onMount(async () => {
    if (!$rate || $rate.date == null || ((new Date()).getTime() - $rate.date.getTime()) > 86400000) {
      const response = await fetch('https://v6.exchangerate-api.com/v6/2a8dab30a85314fff7fabb79/latest/SEK')
      const data = await response.json();
      $rate = {'rate': data.conversion_rates.JPY, 'date': new Date()};
    }
  });

  function convertToJPY(amount, currency) {
    if($rate && currency == 'SEK')
      return amount * $rate.rate;
    return amount
  }

  $: sum = $purchases ? Object.entries($purchases).reduce((t, [_, value]) => t + parseFloat(convertToJPY(value.amount, value.currency)), 0) : 0;
  $: pur = $purchases ? Object.entries($purchases) : [];
</script>

<style>
  i {
    padding: 5px;
  }

  .row * {
    display: inline-block
  }
</style>

{#each pur as [id, cardData]}
<div class="row">
  <i class:red-text={!cardData.sync} class:green-text={cardData.sync}>{cardData.sync ? 'check_circle' : 'error'}</i>
  <div class="max">
    <p>{cardData.date.toISOString().split('T')[0]}</p>
    <p class="large bold">{cardData.amount} {cardData.currency}</p>
    <p>{cardData.category}</p>
    <p>{cardData.note}</p>
  </div>
  <a>
    <i>edit</i>
  </a>
  <a>
    <i>delete</i>
  </a>
</div>
{/each}

<article>
  <h5>Total: {sum.toFixed(2)} JPY</h5>
</article>

<GoogleSync />