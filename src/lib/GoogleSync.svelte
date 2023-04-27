<script lang="ts">
    import { onMount } from "svelte";
    import dayjs from "dayjs";
    import type { Purchase } from "../stores/purchases";
    import { purchases } from "../stores/purchases";
    import { deleted } from "../stores/deleted";
    import { budget } from "../stores/budget";
    import type { Budget } from "../stores/budget";

    const clientId =
        "732312482119-fs9q45r0j0pmfmjm1dren2hr9dodk8fn.apps.googleusercontent.com";
    const spreadsheetId = "1P0gzwKMG_eBiPfgdaI3Ah2ABkAjJF1-eOpxms3nHy7A";
    const purchasesSheetName = "Purchases";
    const purchasesCurrentYear = `${purchasesSheetName}${dayjs().year()}`;
    const purchasesSheetRange = "A2:G";

    let gapiLoadOkay = null;
    let gapiLoadFail = null;

    let gisLoadOkay = null;
    let gisLoadFail = null;

    let showEventsBtn = false;
    let showRevokeBtn = false;

    const gapiLoadPromise = new Promise((resolve, reject) => {
        gapiLoadOkay = resolve;
        gapiLoadFail = reject;
    });
    const gisLoadPromise = new Promise((resolve, reject) => {
        gisLoadOkay = resolve;
        gisLoadFail = reject;
    });

    var tokenClient;

    async function callGoogleApi(apiFunction, ...args) {
        let response;
        try {
            response = await apiFunction(...args);
        } catch (err) {
            await getToken(err);
            response = await apiFunction(...args);
        }
        return response;
    }

    onMount(async () => {
        await gapiLoadPromise;
        await new Promise((resolve, reject) => {
            gapi.load("client", { callback: resolve, onerror: reject });
        });
        await gapi.client.init({}).then(function () {
            // Load the Calendar API discovery document.
            gapi.client.load(
                "https://sheets.googleapis.com/$discovery/rest?version=v4"
            );
            gapi.client.load(
                "https://www.googleapis.com/discovery/v1/apis/drive/v3/rest"
            );
        });

        await gisLoadPromise;
        await new Promise<void>((resolve, reject) => {
            try {
                tokenClient = google.accounts.oauth2.initTokenClient({
                    client_id: clientId,
                    scope: "https://www.googleapis.com/auth/spreadsheets https://www.googleapis.com/auth/drive",
                    prompt: "consent",
                    callback: "", // defined at request time in await/promise scope.
                });
                resolve();
            } catch (err) {
                reject(err);
            }
        });

        showEventsBtn = true;
        showRevokeBtn = true;
    });

    async function newPurchaseSheet(spreadsheet_id, name) {
        const min = 10000;
        const max = 99999;
        const newSheetId = Math.floor(Math.random() * (max - min + 1)) + min;
        const titles = [
            "ID",
            "Date",
            "Category",
            "Amount",
            "Currency",
            "Note",
            "Image",
        ];
        const values = titles.map((title) => {
            return { userEnteredValue: { stringValue: title } };
        });
        const requests = [
            {
                addSheet: {
                    properties: {
                        sheetId: newSheetId,
                        title: name,
                    },
                },
            },
            {
                updateCells: {
                    start: {
                        sheetId: newSheetId,
                    },
                    rows: [{ values: values }],
                    fields: "userEnteredValue",
                },
            },
        ];

        const spreadsheets_response = await callGoogleApi(
            gapi.client.sheets.spreadsheets.batchUpdate,
            { spreadsheetId: spreadsheet_id },
            { requests: requests }
        );

        console.log(`New spreadsheet created with ID: ${newSheetId}`);
        return spreadsheets_response.result.replies[0].addSheet;
    }

    async function findSheetByName(spreadsheet_id, sheetName, create = null) {
        let q = {
            spreadsheetId: spreadsheet_id,
            includeGridData: false,
        };
        const spreadsheets_response = await callGoogleApi(
            gapi.client.sheets.spreadsheets.get,
            q
        );

        const sheetsArray = spreadsheets_response.result.sheets;
        for (let i = 0; i < sheetsArray.length; i++) {
            if (sheetsArray[i].properties.title === sheetName) {
                return sheetsArray[i].properties;
            }
        }
        if(create){
            const newSheet = await create(spreadsheet_id, sheetName);
            return newSheet.properties;
        }
        throw new Error("Not found");
    }

    async function getToken(err) {
        if (
            err.result.error.code == 401 ||
            (err.result.error.code == 403 &&
                err.result.error.status == "PERMISSION_DENIED")
        ) {
            await new Promise((resolve, reject) => {
                try {
                    tokenClient.callback = (resp) => {
                        if (resp.error !== undefined) {
                            reject(resp);
                        }
                        resolve(resp);
                    };
                    tokenClient.requestAccessToken();
                } catch (err) {
                    console.log(err);
                }
            });
        } else {
            throw new Error(err);
        }
    }

    function revokeToken() {
        let cred = gapi.client.getToken();
        if (cred !== null) {
            google.accounts.oauth2.revoke(cred.access_token, () => {
                console.log("Revoked: " + cred.access_token);
            });
            gapi.client.setToken("");
        }
    }

    function parsePurcahses(remote, row = 1) {
        let result = {};
        let row_num = row;
        for (const row of remote) {
            const [ID, DateStr, Category, Amount, Currency, Note, Image] = row;
            result[ID] = {
                id: ID,
                date: DateStr,
                category: Category,
                amount:
                    typeof Amount === "string"
                        ? parseFloat(Amount.replace(/,/g, ""))
                        : Amount,
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

    function getContentTypeFromDataURL(dataURL) {
        const match = dataURL.match(
            /^data:([a-zA-Z0-9]+\/[a-zA-Z0-9-.+]+).*,.*/
        );
        if (match && match.length > 1) {
            return match[1];
        }
        return null;
    }

    async function uploadImage(item) {
        const cred = gapi.client.getToken();
        const headers = new Headers();
        if (cred) {
            headers.append("Authorization", `Bearer ${cred.access_token}`);
        }
        headers.append(
            "Content-Type",
            "multipart/related; boundary=foo_bar_baz"
        );
        const image = await fetch(item.image).then((res) => res.blob());
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
                `Content-Type: ${getContentTypeFromDataURL(item.image)}`,
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

        if (!response.ok) {
            const error = await response.json();
            throw {result: error};
        }

        const data = await response.json();
        const result = {
            kind: "drive#file",
            id: data.id,
            name: data.name,
            mimeType: data.mimeType,
        };

        return {
            result,
            status: response.status,
            headers: {},
        };
    }

    async function getRows(spreadsheet_id, range) {
        let q = {
            spreadsheetId: spreadsheet_id,
            range: range, // for example: List 1!A1:B6
        };
        return await callGoogleApi(
            gapi.client.sheets.spreadsheets.values.get,
            q
        );
    }

    async function addRows(spreadsheet_id, range, values) {
        let q = {
            spreadsheetId: spreadsheet_id,
            range: range, // for example: List 1!A1:B6
            valueInputOption: 'USER_ENTERED',
        };
        return await callGoogleApi(
            gapi.client.sheets.spreadsheets.values.append,
            q, { range: range, values: values }
        );
    }

    async function deleteRows(spreadsheet_id, sheet_id, rowIds) {
        if (rowIds.length === 0) {
            return;
        }
        rowIds.sort((a, b) => b - a);
        let requests = rowIds.map((row) => ({
            deleteDimension: {
                range: {
                    sheetId: sheet_id,
                    dimension: "ROWS",
                    startIndex: row,
                    endIndex: row + 1,
                },
            },
        }));

        return await callGoogleApi(
            gapi.client.sheets.spreadsheets.batchUpdate,
            { spreadsheetId: spreadsheet_id },
            { requests: requests }
        );
    }

    async function getPurchases() {
        const json_responce = await getRows(
            spreadsheetId,
            `${purchasesCurrentYear}!${purchasesSheetRange}`
        );
        return parsePurcahses(json_responce.result.values || []);
    }

    function toLocal(remote, row = 1) {
        const result = {} as { [id: string]: Purchase };
        let row_num = row;
        for (const row of remote) {
            const [ID, DateStr, Category, Amount, Currency, Note, Image] = row;
            result[ID] = {
                id: ID,
                date: DateStr,
                category: Category,
                amount:
                    typeof Amount === "string"
                        ? parseFloat(Amount.replace(/,/g, ""))
                        : Amount,
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

    async function getDelPurchases() {
        try {
            const { values } = await getRows(spreadsheetId, `Deleted!A1:A`);
            return values;
        } catch (error) {
            console.error(error);
        }
    }

    async function addDelPurchases(toDelete){
        try{
            await addRows(
                spreadsheetId,
                `Deleted!A1:A`,
                toDelete.map((d) => [d.id])
            );
        } catch (error) {
            console.error(error);
        }
    }

    async function addPurchases(new_purchases) {
        if (!new_purchases.length) {
            return {};
        }
        try {
            let new_purchases_google = await Promise.all(
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
                        const image_upload_response = await callGoogleApi(
                            uploadImage,
                            item
                        );
                        let image_url = `https://drive.google.com/uc?export=view&id=${image_upload_response.result.id}`;
                        row.push(image_url);
                    }
                    return row;
                })
            );
            const purchasesByYear = new_purchases_google.reduce((acc, item) => {
                const year = dayjs(item[1]).year();
                if (!acc[year]) {
                    acc[year] = [];
                }
                acc[year].push(item);
                return acc;
            }, {});

            for (const year in purchasesByYear) {
                const sheet = await findSheetByName(
                    spreadsheetId,
                    `${purchasesSheetName}${year}`,
                    newPurchaseSheet
                );
                const values = await addRows(
                    spreadsheetId,
                    `${purchasesSheetName}${year}!${purchasesSheetRange}`,
                    purchasesByYear[year]
                );
                const match =
                    values.updates.updatedData.range.match(/!\D+(\d+)/);
                toLocal(
                    values.updates.updatedData.values || [],
                    parseInt(match[1])
                );
            }
        } catch (error) {
            console.error(error);
        }
    }

    async function delPurchases(rows, year) {
        const sheet = await findSheetByName(
            spreadsheetId,
            `${purchasesSheetName}${year}`,
            newPurchaseSheet
        );
        return deleteRows(
            spreadsheetId,
            sheet.id,
            rows.map((del) => del.row)
        );
    }

    function merge(dict1, dict2) {
        for (const [key, value] of Object.entries(dict2)) {
            if (!dict1.hasOwnProperty(key)) {
                dict1[key] = value;
            } else {
                dict1[key]["sync"] = true;
            }
            if(dict2[key]["row"])
                dict1[key]["row"] = dict2[key]["row"];
            else
                dict2[key]["row"] = dict1[key]["row"];
        }
        return dict1;
    }

    async function getBudget(
        year: number
    ): Promise<Budget[]> {
        try {
            const updatedBudget = $budget.filter(budget => budget.year !== year);
            const budgetRange = `Budget${year}!A2:M`;
            const response = await getRows(spreadsheetId, budgetRange);
            const values = response.result.values;
            if (values) {
                const budgetArray: Budget[] = values.reduce(
                    (acc: Budget[], [name, ...values]) => {
                        const row = values.slice(0, 12).map((value, index) => ({
                            month: index,
                            value: typeof value === 'string' ? parseFloat(value.replace(/,/g, "")) : value,
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

    async function sync() {
        const year = dayjs().year();
        const toDelete = await getDelPurchases();
        if (toDelete) {
            $purchases = Object.fromEntries(
                Object.entries($purchases).filter(
                    ([key]) => !toDelete.flat().includes(key)
                )
            );
            $deleted = $deleted.filter((val) => !toDelete.includes(val));
        }
        await addDelPurchases($deleted);

        await delPurchases($deleted, year);

        const filteredData = Object.entries($purchases || {}).filter(
            ([, value]: [string, Purchase]) =>
                !("sync" in value) || value.sync === false
        );
        await addPurchases(filteredData);
        $purchases = merge(await getPurchases(), $purchases || {});
        $deleted = [];
        $budget = (await getBudget(dayjs().year())) as Budget[];
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
        src="https://apis.google.com/js/api.js"
        on:load={gapiLoadOkay}
        on:error={gapiLoadFail}
    ></script>

    <script
        async
        defer
        src="https://accounts.google.com/gsi/client"
        on:load={gisLoadOkay}
        on:error={gisLoadFail}
    ></script>
</svelte:head>

<div class="g_id_signin" data-type="standard" />

<button
    class="extend circle small-elevate"
    class:secondary={all_synced}
    on:click={sync}
>
    {#if all_synced}
        <i>cloud_done</i>
    {:else}
        <i>cloud_sync</i>
    {/if}
    <span>Sync</span>
</button>