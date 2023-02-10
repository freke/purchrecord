<script lang="ts">
  import LayoutGrid, { Cell } from '@smui/layout-grid';
  import Card, { Content } from '@smui/card';
  import { Icon } from '@smui/common';
  import { onMount } from 'svelte';
  import { green, red } from 'material-colors-ts';
  import {purchases, rate} from '../stores';
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
	.right {
    display: flex;
    justify-content: flex-end;
  }
</style>

<LayoutGrid>
    {#each pur as [id, cardData]}
      <Cell span={2}>
        <Card>
          <Content>
            <div class="right">
              <Icon class="material-icons" style="color: {cardData.sync ? green[500] : red[500]}">
                {cardData.sync ? 'check_circle' : 'error'}
              </Icon>
            </div>
            <div style="font-weight: bold;">
              {cardData.amount} {cardData.currency}
            </div>
            <div style="font-size: smaller">
              {cardData.date.toISOString().split('T')[0]}
            </div>
            <div>{cardData.category}</div>
            <div>{cardData.note}</div>
          </Content>
        </Card>
      </Cell>
    {/each}
    <Cell span={6}>
      Total: {sum.toFixed(2)} JPY
    </Cell>
</LayoutGrid>

<GoogleSync />