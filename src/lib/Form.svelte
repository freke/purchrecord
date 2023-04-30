<script lang="ts">
    import "beercss";
	  import "material-dynamic-colors";
    import { v4 as uuidv4 } from 'uuid';
    import {purchases} from '../stores/purchases';
    import type {Purchase} from '../stores/purchases';
    import DateInput from './DateInput.svelte';
    import Device from 'svelte-device-info'
    import dayjs from "dayjs";

    export let submitFunction = () => {};
    export let cancelFunction = () => {};
    export let formData: Purchase  = {
      id: null,
      date: dayjs().toISOString(),
      category: null,
      currency: 'JPY',
      amount: null,
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
        note: null,
        image: null,
        sync: false,
        row: null
      }
    
    $: isNew = !formData.id;

    function resetFromData() {
      formData = {
        id: null,
        date: new Date(),
        category: null,
        currency: 'JPY',
        amount: null,
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

    let currencies = ['JPY', 'SEK'];

</script>

<article>
  <form>
    <div class="field label border">
      <label for="date" class="active">Date</label>
      <DateInput id="date" bind:date={formData.date} />
    </div>
    <div class="field label border">
      <input id="amount" type="number" bind:value={formData.amount}>
      <label for="amount">Amount</label>
    </div>
    <div class="field label border">
      <input id="category" type="text" bind:value={formData.category}>
      <label for="category">Category</label>
    </div>
    <div class="field label suffix border">
      <select id="currency" bind:value={formData.currency}>
        {#each currencies as currency}
          <option value={currency}>{currency}</option>
        {/each}
      </select>
      <label for="currency" class="active">Currency</label>
      <i>arrow_drop_down</i>
    </div>
    <div class="field textarea label border">
      <textarea id="note" bind:value={formData.note}></textarea>
      <label for="note">Note</label>
    </div>
    {#if Device.isMobile}
    <label class="switch">
      <input type="checkbox" bind:checked={use_camera}>
      <span>
        <i>photo_library</i>
        <i>photo_camera</i>
      </span>
    </label>
    {/if}
    <div class="field label prefix border middle-align">
      {#if use_camera && Device.isMobile}
        <i>photo_camera</i>
      {:else}
        <i>description</i>
      {/if}
      <input id="photo" type="text">
      <label for="photo">File</label>
      {#if use_camera && Device.isMobile}
        <input id="photo_file" type="file" accept="image/*"  capture="environment" on:change={handleImageCapture} bind:value={formData.image} />
      {:else}
        <input id="photo_file" type="file" accept="image/*" on:change={handleImageCapture} bind:value={formData.image} />
      {/if}
      <label for="photo_file">File</label>
    </div>
    <div class="row right-align">
      <button class="border" on:click={resetFrom}>Cancel</button>
      <button class="small-elevate" on:click={submitForm}>{isNew ? 'Create' : 'Update'}</button>
    </div>
    {#if formData.image}
      <div class="row center-align">
        <img src="{formData.image}" alt="Receipt"/>
      </div>
    {/if}
  </form>
</article>