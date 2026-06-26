export function buildDays(monthValue){

const date =
new Date(monthValue)

const year =
date.getFullYear()

const month =
date.getMonth()

const lastDay =
new Date(
year,
month + 1,
0
).getDate()

const days = []

for(let day=1; day<=lastDay; day++){

const d =
new Date(year,month,day)

days.push({

day,

date:
year
+
"-"
+
String(month + 1).padStart(2,"0")
+
"-"
+
String(day).padStart(2,"0"),

weekday:
d.getDay()

})
}
return days

}