<script lang="ts">
  import DateInput from "./Components/DateInput.svelte";
  import Device from "svelte-device-info";

  import {
    Card,
    Button,
    Input,
    NumberInput,
    Textarea,
    Radio,
    Select,
    Label,
    Fileupload,
    Toggle,
  } from "flowbite-svelte";
  import { CameraFotoOutline, FileImageOutline } from "flowbite-svelte-icons";

  import { db, Purchase, Payment, Currency } from "./db";

  export let submitFunction = () => {};
  export let cancelFunction = () => {};
  export let formData = new Purchase({
    payment: new Payment({
      category: "",
      amount: 0,
      currency: new Currency({ currency: "JPY", rate: 1 }),
    }),
  });

  async function add_purchases() {
    try {
      let id = await db.purchases.put(formData);
      console.log(`Purchase successfully updated. Got id ${id}`);

      // Reset form:
      formData = resetFromData();
    } catch (error) {
      console.log(`Failed to add purchase: ${error}`);
    }
  }

  let use_camera = false;

  $: formData = formData ? formData : resetFromData();

  function resetFromData() {
    return new Purchase({
      payment: new Payment({
        category: "",
        amount: 0,
        currency: new Currency({ currency: "JPY", rate: 1 }),
      }),
    });
  }

  function handleImageCapture(event) {
    const file = event.target.files[0];
    const fileReader = new FileReader();
    fileReader.readAsDataURL(file);
    fileReader.onload = (event) => {
      const img = new Image();
      img.onload = () => {
        const canvas = document.createElement("canvas");
        const ctx = canvas.getContext("2d");
        canvas.width = 640;
        canvas.height = (img.height / img.width) * canvas.width;
        ctx.drawImage(img, 0, 0, canvas.width, canvas.height);
        const dataUrl = canvas.toDataURL(file.type);
        formData.file = dataUrl;
      };
      img.src = event.target.result as string;
    };
  }

  function submitForm(event) {
    add_purchases();
    event.preventDefault();
    submitFunction();
  }

  function resetFrom(event) {
    event.preventDefault();
    cancelFunction();
    resetFromData();
  }

  let currencies = [
    { value: new Currency({ currency: "JPY", rate: 1 }), name: "JPY" },
    { value: new Currency({ currency: "SEK", rate: 0.14 }), name: "SEK" },
    { value: new Currency({ currency: "GPB", rate: 0.014 }), name: "GPB" },
    { value: new Currency({ currency: "DKK", rate: 0.2 }), name: "DKK" },
  ];

  let payedByOptions = ["Naoko", "David"];

  let methodOptions = [
    "Cash",
    "Amex Hilton",
    "Amex Marriott",
    "VISA JAL",
    "VISA ANA",
    "MasterCard Handelsbanken",
  ];

  let categoryOptions = [
    "Food",
    "Health",
    "Travel",
    "Transportation",
    "Apartment",
    "Dining out",
    "Utility",
    "Insurance",
    "Misc",
    "Leisure",
    "Medical",
    "Household",
    "Entertainment",
    "Naoko",
    "Naoko Beauty",
    "Naoko Misc",
  ];
</script>

<article class="container mx-auto px-4">
  <Card class="font-medium mx-auto" size="xl">
    <form>
      <div class="md:flex md:space-x-4">
        <div class="flex-auto basis-3/4">
          <Label for="category">Category</Label>
          <Input
            id="category"
            type="text"
            bind:value={formData.payment.category}
            list="CategoryOptions"
          />
        </div>
        <div class="flex-auto basis-1/4">
          <Label for="date">Date</Label>
          <DateInput id="date" bind:date={formData.date} />
        </div>
      </div>
      <div class="md:flex md:space-x-4">
        <div class="flex-auto basis-3/4">
          <Label for="amount">Amount</Label>
          <NumberInput id="amount" bind:value={formData.payment.amount} />
        </div>
        <div class="flex-auto basis-1/4">
          <datalist id="CategoryOptions">
            {#each categoryOptions as category}
              <option value={category}>{category}</option>
            {/each}
          </datalist>
          <Label for="currency">Currency</Label>
          <Select
            id="currency"
            items={currencies}
            bind:value={formData.payment.currency}
          />
        </div>
      </div>
      <div class="flex space-x-4">
        <div class="flex-auto">
          <datalist id="paidByOptions">
            {#each payedByOptions as payedBy}
              <option value={payedBy}>{payedBy}</option>
            {/each}
          </datalist>
          <Label for="paid">Paid by</Label>
          <Input
            id="paid"
            bind:value={formData.payment.paid}
            list="paidByOptions"
          />
        </div>
        <div class="flex-none">
          <Label for="priv">Private</Label>
          <Toggle id="priv" bind:checked={formData.priv}></Toggle>
        </div>
      </div>
      <div class="flex-auto">
        <datalist id="methodOptions">
          {#each methodOptions as method}
            <option value={method}>{method}</option>
          {/each}
        </datalist>
        <Label for="method">Method</Label>
        <Input
          id="method"
          bind:value={formData.payment.method}
          list="methodOptions"
        />
      </div>
      <div class="flex-auto w-full">
        <Label for="note">Note</Label>
        <Textarea id="note" bind:value={formData.note} />
      </div>
      {#if Device.isMobile}
        <div class="flex-auto">
          <Radio name="image_src" custom bind:checked={use_camera}>
            <CameraFotoOutline size="sm" />
          </Radio>
          <Radio name="image_src" custom>
            <FileImageOutline size="sm" />
          </Radio>
        </div>
      {/if}

      <div class="flex-auto">
        <Label for="photo_file">File</Label>
        {#if use_camera && Device.isMobile}
          <Fileupload
            id="photo_file"
            type="file"
            accept="image/*"
            capture="environment"
            on:change={handleImageCapture}
            bind:value={formData.file}
          />
        {:else}
          <Fileupload
            id="photo_file"
            type="file"
            accept="image/*"
            on:change={handleImageCapture}
            bind:value={formData.file}
          />
        {/if}
      </div>
      <div class="mt-4 w-full">
        <Button color="alternative" on:click={resetFrom}>Cancel</Button>
        <Button on:click={submitForm}>Save</Button>
      </div>
    </form>
  </Card>
  {#if formData.file}
    <div class="mt-4 w-full">
      <img src={formData.file} alt="Receipt" />
    </div>
  {/if}
</article>
