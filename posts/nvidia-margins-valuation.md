NVIDIA is one of the most profitable businesses ever measured. My valuation work suggests its share price still asks for more than the most likely outcome. This note summarises the results of my paper, *NVIDIA: Can AI Infrastructure Growth Sustain Its Extraordinary Valuation?*, valued at the close on 16 October 2026.

## What happened

NVIDIA's growth has accelerated again. Revenue was $96.2bn in the second quarter of fiscal 2027, up 106% from a year earlier, and the company guided to $108bn for the third quarter. That puts the full fiscal year on track for about **$400bn**, almost double the $215.9bn of fiscal 2026. Gross margin is back at 75%.

Then, in mid-October, chip stocks sold off worldwide. Inflation of 3.7% pushed the 10-year US Treasury yield above 5%, and investors started asking whether debt-financed AI spending can earn enough at those rates. On 16 October NVIDIA closed at **$214.13**, a market value of about **$5.17 trillion**.

## Why it matters

My paper asks one question: *to what extent is NVIDIA's valuation justified by sustainable profits and continued AI growth?* Four numbers sum up the answer.

**1. The business is exceptional.** NVIDIA designs its chips but outsources manufacturing, so it needs very little capital. In fiscal 2026 its return on invested capital was between 150% and 327%, depending on the definition, against a cost of capital of 11.7%. Economic profit (profit left over after paying for all the capital used) was about **$105bn**. Roughly 98% of the company's value is future economic profit the market expects it to earn.

**2. The price needs about 21% growth a year.** A reverse DCF takes the market price as given and solves for the performance needed to justify it. With a long-run operating margin of 55%, NVIDIA must grow revenue about **21% a year from fiscal 2027 to 2032**, to just over **$1 trillion**. Even at today's ~65% margin, it needs about 18% a year. For scale, the four largest cloud companies plan to spend about $730bn on capex in all of 2026.

**3. My base case is below the price.** I modelled three scenarios:

| Scenario | Revenue growth FY27–32 | Operating margin | Value per share | vs. $214 |
|---|---|---|---|---|
| Bear | 2% | 47% | $75 | −65% |
| Base | 14% | 55% | $155 | −28% |
| Bull | 24% | 62% | $289 | +35% |

The probability-weighted value is about **$168**. Only the bull case, where growth *and* margins both stay high, supports today's price. The base case explains roughly $3.6 trillion of the $5.05 trillion enterprise value; the remaining ~28% depends on near-bull-case performance.

**4. Growth matters more than margins, and rates matter a lot.** Going from 14% to 22% growth adds about $70 per share; going from a 55% to a 65% margin adds only about $25. Half the value sits in the terminal period, so a one-point change in the cost of capital moves the base value by about $20 per share. At a 10% discount rate, the required growth falls to about 16% a year. Part of what looks like optimism may simply be investors using a lower discount rate than I do.

That is why the October sell-off matters. Higher yields hurt NVIDIA twice: through a higher discount rate, and through its customers' cost of financing the AI build-out.

## What I'd watch next

1. **Hyperscaler capex guidance for 2027.** Customers' capex is NVIDIA's revenue. Any slowdown would hit growth, margins and working capital at the same time.
2. **How the build-out is financed.** The cloud companies are expected to spend about 90% of their operating cash flow on capex in 2026, and more of it is debt-funded. Tighter credit would show up in NVIDIA's orders.
3. **Custom chips and inference.** Google's TPU, Amazon's Trainium and AMD compete hardest on cost per token in inference. That is where NVIDIA's pricing power will be tested first.
4. **Gross margin as memory costs rise.** Q3 is guided at 74%. A slide toward the high 60s would challenge the margin assumptions behind every scenario.

My conclusion: **the debate about NVIDIA is about duration, not quality.** AI will almost certainly keep growing. The real question is whether NVIDIA can keep capturing a large share of that growth at exceptional returns while its biggest customers build alternatives. At $214, the price leaves little room for error.

<div class="paper-embed" data-src="posts/nvidia-paper.html" data-title="Read the full research paper" data-meta="All 11 sections, with the tables, charts and sensitivity analysis behind this note."></div>

You can test the same mechanics yourself in the [DCF tool in my finance lab](lab.html#dcf-h): small changes in WACC and terminal growth move the value a lot.

---

**Sources:** my paper *NVIDIA: Can AI Infrastructure Growth Sustain Its Extraordinary Valuation?* (autumn 2026), built on NVIDIA's Form 10-K filings and [Q2 FY2027 results](https://nvidianews.nvidia.com/news/nvidia-announces-financial-results-for-second-quarter-fiscal-2027), with market data from 16 October 2026.

*The valuation is a structured judgement under uncertainty, not a price target. These are my own views as a student, not investment advice.*
