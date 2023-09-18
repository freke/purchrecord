<script lang="ts">
    import dayjs from 'dayjs';
  
    export let format = 'YYYY-MM-DD';
    export let date = dayjs().format(format);
    export let id = "";
      
    let internal;
  
    const input = (x) => (internal = dayjs(x).format(format));
    const output = (x) => (date = dayjs(x).format(format));
  
    $: input(date);
    $: output(internal);
  </script>
  
  <input {id} type="date" bind:value={internal} />