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
- **Správa Tvůrců a Aplikací:** Centrální okna pro správu seznamu tvůrců a aplikací s automatickou migrací dat při přejmenování.
- **Poznámky:** Pole pro poznámky se po kliknutí rozbalí do prostorného editoru pro pohodlnou úpravu dlouhých textů.
- **Video Odkazy a Cesty:** Cesty k souborům (lokální i cloudové) lze editovat přímo v řádku tabulky. Tlačítko "Kopírovat" umožňuje rychlé zkopírování cesty pro bleskové otevření ve Finderu/Exploreru.
- **Světlý/Tmavý režim:** Plná podpora přepínání mezi Light a Dark motivem s pamětí volby.
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

### Rychlé spuštění
V kořenovém adresáři se nachází pomocné skripty. Stačí na ně dvakrát kliknout pro automatické spuštění serveru a otevření aplikace:
- **Windows:** `Spustit_Tracker.bat`
- **macOS:** `Spustit_Mac.command` (před prvním použitím vyžaduje `chmod +x`)

## Vývojové Konvence

- **Vzhled:** Čisté CSS (`src/index.css`) s využitím CSS proměnných pro správu Light/Dark režimu. Kompaktní, sticky záhlaví.
- **Stav:** Aplikace využívá React `useState` a `useEffect` pro synchronizaci komplexního stavu s `localStorage`.
- **Typy:** TypeScript rozhraní jsou v `src/types.ts`.

## Struktura souborů

- `src/App.tsx`: Hlavní logika aplikace, UI komponenty a správa stavu.
- `src/types.ts`: Definice datových struktur.
- `src/index.css`: Globální styly, CSS proměnné pro témata.
- `Spustit_Tracker.bat` / `Spustit_Mac.command`: Pomocné spouštěcí skripty.

## Stav Projektu

- **Květen 2026 (Aktualizace):** Přidán Light/Dark mód, neomezená správa aplikací, hromadné akce s videi (multi-select), optimalizováno UI (kompaktní sticky záhlaví, velké pole poznámek, inline editace URL) a vytvořen spouštěč pro macOS. Projekt úspěšně prochází build procesem (`npm run build`).
