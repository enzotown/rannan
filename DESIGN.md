# Rännan — vattenverkstaden

## Målgrupp
Barn 4–7 år, spelar själva på iPad (liggande eller stående) eller med mus.
Ingen läsning krävs: allt går att förstå genom att titta och prova.

## Lärandemål
- **Orsak–verkan:** vattnet rinner dit brädan lutar, inte dit man vill.
- **Lutning och gravitation:** brantare bräda ger fortare vatten; vattnet faller rakt ner.
- **Planering före handling:** bygga en väg innan man vrider på kranen.
- **Felsökning utan rädsla:** det går alltid att flytta en bräda och prova igen.

## Objekt
| Objekt | Roll |
|---|---|
| Kranen med ratt | startar/stoppar vattnet (tryck på ratten) |
| Bräda nedåt höger / nedåt vänster / rak | byggstenar, dras från hyllan till rutnätet |
| Rutnät 7×4 | placeringsyta, en bräda per ruta |
| Krukan med blomman | mål: 26–34 droppar får blomman att blomma |
| Kotten | står vid krukan och blir glad när blomman blommar |
| Fåglar, sol, moln, pölar | stämning; pölar där vattnet hamnar fel |

## Motor
Egen liten 2D-motor i tre lager: `engine.js` (yta, ljud, fysik), `art.js`+`art2.js`+`art3.js`
(teckning), `app.js` (nivåer och inmatning), `loop.js` (spelvarv).
Fysiken är droppbaserad: varje droppe faller med gravitation 1500 px/s², landar på en
brädas yta, glider längs den med acceleration från lutningen och lämnar brädan med
kvarvarande fart (55 % av glidefarten). Träffar den krukan fylls den, träffar den marken
blir det en pöl. Inget kan gå sönder och vattnet tar aldrig slut.

## Nivåer
1. **Rakt ner** — tre brädor nedåt höger, krukan nära.
2. **Åt andra hållet** — kranen till höger, brädor nedåt vänster.
3. **Hela vägen fram** — fem brädor, två raka på slutet.

Nivåerna loopar; efter varje klar blomma laddas nästa. Efter 20 sekunder utan bygge
visas en skiss på en fungerande väg (sex sekunder).