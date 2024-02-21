<script lang="ts">
    import dayjs from 'dayjs';
    import { Input } from 'flowbite-svelte';
  
    let format = 'YYYY-MM-DD';
    export let date: number = dayjs().unix();
    export let id = "";
      
    let internal;
  
    const input = (x) => (internal = dayjs.unix(x).format(format));
    const output = (x) => (date = dayjs(x).unix());
  
    $: input(date);
    $: output(internal);
  </script>
  
  <Input {id} type="date" bind:value={internal} />