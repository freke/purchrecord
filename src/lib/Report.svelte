<script lang="ts">
  import { onMount } from 'svelte';
  import "beercss";
	import "material-dynamic-colors";
  import {purchases} from '../stores/purchases';
  import type {Purchase} from '../stores/purchases';
  import {rate} from '../stores/rates';
  import { deleted } from '../stores/deleted';
  import Form from './Form.svelte';
  import dayjs from 'dayjs';
  import localizedFormat from 'dayjs/plugin/localizedFormat';
  import Summary from './Summary.svelte';
  dayjs.extend(localizedFormat);

  onMount(async () => {   
    if (!$rate || $rate.date == null || ((new Date()).getTime() - $rate.date.getTime()) > 86400000) {
      const response = await fetch('https://v6.exchangerate-api.com/v6/2a8dab30a85314fff7fabb79/latest/SEK')
      const data = await response.json();
      $rate = {'rate': data.conversion_rates.JPY, 'date': new Date()};
    }
  });

  let currentMonth = dayjs().startOf('month');
  let selectedItem;
  let showConfirmDialog = false;
  let showEditDialog = false;
  let showImageDialog = false;

  function delete_id(purcahse){
    selectedItem = purcahse;
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

  function cancel_dialog(){
    selectedItem = null;
    showConfirmDialog = false;
    showEditDialog = false;
    showImageDialog = false;
  }

  function edit_purchase(purcahse){
    selectedItem = purcahse;
    showEditDialog = true;
  }

  function save_edit(){
    selectedItem = null;
    showEditDialog = false;
  }

  function show_image(purcahse) {
    selectedItem = purcahse;
    showImageDialog = true;
  }

  function isInCurrentMonth(date): boolean {
    const currentDate = dayjs();
    return currentDate.month() === date.month();
  }

  function nextMonth() {
    currentMonth = currentMonth.add(1, 'month');
  }

  function prevMonth() {
    currentMonth = currentMonth.subtract(1, 'month');
  }

  $: pur = $purchases ? Object.entries($purchases).filter(([,a]: [string, Purchase]) => dayjs(a.date).month() === currentMonth.month() && dayjs(a.date).year() === currentMonth.year()).sort(([,a]: [string, Purchase],[,b]: [string, Purchase]) => (dayjs(a.date).isAfter(dayjs(b.date)) ? 1 : -1)).map(([,a]: [string, Purchase]) => a) : [];
</script>

<style>
  i {
    padding: 5px;
  }
</style>

{#if selectedItem}
<div class="modal" class:active={showImageDialog}>
  <div class="row center-align">
    <img src="{selectedItem.image}" alt=""/>
  </div>
  <nav class="right-align">
    <button class="border" on:click={cancel_dialog}>Close</button>
  </nav>
</div>
{/if}

<div class="overlay" class:active={showConfirmDialog || showEditDialog}></div>
<div class="modal" class:active={showConfirmDialog}>
  <h5>Warning</h5>
  <div>Are you sure you want to delete?</div>
  <nav class="right-align">
    <button class="border" on:click={cancel_dialog}>Cancel</button>
    <button on:click={confirm_delete_id}>Confirm</button>
  </nav>
</div>

<div class="modal max" class:active={showEditDialog}>
  <h5>Edit</h5>
  <Form submitFunction={save_edit} cancelFunction={cancel_dialog} formData={selectedItem}/>
</div>


<article>
<Summary  month={currentMonth} pur={pur}/>
<div class="space"></div>
<nav class="no-space">
  <button class="border left-round max" on:click={prevMonth}>
    <i>navigate_before</i>
  </button>
  <button class="border no-round max" class:fill={isInCurrentMonth(currentMonth)}>
    <span>{currentMonth.format('MMM YYYY')}</span>
  </button>
  <button class="border right-round max" on:click={nextMonth}>
    <i>navigate_next</i>
  </button>
</nav>
</article>

<div class="space"></div>
{#each pur as cardData}
<div class="row">
  <i class:red-text={!cardData.sync} class:green-text={cardData.sync}>{cardData.sync ? 'check_circle' : 'error'}</i>
  <div class="max">
    <div><span class="large bold">{cardData.amount.toFixed(2)} {cardData.currency}</span> <span>{cardData.category || ''}</span></div>
    <div class="small-text">{dayjs(cardData.date).format('L')}</div>
    <p class="small-text">{cardData.note}</p>
  </div>
  {#if cardData.image}
    {#if cardData.sync}
    <a href={cardData.image}>
      <i>satellite</i>
    </a>
    {:else}
    <button class="transparent circle" on:click={() => show_image(cardData)}>
      <i>image</i>
    </button>
    {/if}
  {/if}

  {#if !cardData.sync}
  <button class="transparent circle" on:click={() => edit_purchase(cardData)}>
    <i>edit</i>
  </button>
  {/if}
  <button class="transparent circle" on:click={() => delete_id(cardData)}>
    <i>delete</i>
  </button>
</div>
{/each}

