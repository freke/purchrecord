<script lang="ts">
    import dayjs from 'dayjs';
    import { Input } from 'flowbite-svelte';
  
    export let format = 'YYYY-MM-DD';
    export let date = dayjs().format(format);
    export let id = "";
      
    let internal;
  
    const input = (x) => (internal = dayjs(x).format(format));
    const output = (x) => (date = dayjs(x).format(format));
  
    $: input(date);
    $: output(internal);
  </script>
  
  <Input {id} type="date" bind:value={internal} />