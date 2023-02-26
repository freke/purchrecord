<script lang="ts">
    import {purchases} from '../stores/purchases';
    import type {Purchase} from '../stores/purchases';
    import { deleted } from '../stores/deleted';

    $: all_synced = (Object.entries($purchases).reduce((t, [_,value]: [string, Purchase]) => t && value.sync, true) && $deleted.length === 0)
</script>

<i class:red-text={!all_synced} class:green-text={all_synced}>{all_synced ? 'check_circle' : 'error'}</i>