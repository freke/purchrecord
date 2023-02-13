<script lang="ts">
    import "beercss";
	  import "material-dynamic-colors";
    import { v4 as uuidv4 } from 'uuid';
    import {purchases} from '../stores/purchases';
    import type {Purchase} from '../stores/purchases';
    
   
    let formData: Purchase = {
      id: uuidv4(),
      date: new Date(),
      category: null,
      currency: 'JPY',
      amount: 0.00,
      note: "",
      sync: false,
    };
    
    function submitForm() {
      formData.date = new Date(date);
      if($purchases == null){
        $purchases = {[formData.id]: formData};
      }else{
        $purchases[formData.id] = formData
      }
      formData = {
        id: uuidv4(),
        date: new Date(),
        category: null,
        currency: 'JPY',
        amount: 0.00,
        note: "",
        sync: false
      }
    }

    let currencies = ['JPY', 'SEK'];

    $: date=formData.date.toISOString().substring(0, 10)
</script>

<form on:submit|preventDefault={submitForm}>
  <div class="field label border">
    <input type="date" bind:value={date}>
    <label>Date</label>
  </div>
  <div class="field label border">
    <input type="text" bind:value={formData.category}>
    <label>Category</label>
  </div>
  <div class="field label suffix border">
    <select>
      {#each currencies as currency}
        <option>{currency}</option>
      {/each}
    </select>
    <label class="active">Currency</label>
    <i>arrow_drop_down</i>
  </div>
  <div class="field textarea label border">
    <textarea  bind:value={formData.note}></textarea>
    <label>Note</label>
  </div>
  <button class="small-elevate fill">Submit</button>
    <!-- <Textfield type="date" bind:value={date} label="Date" />
    <Textfield type="text" bind:value={formData.category} label="Category" />
    <Textfield bind:value={formData.amount} label="Amount" />
    <Select bind:value={formData.currency} label="Currency">
        {#each currencies as currency}
            <Option value={currency}>{currency}</Option>
        {/each}
    </Select>
    <Textfield textarea bind:value={formData.note} label="Note">
    </Textfield>
    <Button variant="raised">
        Submit
    </Button> -->
</form>

