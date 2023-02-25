<script lang="ts">
    import { onMount } from 'svelte';
    import "beercss";
	  import "material-dynamic-colors";
    import { v4 as uuidv4 } from 'uuid';
    import {purchases} from '../stores/purchases';
    import type {Purchase} from '../stores/purchases';
    import DateInput from './DateInput.svelte';

    export let submitFunction = () => {};
    export let cancelFunction = () => {};
    export let formData: Purchase  = {
      id: null,
      date: new Date(),
      category: null,
      currency: 'JPY',
      amount: 0.00,
      note: null,
      image: null,
      sync: false,
      row: null
    };

    $: formData = formData ? formData : {
        id: null,
        date: new Date(),
        category: null,
        currency: 'JPY',
        amount: 0.00,
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
        amount: 0.00,
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

    function handleInput(event) {
      const newDate = new Date(event.target.value);
      if (!isNaN(newDate.getTime())) {
        formData.date = newDate;
      }
    }

    let currencies = ['JPY', 'SEK'];

</script>

<article>
  <form>
    <div class="field label border">
      <DateInput bind:date={formData.date} />
      <label for="date">Date</label>
    </div>
    <div class="field label border">
      <input id="amount" type="text" bind:value={formData.amount}>
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
    <div class="field label prefix border">
        <i>photo_camera</i>
        <input id="photo" type="text">
        <input id="photo_file" type="file" accept="image/*" capture on:change={handleImageCapture} bind:value={formData.image} />
        <label for="photo">File</label>
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