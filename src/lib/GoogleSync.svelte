<script lang="ts">
    import { purchases } from "../stores/purchases";
    import type { Purchase } from "../stores/purchases";
    import { deleted } from "../stores/deleted";
    import { budget } from "../stores/budget";
    import type { Budget } from "../stores/budget";
    import "beercss";
    import "material-dynamic-colors";
    import dayjs from "dayjs";

    const clientId =
        "732312482119-fs9q45r0j0pmfmjm1dren2hr9dodk8fn.apps.googleusercontent.com";
    const purRange = `Purchases${dayjs().year()}!A2:G`; //Release
    const purSheetId = 242573883; //Release
    //const purRange = `PurchasesDev!A2:G`; //Dev
    //const purSheetId = 705934810 //Dev
    const delRange = `Deleted!A1:A`;
    const delSheetId = 701309837;
    const apiKey = "AIzaSyCcD8We_Nrh8tY42lP5X38OpZtrfdiuZjs";
    const spreadsheetId = "1P0gzwKMG_eBiPfgdaI3Ah2ABkAjJF1-eOpxms3nHy7A";
    let tokenClient;

    function toLocal(remote, row = 1) {
        const result = {} as { [id: string]: Purchase };
        let row_num = row;
        for (const row of remote) {
            const [ID, DateStr, Category, Amount, Currency, Note, Image] = row;
            result[ID] = {
                id: ID,
                date: dayjs(DateStr).toDate(),
                category: Category,
                amount: parseFloat(Amount.replace(/,/g, "")),
                currency: Currency,
                note: Note || "",
                sync: true,
                row: row_num,
                image: Image,
            };
            row_num = row_num + 1;
        }
        return result;
    }

    function merge(dict1, dict2) {
        for (const [key, value] of Object.entries(dict2)) {
            if (!dict1.hasOwnProperty(key)) {
                dict1[key] = value;
            } else {
                dict1[key]["sync"] = true;
            }
            dict1[key]["row"] = dict2[key]["row"];
        }
        return dict1;
    }

    function getToken() {
        tokenClient.requestAccessToken();
    }

    async function getPurchases(access_token) {
        try {
            const { values } = await getRow(purRange, access_token);
            if (values) {
                return toLocal(values);
            }
        } catch (error) {
            console.error(error);
        }
        return {};
    }

    async function getBudget(
        access_token: string,
        year: number
    ): Promise<Budget[]> {
        try {
            const updatedBudget = $budget.filter(budget => budget.year !== year);
            const budgetRange = `Budget${year}!A2:M`;
            const { values } = await getRow(budgetRange, access_token);
            if (values) {
                const budgetArray: Budget[] = values.reduce(
                    (acc: Budget[], [name, ...values]) => {
                        const row = values.slice(0, 12).map((value, index) => ({
                            month: index,
                            value: parseFloat(value.replace(/,/g, "")),
                        }));

                        const budget = acc.find((b) => b.year === year);
                        if (budget) {
                            budget.categories.push({ name, row })
                        } else {
                            acc.push({
                                year,
                                categories: [
                                    {
                                        name,
                                        row,
                                    },
                                ],
                            });
                        }
                        return acc;
                    },
                    updatedBudget
                );

                return budgetArray;
            }
        } catch (error) {
            console.error(error);
        }

        return [];
    }

    function getContentTypeFromDataURL(dataURL) {
        const match = dataURL.match(
            /^data:([a-zA-Z0-9]+\/[a-zA-Z0-9-.+]+).*,.*/
        );
        if (match && match.length > 1) {
            return match[1];
        }
        return null;
    }

    async function uploadImage(item, access_token) {
        const headers = new Headers();
        headers.append("Authorization", `Bearer ${access_token}`);
        headers.append(
            "Content-Type",
            "multipart/related; boundary=foo_bar_baz"
        );
        const image = await fetch(item.url).then((res) => res.blob());
        const fileMetadata = {
            name: `${item.id}.jpg`,
            parents: ["1nPSN4U6jaCu386SHyZtO-f1nOrtV1Byp"],
        };

        const blob = new Blob(
            [
                "--foo_bar_baz",
                "\r\n",
                "Content-Type: application/json; charset=UTF-8",
                "\r\n\r\n",
                JSON.stringify(fileMetadata),
                "\r\n",
                "--foo_bar_baz",
                "\r\n",
                `Content-Type: ${getContentTypeFromDataURL(item.url)}`,
                "\r\n\r\n",
                new Blob([image], { type: image.type }),
                "\r\n",
                "--foo_bar_baz--",
                "\r\n",
            ],
            { type: "multipart/related" }
        );
        const response = await fetch(
            `https://www.googleapis.com/upload/drive/v3/files?uploadType=multipart`,
            {
                method: "POST",
                headers,
                body: blob,
            }
        );
        const jsonResponse = await response.json();
        const fileId = jsonResponse.id;
        return `https://drive.google.com/uc?export=view&id=${fileId}`;
    }

    async function addPurchases(new_purchases, access_token) {
        if (!new_purchases.length) {
            return {};
        }
        try {
            new_purchases = await Promise.all(
                new_purchases.map(async ([, item]) => {
                    let row = [
                        item.id,
                        item.date,
                        item.category,
                        item.amount,
                        item.currency,
                        item.note,
                    ];
                    if (item.image && item.image != "") {
                        let image_url = await uploadImage(
                            item,
                            access_token
                        );
                        row.push(image_url);
                    }
                    return row;
                })
            );
            const values = await addRows(purRange, new_purchases, access_token);
            const match = values.updates.updatedData.range.match(/!\D+(\d+)/);
            return toLocal(
                values.updates.updatedData.values || [],
                parseInt(match[1])
            );
        } catch (error) {
            console.error(error);
        }
    }

    async function delPurchases(rows, access_token) {
        return deleteRow(
            $deleted.map((del) => del.row),
            access_token
        );
    }

    async function getDelPurchases(access_token) {
        try {
            const { values } = await getRow(delRange, access_token);
            return values;
        } catch (error) {
            console.error(error);
        }
    }

    async function getRow(rowId, accessToken) {
        const get_rows_uri = `https://sheets.googleapis.com/v4/spreadsheets/${spreadsheetId}/values/${rowId}?key=${apiKey}`;
        const response = await fetch(get_rows_uri, {
            headers: new Headers({ Authorization: `Bearer ${accessToken}` }),
        });
        return await response.json();
    }

    async function deleteRow(rowIds, accessToken) {
        if (rowIds.length === 0) {
            return;
        }
        rowIds.sort((a, b) => b - a);
        let requests = rowIds.map((row) => ({
            deleteDimension: {
                range: {
                    sheetId: purSheetId,
                    dimension: "ROWS",
                    startIndex: row,
                    endIndex: row + 1,
                },
            },
        }));

        const request = await fetch(
            `https://sheets.googleapis.com/v4/spreadsheets/${spreadsheetId}:batchUpdate?key=${apiKey}`,
            {
                method: "POST",
                body: JSON.stringify({ requests: requests }),
                headers: {
                    Authorization: `Bearer ${accessToken}`,
                    "Content-Type": "application/json",
                },
            }
        );
        const response = await request.json();
        return response;
    }

    async function addRows(rowId, values, accessToken) {
        const options =
            "includeValuesInResponse=true&insertDataOption=INSERT_ROWS&responseDateTimeRenderOption=FORMATTED_STRING&responseValueRenderOption=UNFORMATTED_VALUE&valueInputOption=USER_ENTERED";
        const append_row_uri = `https://sheets.googleapis.com/v4/spreadsheets/${spreadsheetId}/values/${rowId}:append?${options}&key=${apiKey}`;
        const response = await fetch(append_row_uri, {
            method: "POST",
            body: JSON.stringify({ values: values }),
            headers: new Headers({
                Accept: "application/json",
                "Content-Type": "application/json",
                Authorization: `Bearer ${accessToken}`,
            }),
        });
        return await response.json();
    }

    const handleCredentialResponse = async (tokenResponse) => {
        if (!tokenResponse || !tokenResponse.access_token) return;
        const { access_token } = tokenResponse;

        const toDelete = await getDelPurchases(access_token);
        if (toDelete) {
            $purchases = Object.fromEntries(
                Object.entries($purchases).filter(
                    ([key]) => !toDelete.flat().includes(key)
                )
            );
            $deleted = $deleted.filter((val) => !toDelete.includes(val));
        }
        await addRows(
            delRange,
            $deleted.map((d) => [d.id]),
            access_token
        );
        await delPurchases($deleted, access_token);

        const filteredData = Object.entries($purchases || {}).filter(
            ([, value]: [string, Purchase]) =>
                !("sync" in value) || value.sync === false
        );
        await addPurchases(filteredData, access_token);

        $purchases = merge(await getPurchases(access_token), $purchases || {});
        $deleted = [];
        $budget = (await getBudget(access_token, dayjs().year())) as Budget[];
    };

    function gisInit() {
        tokenClient = google.accounts.oauth2.initTokenClient({
            client_id: clientId,
            scope: "https://www.googleapis.com/auth/spreadsheets https://www.googleapis.com/auth/drive",
            callback: handleCredentialResponse,
        });
    }

    $: all_synced =
        Object.entries($purchases).reduce(
            (t, [_, value]: [string, Purchase]) => t && value.sync,
            true
        ) && $deleted.length === 0;
</script>

<svelte:head>
    <script
        async
        defer
        src="https://accounts.google.com/gsi/client"
        on:load={gisInit}
    ></script>
</svelte:head>

<button
    class="extend circle small-elevate"
    class:secondary={all_synced}
    on:click={getToken}
>
    {#if all_synced}
        <i>cloud_done</i>
    {:else}
        <i>cloud_sync</i>
    {/if}
    <span>Sync</span>
</button>
