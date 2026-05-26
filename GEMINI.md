# UGC Production Tracker

Tento projekt je webový nástroj pro sledování produkce UGC (User Generated Content) videí. Umožňuje organizovat práci podle tvůrců a aplikací a sledovat detailní stav produkce každého videa v přehledném tabulkovém zobrazení.

## Přehled Projektu

- **Účel:** Spreadsheet checklist pro sledování produkčního workflow.
- **Technologie:** React, TypeScript, Vite, Lucide-React pro ikony.
- **Ukládání dat:** Všechna data jsou ukládána lokálně v prohlížeči pomocí `localStorage`. Možnost ručního exportu/importu do JSON.

## Hlavní Funkce

- **Workflow (Tabulkový layout):** Videa jsou zobrazena v řádcích s interaktivním postupem (Dabing → Titulky → Pub). Kliknutím na sekci produkce se stav cyklicky mění.
- **Organizace:** Seskupování videí podle tvůrců. Nově lze neomezeně přidávat, přejmenovávat a mazat aplikace (karty).
- **Hromadné akce:** Podpora multi-výběru videí (checkboxy) s plovoucí lištou pro hromadnou změnu stavu nebo smazání.
- **Sbalitelné sekce:** Možnost sbalit sekci tvůrce s rychlým souhrnem progresu (zobrazuje reálný stav i při aktivních filtrech). Vždy viditelní tvůrci i bez videí.
- **Správa Tvůrců, Aplikací a Tagů:** Centrální okna pro správu seznamu tvůrců, aplikací (s migrací dat) a pokročilé barvení tagů.
- **Chytré barvení tagů:** Možnost přiřadit libovolnou HEX barvu tagům a jazykům pomocí profesionálního "Studio" color pickeru s pipetou a 18 presety. Logika používá inteligentní shodu celých slov (word boundaries), aby se předešlo chybným shodu (např. jazyk "en" už neovlivňuje slovo "recenze").
- **Rozbalovací správa:** Výběr barev v Tag Manageru je defaultně skrytý a rozbalí se až po kliknutí na konkrétní tag, což zajišťuje maximální přehlednost.
- **Poznámky:** Pole pro poznámky se po kliknutí rozbalí do prostorného editoru, který se vznáší nad tabulkou (absolute positioning) a nezpůsobuje posouvání okolních řádků.
- **Video Odkazy a Cesty:** Cesty k souborům lze editovat přímo v řádku. Po zkopírování cesty (tlačítko "Kopírovat") se zobrazí oznámení (toast) s klávesovými zkratkami pro bleskové otevření ve Finderu (Cmd+Shift+G) nebo Průzkumníku (Ctrl+L).

## Instalace a Spuštění

### Požadavky

- Node.js (verze 18+)
- npm

### První spuštění

V kořenovém adresáři projektu (`ugc-tracker`) spusťte:

```powershell
npm install
npm run dev
```

### Rychlé spuštění

V kořenovém adresáři se nachází pomocné skripty. Stačí na ně dvakrát kliknout pro automatické spuštění serveru a otevření aplikace:

- **Windows:** `Spustit_Tracker.bat`
- **macOS:** `Spustit_Mac.command` (před prvním použitím vyžaduje `chmod +x`)

## Vývojové Konvence

- **Vzhled:** Čisté CSS (`src/index.css`) v tmavém režimu. Kompaktní, sticky záhlaví. Horizontální layout pro název a cestu videa.
- **Stabilitu UI:** Fixní výšky kontejnerů pro poznámky a fixní šířky editačních polí jazyků, aby se zabránilo poskakování tabulky při interakci.
- **Stav:** Aplikace využívá React `useState` a `useEffect` pro synchronizaci komplexního stavu s `localStorage`.
- **Typy:** TypeScript rozhraní jsou v `src/types.ts`.

## Struktura souborů

- `src/App.tsx`: Hlavní logika aplikace, UI komponenty a správa stavu.
- `src/types.ts`: Definice datových struktur.
- `src/index.css`: Globální styly (včetně ultra-kompaktního layoutu a animovaných toastů).
- `sample_data.json`: Ukázková data s 5 autory a 50 videi pro testování.
- `Spustit_Tracker.bat` / `Spustit_Mac.command`: Pomocné spouštěcí skripty.

## Stav Projektu

- **Květen 2026 (Aktualizace):** Dokončena optimalizace hustoty informací. Přidán Light Mode, neomezená správa aplikací a hromadné akce. Implementován pokročilý Tag Manager s HEX pickerem, chytrým vyhledáváním slov a stabilizovaným UI, které eliminuje layout shifty při editaci poznámek a jazyků. Projekt úspěšně prochází build procesem (`npm run build`).
