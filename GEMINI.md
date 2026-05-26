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
- **Dynamický výběr tagů:** Přiřazování tagů probíhá interaktivním přesouváním mezi seznamy "K výběru" a "Vybrané". Toto řešení eliminuje ruční psaní a chyby.
- **Správa faktur s paginací:** Faktury jsou řazeny od nejnovějších a zobrazují se po 5 kusech. Tlačítko "Zobrazit dalších 5" umožňuje postupné načítání historie, čímž UI zůstává přehledné i při velkém množství dat.
- **Rozbalovací správa:** Výběr barev v Tag Manageru je defaultně skrytý a rozbalí se až po kliknutí na konkrétní tag, což zajišťuje maximální přehlednost.
- **Poznámky:** Pole pro poznámky zobrazuje náhled na první 2 řádky s automatickou trojtečkou (...). Po kliknutí se rozbalí do editoru, který se vznáší nad tabulkou (absolute positioning) a nezpůsobuje posouvání okolních řádků.
- **Optimalizace pro velké displeje:** UI využívá 95 % šířky obrazovky, což poskytuje maximální pracovní plochu na širokoúhlých monitorech.
- **Auto-zavírání:** Všechna kontextová okna (výběr tagů, editor poznámek) se automaticky zavřou při kliknutí kamkoliv mimo daný prvek.

## Instalace a Spuštění
... rest of section ...

## Vývojové Konvence

- **Vzhled:** Čisté CSS (`src/index.css`) v tmavém režimu. Kompaktní, sticky záhlaví. Horizontální layout pro název a cestu videa.
- **Stabilitu UI:** Fixní šířky sloupců (Jazyk: 140px, Tagy: 200px, Poznámky: 180px) a fixní výšky kontejnerů, aby se zabránilo poskakování tabulky při interakci.
- **Data:** Tagy jsou ukládány v poli (Array) pro zachování pořadí. Program obsahuje migrační vrstvu pro bezpečné nahrávání starších záloh (Object format).
- **Stav:** Aplikace využívá React `useState`, `useEffect` a `useRef` pro synchronizaci stavu a detekci kliknutí mimo prvky.

## Struktura souborů
... rest of section ...

## Stav Projektu

- **Květen 2026 (Aktualizace):** Dokončena komplexní optimalizace workflow. Implementován dynamický systém výběru tagů, inkrementální načítání faktur a plná podpora širokoúhlých displejů. UI je nyní naprosto stabilní díky fixním šířkám sloupců a overlay editorům, které eliminují layout shifty. Projekt úspěšně prochází build procesem (`npm run build`).
