NVIDIA is back near a $6 trillion market value. My take: the price doesn't depend on whether AI keeps growing. It depends on whether NVIDIA can keep growing without giving up its margins, and the last earnings call showed that margins are where the pressure starts.

## What happened

On 26 August NVIDIA reported its second quarter of fiscal 2027:

| | Q2 FY2027 | Change from a year ago |
|---|---|---|
| Revenue | $96.2bn | +106% |
| Data Center revenue | $89.0bn | +117% |
| Gross margin | 75.0% | |
| Operating income | $63.7bn | 66% of revenue |

Guidance for the next quarter is $108bn in revenue. Management also gave a preliminary outlook of roughly 70% revenue growth for fiscal 2028.

There was one weaker signal, and I think it matters most. Gross margin is guided down from 75% to 74% next quarter, with management pointing to 71–72% in Q4. Memory prices have risen faster than NVIDIA expected and are, in the CFO's words, "headed even higher into next year".

The market looked past it. In early October the stock hit a record high, close to $6 trillion in market value. It sits around $5.5 trillion as I write.

## Why it matters

This is the exact question in my paper, *NVIDIA: Can AI Infrastructure Growth Sustain Its Extraordinary Valuation?* The paper doesn't ask whether NVIDIA is profitable, because it clearly is. It asks what combination of growth and margins the current price requires.

A quick reverse DCF makes the bar concrete. Start with an enterprise value of about $5.5 trillion: market value, minus about $63bn of cash and securities, plus about $9bn of debt. Then ask what level of free cash flow, growing 3% a year forever at a 10% cost of capital, would justify that price:

> Required free cash flow ≈ $5.5 trillion × (10% − 3%) ≈ **$385bn a year**

That is almost four times the $103bn of operating cash flow NVIDIA generated in fiscal 2026. It is also very close to analysts' consensus earnings for fiscal 2028, about $380bn (around $15.70 per share).

So the price roughly assumes that NVIDIA delivers consensus earnings two years from now, and that those earnings then hold up and grow slowly for decades. The second part is where margins come in. In my scenario analysis, a bear case with operating margins around 45–50% instead of today's ~60–66% still leaves an extremely profitable company. But at a given revenue level it removes about a quarter of operating profit, so the valuation needs even more growth to make up for it.

The memory-cost warning is a small, real-world example of that mechanism. NVIDIA's high return on invested capital comes partly from an asset-light model where suppliers do the manufacturing. When a supplier gains pricing power, part of NVIDIA's margin moves to the supplier.

Two things work in NVIDIA's favour:

- **Customers are still spending more.** The five largest cloud providers are expected to raise capital spending from close to $800bn in 2026 to about $1.3 trillion in 2027.
- **The multiple is lower than it looks.** On consensus fiscal 2028 earnings, the stock trades at about 15 times. That is not extreme for a company growing this fast, as long as those earnings arrive.

## What I'd watch next

1. **Gross margin in Q4 and the first half of fiscal 2028.** If it settles at 71–73% as guided, the memory hit is a cost to absorb. If it keeps sliding toward the high 60s, the market's assumption about durable profitability is being tested.
2. **Hyperscaler capex guidance for 2027.** The $1.3 trillion expectation is the revenue engine. Any cut would hit growth and pricing power at the same time.
3. **The Vera Rubin ramp.** Rubin is expected to be about 20% of Data Center revenue next quarter. New platforms carry ramp costs, so this is where we'll see whether NVIDIA can grow and protect margins together.

My conclusion from the paper still holds. NVIDIA can be an outstanding company and still be priced for an outcome that requires everything to go right. The next two quarters of margins will tell us how much room for error the price really has.

You can try the same logic yourself in the [DCF tool in my finance lab](lab.html#dcf-h): small changes to WACC and terminal growth move the value a lot.

---

**Sources:** [NVIDIA Q2 FY2027 results](https://nvidianews.nvidia.com/news/nvidia-announces-financial-results-for-second-quarter-fiscal-2027) · [Earnings call summary, BigGo Finance](https://finance.biggo.com/news/US_NVDA_2026-08-26) · [Yahoo Finance, 12 Oct 2026](https://finance.yahoo.com/markets/stocks/articles/nvidia-5-5-trillion-valuation-133034196.html) · [24/7 Wall St., 13 Oct 2026](https://247wallst.com/investing/2026/10/13/nvidia-stock-has-a-massive-ai-tailwind-heres-the-bull-case/) · NVIDIA Annual Report FY2026

*The reverse DCF here is a simplified illustration, not a forecast. These are my own views as a student, not investment advice.*
