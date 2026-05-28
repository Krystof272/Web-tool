# UGC Production Tracker

Tento projekt je webový nástroj pro sledování produkce UGC (User Generated Content) videí. Umožňuje organizovat práci podle tvůrců a aplikací a sledovat detailní stav produkce každého videa v přehledném tabulkovém zobrazení.

## Přehled Projektu

- **Účel:** Spreadsheet checklist pro sledování produkčního workflow.
- **Technologie:** React, TypeScript, Vite, Lucide-React pro ikony.
- **Ukládání dat:** Všechna data jsou ukládána lokálně v prohlížeči pomocí `localStorage`. Možnost ručního exportu/importu do JSON.

## Hlavní Funkce

- **Workflow (Tabulkový layout):** Videa jsou zobrazena v řádcích s interaktivním postupem (Dabing, Titulky, Pub).
- **Zjednodušená sekce Publikováno:** V sekci "Publikovaná videa" se pro větší přehlednost zobrazuje pouze výsledný stav "Publikováno", zatímco pomocné stavy (Dabing, Titulky) jsou skryty.
- **Historie Produkce:** Každé video automaticky sleduje svůj životní cyklus. Ikonka hodin u každého řádku zobrazuje chronologický log událostí (vytvoření, změny stavů, hromadné akce).
- **Organizace:** Seskupování videí podle tvůrců. Neomezené přidávání, přejmenovávání a mazání aplikací (karet).
- **Hromadné akce:** Podpora multi-výběru videí (checkboxy) s plovoucí lištou pro hromadnou změnu stavu nebo smazání.
- **Sbalitelné sekce:** Možnost sbalit sekci tvůrce s rychlým souhrnem progresu. Vždy viditelní tvůrci i bez videí.
- **Správa Tvůrců, Aplikací a Tagů:** Centrální okna pro správu seznamu tvůrců, aplikací a pokročilé barvení tagů.
- **Chytré barvení tagů:** HEX barvy pro tagy a jazyky s inteligentní shodou celých slov (word boundaries).
- **Správa faktur s paginací:** Faktury řazené od nejnovějších s postupným načítáním po 5 kusech.
- **Poznámky:** Pole pro poznámky s náhledem. Náhled je zarovnán doprava k akčním tlačítkům pro maximální využití prostoru. Editor je kompaktní a otevírá se fixně vlevo.
- **Optimalizace pro širokoúhlé monitory:** UI využívá 95 % šířky obrazovky.

## Vývojové Konvence

- **Architektura:** Komponenty jsou dekomponovány na menší, memoizované celky (`SortableRow`, `TableHeader`, `InvoiceTable`) pro maximální výkon při velkém množství dat.
- **Performance:** Využití `React.memo`, `useMemo` (pro filtrování a seskupování dat) a `useCallback` (pro event handlery) k zamezení zbytečných re-renderů.
- **UI Stabilita:** Fixní šířky klíčových sloupců s možností resizingu. Sloupec poznámek je flexibilní a vyplňuje zbývající prostor.
- **Z-Index Management:** Přísná hierarchie vrstev (Header: 1000, Popovery/Editory: 750-900, Modály: 2000), aby prvky při skrolování správně mizely pod hlavičkou.
- **Data:** Historie změn je ukládána v poli `history` přímo v objektu `Video`. Program obsahuje migrační vrstvu pro starší formáty dat.

## Stav Projektu

- **Květen 2026 (Optimalizace a Historie):**
  - Implementována **Historie produkce** s automatickým logováním změn.
  - Proveden **komplexní refaktoring** a optimalizace výkonu (memoizace komponent, stabilizace handlerů).
  - UI vylepšeno o **95% šířku zobrazení** a lepší zarovnání poznámek k akčním tlačítkům.
  - Zjednodušeno zobrazení v sekci publikovaných videí.
  - Projekt úspěšně prochází build procesem a je plně stabilní.
