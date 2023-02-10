<script lang="ts">
    import Button, { Label } from '@smui/button';
    import Textfield from '@smui/textfield';
    import HelperText from '@smui/textfield/helper-text';
    import Select, { Option } from '@smui/select';
    import { v4 as uuidv4 } from 'uuid';
    import {purchases, Purchase} from '../stores';
    
   
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

    let newCategoryLable = '';
    let currencies = ['JPY', 'SEK'];

    $: date=formData.date.toISOString().substring(0, 10)
</script>

<form on:submit|preventDefault={submitForm}>
    <Textfield type="date" bind:value={date} label="Date" />
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
    </Button>
</form>

