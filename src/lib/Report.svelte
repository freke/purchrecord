<script lang="ts">
  import { purchases } from "../stores/purchases";
  import type { Purchase } from "../stores/purchases";
  import { deleted } from "../stores/deleted";
  import Form from "./Form.svelte";
  import {rate, convertToJPY} from '../stores/rates';
  import dayjs from "dayjs";
  import localizedFormat from "dayjs/plugin/localizedFormat";
  import Summary from "./Components/Summary.svelte";
  dayjs.extend(localizedFormat);
  import { Button, ButtonGroup, Checkbox, Card, Modal, Heading, Hr, P } from 'flowbite-svelte';
  import { ExclamationCircleOutline, ChevronLeftOutline, ChevronRightOutline, CheckCircleOutline, ImageOutline, TrashBinOutline, EditOutline } from 'flowbite-svelte-icons';

  let currentMonth = dayjs().startOf("month");
  let selectedItem;
  let showConfirmDialog = false;
  let showEditDialog = false;
  let showImageDialog = false;

  function delete_id(purcahse) {
    selectedItem = purcahse;
    showConfirmDialog = true;
  }

  function confirm_delete_id() {
    delete $purchases[selectedItem.id];
    $purchases = $purchases;

    if (
      selectedItem.row !== null &&
      !$deleted.some((obj) => obj.id === selectedItem.id)
    ) {
      $deleted.push({ id: selectedItem.id, row: selectedItem.row });
      $deleted = $deleted;
    }

    selectedItem = null;
    showConfirmDialog = false;
  }

  function cancel_dialog() {
    selectedItem = null;
    showConfirmDialog = false;
    showEditDialog = false;
    showImageDialog = false;
  }

  function edit_purchase(purcahse) {
    selectedItem = purcahse;
    showEditDialog = true;
  }

  function save_edit() {
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
    currentMonth = currentMonth.add(1, "month");
  }

  function prevMonth() {
    currentMonth = currentMonth.subtract(1, "month");
  }

  function purchases_categories(purchases: {[id: string]: Purchase}, year, month) {
    return Array.from(new Set(
      Object.entries(purchases)
        .filter(([, p]: [string, Purchase]) => dayjs(p.date).year() == year && (month == null || dayjs(p.date).month() == month))
        .map(([, p]: [string, Purchase]) => p.category)
    )).map((c) => {return {name: c, selected: true}}).sort((a, b) => a.name.localeCompare(b.name));
  }

  function purchases_paied_by(purchases: {[id: string]: Purchase}, year, month) {
    return Array.from(new Set(
      Object.entries(purchases)
        .filter(([, p]: [string, Purchase]) => dayjs(p.date).year() == year && (month == null || dayjs(p.date).month() == month))
        .map(([, p]: [string, Purchase]) => p.paid || "unkown")
    )).map((c) => {return {name: c, selected: true}}).sort((a, b) => a.name.localeCompare(b.name));
  }

  function filteredTotal(r, categories, payer) {
    return $purchases ? Object.entries($purchases)
      .filter(([_, value]: [string, Purchase]) => dayjs(value.date).month() == currentMonth.month() && categories.find(c => c.name == value.category) && categories.find(c => c.name == value.category).selected )
      .filter(([_, value]: [string, Purchase]) => dayjs(value.date).month() == currentMonth.month() && payer.find(p => {
                  var paid = value.paid || "unkown"
                  return p.name == paid
                }))
      .reduce((t, [_, value]: [string, Purchase]) => t + convertToJPY(r, value.amount, value.currency), 0)
      .toFixed(2) : "0.00";
  }

  $: pur = $purchases
    ? Object.entries($purchases)
        .filter(
          ([, a]: [string, Purchase]) =>
            dayjs(a.date).month() === currentMonth.month() &&
            dayjs(a.date).year() === currentMonth.year()
        )
        .sort(([, a]: [string, Purchase], [, b]: [string, Purchase]) =>
          dayjs(a.date).isAfter(dayjs(b.date)) ? 1 : -1
        )
        .map(([, a]: [string, Purchase]) => a)
    : [];
  $: categories =  purchases_categories($purchases, currentMonth.year(), currentMonth.month());
  $: payer = purchases_paied_by($purchases, currentMonth.year(), currentMonth.month());
  $: filtered_total = filteredTotal($rate, categories, payer);
</script>

{#if selectedItem}
  <div class="modal" class:active={showImageDialog}>
    <div class="row center-align">
      <img src={selectedItem.image} alt="" />
    </div>
    <nav class="right-align">
      <button class="border" on:click={cancel_dialog}>Close</button>
    </nav>
  </div>
{/if}

<Modal bind:open={showConfirmDialog} size="xs" autoclose>
  <div class="text-center">
    <ExclamationCircleOutline class="mx-auto mb-4 text-gray-400 w-12 h-12 dark:text-gray-200" />
    <Heading tag="h3" class="mb-5 text-lg font-normal text-gray-500 dark:text-gray-400">Are you sure you want to delete?</Heading>
    <Button color="red" class="mr-2" on:click={confirm_delete_id}>Yes, I'm sure</Button>
    <Button color="alternative" on:click={cancel_dialog}>No, cancel</Button>
  </div>
</Modal>

<Modal title="Edit" bind:open={showEditDialog}>
  <Form
    submitFunction={save_edit}
    cancelFunction={cancel_dialog}
    formData={selectedItem}
  />
</Modal>

<Card size="xl" class="my-4">
  <Summary month={currentMonth} {pur} />
  <div class="justify-center items-center space-y-4 sm:flex sm:space-y-0 sm:space-x-4">
    <ButtonGroup>
      <Button on:click={prevMonth}>
        <ChevronLeftOutline />
      </Button>
      <Button color={isInCurrentMonth(currentMonth)?"primary":"alternative"}>
        <span>{currentMonth.format("MMM YYYY")}</span>
      </Button>
      <Button on:click={nextMonth}>
        <ChevronRightOutline />
      </Button>
    </ButtonGroup>
  </div>
</Card>

<Card size="xl" class="my-4">
  <Heading tag="h3">Category Filter</Heading>
  <div class="flex flex-row flex-wrap">
    {#each categories as category}
      <div class="basis-1/6">
        <Checkbox checked={category.selected} on:change={() => category.selected = !category.selected}>{category.name}</Checkbox>
      </div>
    {/each}
  </div>
  <Heading tag="h3" class="mt-4">Payer Filter</Heading>
  <div class="flex flex-row flex-wrap">
    {#each payer as payed_by}
      <div class="basis-1/6">
        <Checkbox checked={payed_by.selected} on:change={() => payed_by.selected = !payed_by.selected}>{payed_by.name}</Checkbox>
      </div>
    {/each}
  </div>
  <Hr classHr="my-8"/>
  <Heading tag="h2">Filterd Total: {filtered_total} JPY</Heading>
</Card>

<div class="w-full mt-8 p-4">
{#each pur as cardData}
  {#if categories.find((c) => c.name == cardData.category).selected}
    {#if payer.find((c) => c.name == (cardData.paid || "unkown")).selected}
      <div class="flex flex-row space-x-4 items-center">
        {#if cardData.sync}
          <CheckCircleOutline class="text-green-400"/>
        {:else}
          <ExclamationCircleOutline class="text-red-400"/>
        {/if}
        <div class="grow">
          <div>
            <span class="large bold"
              >{cardData.amount.toFixed(2)} {cardData.currency}</span
            > <span>{cardData.category || ""}</span>
          </div>
          <div class="flex flex-row">
            <P size="sm">{dayjs(cardData.date).format("L")}</P>
            {#if cardData.paid}
              <P size="sm" weight="bold" class="ml-2">Paid:</P><P size="sm">{cardData.paid}</P>
            {/if}
          </div>
          <P size="sm">{cardData.note}</P>
        </div>
        {#if cardData.image}
          {#if cardData.sync}
            <a href={cardData.image}>
              <ImageOutline />
            </a>
          {:else}
            <Button outline={true} class="!p-2 m-1" on:click={() => show_image(cardData)}>
              <ImageOutline class="w-4 h-4"/>
            </Button>
          {/if}
        {/if}

        {#if !cardData.sync}
          <Button outline={true} class="!p-2 m-1" on:click={() => edit_purchase(cardData)}>
            <EditOutline class="w-4 h-4"/>
          </Button>
        {/if}
        <Button outline={true} class="!p-2 m-1" on:click={() => delete_id(cardData)}>
          <TrashBinOutline class="w-4 h-4"/>
        </Button>
      </div>
      <Hr classHr="my-1"/>
    {/if}
  {/if}
{/each}
</div>

<style>
</style>
