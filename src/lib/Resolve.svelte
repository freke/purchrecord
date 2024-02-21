<script lang="ts">
    import dayjs from "dayjs";

    import { rate, convertToJPY } from "../stores/rates";
    import { Button, ButtonGroup, Card, Heading, Hr, P } from "flowbite-svelte";
    import {
        ChevronLeftOutline,
        ChevronRightOutline,
    } from "flowbite-svelte-icons";
    import { monthly } from "../stores/monthly";
    import { liveQuery } from "dexie";
    import { db, Purchase } from "./db";

    $: purchases = liveQuery(() =>
        db.purchases.filter((purchase) => purchase.resolved == null).toArray(),
    );

    $: david_purchases = liveQuery(() =>
        db.purchases.filter((purchase) => purchase.resolved == null && purchase.payment.paid.toLowerCase().includes("david") ).toArray(),
    );

    $: naoko_purchases = liveQuery(() =>
        db.purchases.filter((purchase) => purchase.resolved == null && purchase.payment.paid.toLowerCase().includes("naoko") ).toArray(),
    );

    let currentMonth = dayjs().startOf("month");

    function purchases_categories(
        purchases: Purchase[],
        year,
        month,
    ) {
        if(!purchases) {
            return []
        }
        return Array.from(
            new Set(
                purchases
                    .filter(
                        (p: Purchase) =>
                            dayjs(p.date).year() == year &&
                            (month == null || dayjs(p.date).month() == month),
                    )
                    .map((p: Purchase) => p.payment.category),
            ),
        )
            .map((c) => {
                return { name: c, selected: true };
            })
            .sort((a, b) => a.name.localeCompare(b.name));
    }

    function filter_current_month(value) {
        return dayjs(value.date).month() == currentMonth.month();
    }

    function filter_selected_category(value, categories) {
        const result = categories.find((c) => c.name == value.category);
        if (result) {
            return result.selected;
        }
        return false;
    }

    function filer_payer(value, payer) {
        if (
            (value.paid?.toLowerCase().includes("amex") &&
                value.paid?.toLowerCase().includes("david")) ||
            false
        ) {
            if (payer == "naoko") {
                return true;
            } else {
                return false;
            }
        } else {
            return value.paid?.toLowerCase().includes(payer) || false;
        }
    }

    function filter_amex(value, payer) {
        return (
            (value.category.toLowerCase().includes(payer) &&
                value.paid?.toLowerCase().includes("amex") &&
                value.paid?.toLowerCase().includes(payer)) ||
            false
        );
    }

    function get_purchases(
        rate,
        categories,
        payer,
    ): { category: string; amount: number }[] {
        if(!$purchases) return []
        return $purchases.map((purchase) => { return {category: purchase.payment.category, amount: purchase.payment.amount}})
    }

    function private_purchase_david(
        rate,
        categories,
    ): { category: string; amount: number }[] {
        const payer = "david";
        return $purchases
            ? $purchases.filter((value: Purchase) =>
                      filter_current_month(value),
                  )
                  .filter((value: Purchase) =>
                      filter_selected_category(value, categories),
                  )
                  .filter((value: Purchase) =>
                      filter_amex(value, payer),
                  )
                  .reduce((t, value: Purchase) => {
                      let i = t.findIndex((c) => c.category == value.payment.category);
                      if (i >= 0) {
                          t[i] = {
                              category: t[i].category,
                              amount:
                                  t[i].amount +
                                  convertToJPY(
                                      rate,
                                      value.payment.amount,
                                      value.payment.currency.currency,
                                  ),
                          };
                      } else {
                          t.push({
                              category: value.payment.category,
                              amount: convertToJPY(
                                  rate,
                                  value.payment.amount,
                                  value.payment.currency.currency,
                              ),
                          });
                      }
                      return t;
                  }, [])
                  .sort((a, b) => {
                      if (a.category < b.category) {
                          return -1;
                      } else if (a.category > b.category) {
                          return 1;
                      }
                      return 0;
                  })
            : [];
    }

    function total(categories) {
        return categories.reduce((acc, value) => value.amount + acc, 0);
    }

    function get_monthly(monthly, month) {
        const foundTransfer = monthly.filter(
            (transfer) => transfer.date === month.format("MMM YYYY"),
        );
        return foundTransfer[0] || null;
    }

    function save_monthly() {
        let monthly_to_save = {
            saved: false,
            date: currentMonth.format("MMM YYYY"),
            david: david_p,
            naoko: naoko_p,
            naoko_private: [],
            david_private: david_priv,
        };
        $monthly.push(monthly_to_save);
        $monthly = $monthly;
    }

    function get_this_monthly_totals(this_monthly) {
        if (!this_monthly) return { david: 0, david_private: 0, naoko: 0 };

        return {
            david: this_monthly.david.reduce(
                (acc, value) => value.amount + acc,
                0,
            ),
            david_private: this_monthly.david_private.reduce(
                (acc, value) => value.amount + acc,
                0,
            ),
            naoko: this_monthly.naoko.reduce(
                (acc, value) => value.amount + acc,
                0,
            ),
        };
    }

    $: this_monthly = get_monthly($monthly, currentMonth);
    $: this_month_totals = get_this_monthly_totals(this_monthly);

    $: categories = purchases_categories(
        $purchases,
        currentMonth.year(),
        currentMonth.month(),
    );

    $: david_p = get_purchases($rate, categories, "david");
    $: naoko_p = get_purchases($rate, categories, "naoko");
    $: david = total(david_p);
    $: naoko = total(naoko_p);
    $: david_priv = private_purchase_david($rate, categories);
    $: david_priv_amex = total(david_priv);
</script>

David
{#each $david_purchases || [] as purchase }
<div>{purchase.payment.category} {purchase.payment.amount}</div>    
{/each}

Naoko
{#each $naoko_purchases || [] as purchase }
<div>{purchase.payment.category} {purchase.payment.amount}</div>    
{/each}
