<script lang="ts">
  import { deleted } from "../stores/deleted";
  import Form from "./Form.svelte";
  import { rate, convertToJPY } from "../stores/rates";
  import dayjs from "dayjs";
  import localizedFormat from "dayjs/plugin/localizedFormat";
  import Summary from "./Components/Summary.svelte";
  dayjs.extend(localizedFormat);
  import {
    Button,
    ButtonGroup,
    Checkbox,
    Toggle,
    Card,
    Modal,
    Indicator,
    Heading,
    Listgroup,
    ListgroupItem,
    Hr,
    P,
  } from "flowbite-svelte";
  import {
    ExclamationCircleOutline,
    ChevronLeftOutline,
    ChevronRightOutline,
    CheckCircleOutline,
    ImageOutline,
    TrashBinOutline,
    EditOutline,
  } from "flowbite-svelte-icons";

  import { liveQuery } from "dexie";
  import { db, Purchase } from "./db";

  $: purchases = liveQuery(() =>
    db.purchases.where("date").between(from_date, to_date).toArray(),
  );

  let currentMonth = dayjs().startOf("month");
  $: from_date = dayjs(currentMonth).startOf("month").unix();
  $: to_date = dayjs(currentMonth).startOf("month").add(1, "month").unix();
  let selectedItem;
  let showConfirmDialog = false;
  let showEditDialog = false;
  let showImageDialog = false;
  let include_priv = false;

  function delete_id(purcahse) {
    selectedItem = purcahse;
    showConfirmDialog = true;
  }

  function confirm_delete_id() {
    db.purchases.delete(selectedItem.id);

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

  function purchases_categories(purchases: Purchase[]) {
    if (!purchases) return [];
    let categories = Array.from(
      new Set(purchases.map((p: Purchase) => p.payment.category)),
    ).map((c) => {
      return { name: c, selected: true };
    });
    return categories;
  }

  function purchases_paied_by(purchases: Purchase[]) {
    if (!purchases) return [];
    let paied = Array.from(
      new Set(purchases.map((p: Purchase) => p.payment.paid || "unkown")),
    ).map((c) => {
      return { name: c, selected: true };
    });
    return paied;
  }

  function filteredTotal(r, categories, payer, include_priv) {
    return $purchases
      ? $purchases
          .filter(
            (value: Purchase) => {
              let categorie = categories.find((c) => c.name == value.payment.category);
              return categorie && categorie.selected && (include_priv ? true : !value.priv)
            }
          )
          .filter(
            (value: Purchase) =>
              payer.find((p) => {
                var paid = value.payment.paid || "unkown";
                return p.name == paid;
              }).selected,
          )
          .reduce(
            (t, value: Purchase) =>
              t + convertToJPY(r, value.payment.amount, value.payment.currency.currency),
            0,
          )
          .toFixed(2)
      : "0.00";
  }

  $: categories = purchases_categories($purchases);
  $: payer = purchases_paied_by($purchases);
  $: filtered_total = filteredTotal($rate, categories, payer, include_priv);
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
    <ExclamationCircleOutline
      class="mx-auto mb-4 text-gray-400 w-12 h-12 dark:text-gray-200"
    />
    <Heading
      tag="h3"
      class="mb-5 text-lg font-normal text-gray-500 dark:text-gray-400"
      >Are you sure you want to delete?</Heading
    >
    <Button color="red" class="mr-2" on:click={confirm_delete_id}
      >Yes, I'm sure</Button
    >
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

<div class="flex flex-wrap gap-1">
  <Card class="font-medium grow" size="xl">
    <Summary purchases={$purchases} />
    <div
      class="justify-center items-center space-y-4 sm:flex sm:space-y-0 sm:space-x-4"
    >
      <ButtonGroup>
        <Button on:click={prevMonth}>
          <ChevronLeftOutline />
        </Button>
        <Button
          color={isInCurrentMonth(currentMonth) ? "primary" : "alternative"}
        >
          <span>{currentMonth.format("MMM YYYY")}</span>
        </Button>
        <Button on:click={nextMonth}>
          <ChevronRightOutline />
        </Button>
      </ButtonGroup>
    </div>
  </Card>

  <Card class="font-medium grow" size="xl">
    <Heading tag="h4">Category Filter</Heading>
    <div class="flex flex-row flex-wrap">
      {#each categories as category}
        <div class="basis-1/5">
          <Checkbox
            checked={category.selected}
            on:change={() => (category.selected = !category.selected)}
            >{category.name}</Checkbox
          >
        </div>
      {/each}
    </div>
    <Heading tag="h4" class="mt-4">Payer Filter</Heading>
    <div class="flex flex-row flex-wrap">
      {#each payer as payed_by}
        <div class="basis-1/5">
          <Checkbox
            checked={payed_by.selected}
            on:change={() => (payed_by.selected = !payed_by.selected)}
            >{payed_by.name}</Checkbox
          >
        </div>
      {/each}
      <div class="basis-1/5">
        <Toggle size="small"
          checked={include_priv}
          on:change={() => (include_priv = !include_priv)}
          >
        Include private
        </Toggle>
      </div>
    </div>
    <Hr classHr="my-8" />
    <Heading tag="h3">Filterd Total: {filtered_total}¥</Heading>
  </Card>
</div>

<Listgroup class="w-full mt-8 p-4">
  <h3 class="p-1 text-center text-xl font-medium text-gray-900 dark:text-white">Purchases</h3>
  {#each $purchases || [] as cardData}
    {#if categories.find((c) => c.name == cardData.payment.category).selected && 
      payer.find((c) => c.name == (cardData.payment.paid || "unkown")).selected &&
      (include_priv ? true : !cardData.priv)}
      <ListgroupItem class="relative flex content-start">
          {#if cardData.sync}
            <CheckCircleOutline class="text-green-400 m-2" />
          {:else}
            <ExclamationCircleOutline class="text-red-400 m-2" />
          {/if}
          {#if cardData.priv}
          <Indicator color="blue" rounded size="xl" placement="top-left" class="text-xs text-white dark:text-white px-4">priv</Indicator>
          {/if}
          <div class="grow">
            <div>
              <span class="large bold">
                {cardData.payment.amount.toFixed(2)} {cardData.payment.currency.currency}
              </span> <span>{cardData.payment.category || ""}</span>
            </div>
            <div class="flex flex-row">
              <P size="sm">{dayjs.unix(cardData.date).format("YYYY-MM-DD")}</P>
              {#if cardData.payment.paid}
                <P size="sm" weight="bold" class="ml-2">Paid:</P><P size="sm"
                  >{cardData.payment.paid}</P
                >
              {/if}
            </div>
            {#if cardData.note}
            <P size="sm">{cardData.note}</P>
            {/if}
          </div>
          {#if cardData.file}
            {#if cardData.sync}
              <a href={cardData.file}>
                <ImageOutline />
              </a>
            {:else}
              <Button
                outline={true}
                class="!p-2 m-1 w-8 h-8"
                on:click={() => show_image(cardData)}
              >
                <ImageOutline class="w-4 h-4" />
              </Button>
            {/if}
          {/if}

          {#if !cardData.sync}
            <Button
              outline={true}
              class="!p-2 m-1 w-8 h-8"
              on:click={() => edit_purchase(cardData)}
            >
              <EditOutline class="w-4 h-4" />
            </Button>
          {/if}
          <Button
            outline={true}
            class="!p-2 m-1 w-8 h-8"
            on:click={() => delete_id(cardData)}
          >
            <TrashBinOutline class="w-4 h-4" />
          </Button>
        </ListgroupItem>
    {/if}
  {/each}
</Listgroup>

<style>
</style>
