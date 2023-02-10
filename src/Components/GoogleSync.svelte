<script>
    import Fab, { Icon } from '@smui/fab';
    import { purchases } from '../stores'

    const clientId = "732312482119-fs9q45r0j0pmfmjm1dren2hr9dodk8fn.apps.googleusercontent.com";
    let tokenClient;

    function toLocal(remote){
        const result = {};
        for (const row of remote) {
            const [ID, Date, Category, Amount, Currency] = row;
            result[ID] = {
                id: ID,
                date: Date,
                category: Category,
                amount: Amount,
                currency: Currency,
                sync: true
            };
        };
        return result;
    }

    function merge(dict1, dict2) {
        for (const [key, value] of Object.entries(dict2)) {
            if (!dict1.hasOwnProperty(key)) {
                dict1[key] = value;
            } else {
                dict1[key]['sync'] = true;
            }
        }
        return dict1;
    }

    function getToken() {
        tokenClient.requestAccessToken();
    }

    const handleCredentialResponse = async (tokenResponse) => {
        const apiKey = 'AIzaSyCcD8We_Nrh8tY42lP5X38OpZtrfdiuZjs';
        const spreadsheetId = '1P0gzwKMG_eBiPfgdaI3Ah2ABkAjJF1-eOpxms3nHy7A';
        const currentYear = new Date().getFullYear();
        const range = `Purchases${currentYear}!A2:E`;

        if (!tokenResponse || !tokenResponse.access_token) return;
        const { access_token } = tokenResponse;

        try {
            const get_rows_uri = `https://sheets.googleapis.com/v4/spreadsheets/${spreadsheetId}/values/${range}?key=${apiKey}`;
            const response = await fetch(get_rows_uri, { headers: new Headers({ Authorization: `Bearer ${access_token}` }) });
            const { values } = await response.json();

            if (values) {
            const synched = toLocal(values);
            $purchases = merge($purchases || {}, synched);
            }
        } catch (error) {
            console.error(error);
        }

        const append_row_uri = `https://sheets.googleapis.com/v4/spreadsheets/${spreadsheetId}/values/${range}:append?includeValuesInResponse=true&insertDataOption=INSERT_ROWS&responseDateTimeRenderOption=FORMATTED_STRING&responseValueRenderOption=UNFORMATTED_VALUE&valueInputOption=USER_ENTERED&key=${apiKey}`;
        const filteredData = Object.entries($purchases || {}).filter(([, value]) => !('sync' in value) || value.sync === false);

        for (const [, item] of filteredData) {
            try {
            const data_to_append = [item.id, item.date, item.category, item.amount, item.currency];
            const response = await fetch(append_row_uri, {
                method: 'POST',
                body: JSON.stringify({ values: [data_to_append] }),
                headers: new Headers({ Accept: 'application/json', 'Content-Type': 'application/json', Authorization: `Bearer ${access_token}` }),
            });
            await response.json();
            $purchases[item.id].sync = true;
            } catch (error) {
            console.error(error);
            }
        }
    }

    function gisInit() {
        tokenClient = google.accounts.oauth2.initTokenClient({
            client_id: clientId,
            scope: 'https://www.googleapis.com/auth/spreadsheets',
            callback: handleCredentialResponse,
        });
    }

    function convertArrayToCSV(dataArray) {
        const csvData = Object.keys(dataArray[0]).join(',') + '\n' + dataArray.map(row => Object.values(row).join(',')).join('\n');
        return csvData;
    }

    function saveAsCvs(){
        const csvData = convertArrayToCSV(Object.values(records).map(item => { return {'date': item.date, 'amount': item.amount, 'currency': item.currency, 'category': item.category} }));
        const blob = new Blob([csvData], {type: 'text/csv;charset=utf-8'});
        saveAs(blob, 'data.csv');
    }
</script>

<svelte:head>
    <script async defer src="https://accounts.google.com/gsi/client" on:load={gisInit}></script>
</svelte:head>

<Fab on:click={getToken}>
    <Icon class="material-icons">cloud_sync</Icon>
</Fab>


<!-- <button on:click={saveAsCvs}>Download CSV</button> -->