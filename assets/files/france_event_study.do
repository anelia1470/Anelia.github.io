* France event study - market note on French sovereign debt
* Anelia Yordanova, October 2026
* Data: LSEG Workspace, daily closes 2 Jan - 23 Oct 2026
* Question: did the French stocks fall because of France, or just because
* the European market fell?

clear all
set more off

* change to the folder where the csv is
* cd "C:\Users\...\france"

capture log close
log using france_event_study.log, replace text

import delimited "france_prices.csv", clear

* make a proper stata date
gen date2 = date(date, "YMD")
format date2 %td
drop date
rename date2 date
sort date

* trading day counter (so weekends/holidays dont mess up the lags)
gen t = _n
tsset t

* log returns in percent
foreach v in bnp gle carr lvmh vinci tte cac stoxx sx7p {
    gen r_`v' = 100*ln(`v'/L.`v')
}

* OAT-Bund spread in basis points + daily change
gen spread = 100*(fr10 - de10)
gen d_spread = D.spread

*-----------------------------------------
* PART 1: event study
* market model against STOXX Europe 600 (not CAC 40, since CAC is french itself)
* estimation window: 120 trading days, ending 10 days before the event
*-----------------------------------------

* find the event days
sum t if date == td(02oct2026)
local ev1 = r(mean)
sum t if date == td(19oct2026)
local ev2 = r(mean)

* empty file to collect the results
tempname results
postfile `results' str6 event str6 stock beta car01 t01 car13 t13 using car_results, replace

foreach e in 1 2 {
    local t0 = `ev`e''
    local start = `t0' - 129
    local end = `t0' - 10
    if `e'==1 local name "2oct"
    if `e'==2 local name "19oct"

    foreach s in bnp gle carr lvmh vinci tte cac sx7p {
        quietly reg r_`s' r_stoxx if t >= `start' & t <= `end'
        local b = _b[r_stoxx]
        local sd = e(rmse)
        quietly predict yhat
        gen ar = r_`s' - yhat

        * window 1: day 0 to day +1
        quietly sum ar if t >= `t0' & t <= `t0'+1
        local car01 = r(sum)
        local t01 = `car01' / (`sd'*sqrt(2))

        * window 2: day -1 to day +3
        quietly sum ar if t >= `t0'-1 & t <= `t0'+3
        local car13 = r(sum)
        local t13 = `car13' / (`sd'*sqrt(5))

        post `results' ("`name'") ("`s'") (`b') (`car01') (`t01') (`car13') (`t13')
        drop yhat ar
    }
}
postclose `results'

preserve
use car_results, clear
format beta car01 t01 car13 t13 %6.2f
list, sepby(event) noobs
export delimited using "car_results.csv", replace
restore

*-----------------------------------------
* PART 2: how sensitive is each stock to the spread?
* r_i = a + b*r_stoxx + c*d_spread, whole of 2026, robust SE
* c < 0 means the stock falls when the spread widens
*-----------------------------------------

foreach s in bnp gle carr lvmh vinci tte cac sx7p {
    display _n "----- `s' -----"
    reg r_`s' r_stoxx d_spread, robust
    display "effect of a 10bp wider spread: " %5.2f 10*_b[d_spread] "%"
}

log close
