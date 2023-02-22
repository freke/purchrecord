<script lang="ts">
  import { onMount } from 'svelte';
  import "beercss";
	import "material-dynamic-colors";
  import {purchases} from '../stores/purchases';
  import {rate} from '../stores/rates';
  import { deleted } from '../stores/deleted';

  onMount(async () => {   
    if (!$rate || $rate.date == null || ((new Date()).getTime() - $rate.date.getTime()) > 86400000) {
      const response = await fetch('https://v6.exchangerate-api.com/v6/2a8dab30a85314fff7fabb79/latest/SEK')
      const data = await response.json();
      $rate = {'rate': data.conversion_rates.JPY, 'date': new Date()};
    }
  });

  let selectedItem;
  let showConfirmDialog = false;

  function delete_id(purcahse){
    selectedItem = purcahse
    showConfirmDialog = true;
  }

  function confirm_delete_id(){
    delete $purchases[selectedItem.id];
    $purchases = $purchases;

    if (selectedItem.row !== null && !$deleted.some(obj => obj.id === selectedItem.id)) {
      $deleted.push({'id':selectedItem.id,'row':selectedItem.row});
      $deleted = $deleted
    }

    selectedItem = null;
    showConfirmDialog = false;
  }

  function cancel_delete_id(){
    selectedItem = null;
    showConfirmDialog = false;
  }

  $: pur = $purchases ? Object.entries($purchases).sort(([,a],[,b]) => (a.date.getTime() - b.date.getTime())) : [];
</script>

<style>
  i {
    padding: 5px;
  }
</style>

<div class="overlay" class:active={showConfirmDialog}></div>
<div class="modal" class:active={showConfirmDialog}>
  <h5>Warning</h5>
  <div>Are you sure you want to delete?</div>
  <nav class="right-align">
    <button class="border" on:click={cancel_delete_id}>Cancel</button>
    <button on:click={confirm_delete_id}>Confirm</button>
  </nav>
</div>

{#each pur as [id, cardData]}
<div class="row">
  <i class:red-text={!cardData.sync} class:green-text={cardData.sync}>{cardData.sync ? 'check_circle' : 'error'}</i>
  <div class="max">
    <div><span class="large bold">{cardData.amount} {cardData.currency}</span> <span>{cardData.category || ''}</span></div>
    <div class="italic">{cardData.date.toISOString().split('T')[0]}</div>
    <p class="small-text">{cardData.note}</p>
  </div>
  {#if cardData.image}
  <a href={cardData.image}>
    <i>image</i>
  </a>
  {/if}
  <button class="transparent circle">
    <i>edit</i>
  </button>
  <button class="transparent circle" on:click={() => delete_id(cardData)}>
    <i>delete</i>
  </button>
</div>
{/each}

