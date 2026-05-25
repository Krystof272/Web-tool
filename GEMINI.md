# UGC Production Tracker

Tento projekt je webový nástroj pro sledování produkce UGC (User Generated Content) videí. Umožňuje organizovat práci podle tvůrců a aplikací a sledovat detailní stav produkce každého videa v přehledném tabulkovém zobrazení.

## Přehled Projektu

- **Účel:** Spreadsheet checklist pro sledování produkčního workflow.
- **Technologie:** React, TypeScript, Vite, Lucide-React pro ikony.
- **Ukládání dat:** Všechna data jsou ukládána lokálně v prohlížeči pomocí `localStorage`. Možnost ručního exportu/importu do JSON.

## Hlavní Funkce

- **Workflow (Tabulkový layout):** Videa jsou zobrazena v řádcích s interaktivním postupem (Dabing → Titulky → Pub). Kliknutím na sekci produkce se stav cyklicky mění.
- **Organizace:** Seskupování videí podle tvůrců (vlastní tabulka pro každého) a přepínání mezi 3 zvolenými aplikacemi pomocí záložek.
- **Sbalitelné sekce:** Možnost sbalit sekci tvůrce pro lepší přehlednost s rychlým souhrnem progresu (hotovo/celkem).
- **Správa Tvůrců:** Centrální okno pro přidávání a odebírání tvůrců ze seznamu.
- **Poznámky:** Textové pole přímo v tabulce, které se při kliknutí (focus) automaticky zvětší pro pohodlnou editaci.
- **Video Odkazy:** Možnost vložit URL adresu (např. Disk, TikTok) a otevřít ji jedním klikem přímo z tabulky.
- **Zálohování:** Funkce pro Export a Import kompletních dat ve formátu JSON.

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

### Rychlé spuštění (Windows)
V kořenovém adresáři se nachází soubor `Spustit_Tracker.bat`. Stačí na něj dvakrát kliknout pro automatické spuštění serveru a otevření aplikace v prohlížeči.

## Vývojové Konvence

- **Vzhled:** Čisté CSS (`src/index.css`) s podporou tmavého i světlého režimu. Používá se tabulkový layout připomínající Excel.
- **Stav:** Aplikace využívá React `useState` a `useEffect` pro synchronizaci s `localStorage`.
- **Typy:** TypeScript rozhraní jsou v `src/types.ts`.

## Struktura souborů

- `src/App.tsx`: Hlavní logika aplikace, UI komponenty a správa stavu.
- `src/types.ts`: Definice datových struktur (Video, ProductionStatus).
- `src/index.css`: Globální styly, design tabulky a barevné kódování workflow.
- `Spustit_Tracker.bat`: Pomocný skript pro snadné spuštění na Windows.

## Stav Projektu

- **Květen 2026:** Hlavní logika aplikace v `App.tsx` byla opravena a verifikována. Produkční workflow, správa tvůrců a faktury jsou plně funkční. Projekt úspěšně prochází build procesem (`npm run build`).
