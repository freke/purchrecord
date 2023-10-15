<script lang="ts">
    import { v4 as uuidv4 } from 'uuid';
    import {purchases} from '../stores/purchases';
    import type {Purchase} from '../stores/purchases';
    import DateInput from './Components/DateInput.svelte';
    import Device from 'svelte-device-info'
    import dayjs from "dayjs";

    import { Button, Input, NumberInput, Textarea, Radio, Select, Label, Fileupload } from 'flowbite-svelte';
    import { CameraFotoOutline, FileImageOutline } from 'flowbite-svelte-icons';

    export let submitFunction = () => {};
    export let cancelFunction = () => {};
    export let formData: Purchase  = {
      id: null,
      date: dayjs().toISOString(),
      category: null,
      currency: 'JPY',
      amount: null,
      paid: null,
      note: null,
      image: null,
      sync: false,
      row: null
    };

    let use_camera = false;

    $: formData = formData ? formData : {
        id: null,
        date: dayjs().toISOString(),
        category: null,
        currency: 'JPY',
        amount: null,
        paid: null,
        note: null,
        image: null,
        sync: false,
        row: null
      }
    
    $: isNew = !formData.id;

    function resetFromData() {
      formData = {
        id: null,
        date: dayjs().toISOString(),
        category: null,
        currency: 'JPY',
        amount: null,
        paid: null,
        note: null,
        image: null,
        sync: false,
        row: null
      }
    }

    function handleImageCapture(event) {
      const file = event.target.files[0];
      const fileReader = new FileReader();
      fileReader.readAsDataURL(file);
      fileReader.onload = (event) => {
        const img = new Image();
        img.onload = () => {
          const canvas = document.createElement('canvas');
          const ctx = canvas.getContext('2d');
          canvas.width = 320;
          canvas.height = (img.height / img.width) * canvas.width;
          ctx.drawImage(img, 0, 0, canvas.width, canvas.height);
          const dataUrl = canvas.toDataURL(file.type);
          formData.image=dataUrl;
        };
        img.src = event.target.result as string;
      };
    }
    
    function submitForm(event) {
      event.preventDefault();
      formData.id = formData.id ? formData.id : uuidv4();
      formData.category = formData.category.trim();
      if($purchases == null){
        $purchases = {[formData.id]: formData};
      }else{
        $purchases[formData.id] = formData
      }
      submitFunction();
      resetFromData();
    }

    function resetFrom(event){
      event.preventDefault();
      cancelFunction();
      resetFromData();
    }

    let currencies = [{value:'JPY', name:'JPY'}, {value:'SEK', name:'SEK'}, {value:'GBP', name:'GPB'}, {value:'DKK', name:'DKK'}];

    let payedByOptions = [
        'Naoko Cash',
        'Naoko Amex',
        'Naoko VISA JAL',
        'Naoko VISA ANA',
        'David Cash',
        'David MC',
        'David Amex',
      ];

    let categoryOptions = [
        'Food',
        'Health',
        'Travel',
        'Transportation',
        'Apartment',
        'Dining out',
        'Utility',
        'Insurance',
        'Misc',
        'Leisure',
        'Medical',
        'Household',
        'Entertainment',
        'Naoko',
        'Naoko Beauty',
        'Naoko Misc'
      ];

</script>

<article class="container mx-auto px-4">
  <form>
      <Label for="date">Date</Label>
      <DateInput id="date" bind:date={formData.date} />
      <Label for="amount">Amount</Label>
      <NumberInput id="amount" bind:value={formData.amount} />
      <Label for="category">Category</Label>
      <Input id="category" type="text" bind:value={formData.category} list="CategoryOptions" />
      <datalist id="CategoryOptions">
        {#each categoryOptions as category}
        <option value="{category}">{category}</option>
        {/each}
      </datalist>
      <Label for="currency">Currency</Label>
      <Select id="currency" items={currencies} bind:value={formData.currency}/>
      <Label for="paid">Paid by</Label>
      <Input id="paid" bind:value={formData.paid} list="paidByOptions"/>
      <datalist id="paidByOptions">
        {#each payedByOptions as payedBy}
        <option value="{payedBy}">{payedBy}</option>
        {/each}
      </datalist>
      <Label for="note">Note</Label>
      <Textarea id="note" bind:value={formData.note} />
    {#if Device.isMobile}
    <div>
      <Radio name="image_src" custom bind:checked={use_camera}>
        <CameraFotoOutline size="sm"/>
      </Radio>
      <Radio name="image_src" custom>
        <FileImageOutline size="sm"/>
      </Radio>
    </div>
    {/if}
    
    <div>
      <Label for="photo_file">File</Label>
      {#if use_camera && Device.isMobile}
        <Fileupload id="photo_file" type="file" accept="image/*"  capture="environment" on:change={handleImageCapture} bind:value={formData.image} />
      {:else}
        <Fileupload id="photo_file" type="file" accept="image/*" on:change={handleImageCapture} bind:value={formData.image} />
      {/if}
    </div>
    <div class="mt-4">
      <Button color="alternative" on:click={resetFrom}>Cancel</Button>
      <Button on:click={submitForm}>{isNew ? 'Create' : 'Update'}</Button>
    </div>
    {#if formData.image}
      <div class="mt-4">
        <img src="{formData.image}" alt="Receipt"/>
      </div>
    {/if}
  </form>
</article>