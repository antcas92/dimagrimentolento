# Search Console — verifica del 10 ottobre 2026

Proprietà verificata: `sc-domain:dimagrimentolento.it`, tramite la scheda Search Console aperta dall'utente. Modifiche al codice salvate localmente, senza commit, push o pubblicazione. Testi visibili del sito invariati.

## Rendimento osservato

Periodo selezionato: **7 luglio–6 ottobre 2026**, ricerca Web, senza filtri aggiuntivi.

| Metrica | Valore |
| --- | --- |
| Clic | 238 |
| Impressioni | 3.682 |
| CTR medio | 6,5% |
| Posizione media | 7,5 |

Le query visibili con più clic sono legate al marchio: `dimagrimento lento` (41), `dimagrimento lento angri` (21), `dimagrimento lento salerno` (12). Questi valori non misurano le conversioni.

| Query locale | Clic | Impressioni | Posizione media |
| --- | --- | --- | --- |
| nutrizionista angri | 0 | 209 | 4,3 |
| nutrizionista salerno | 0 | 90 | 20,8 |
| nutrizionista a salerno | 0 | 46 | 32,5 |
| nutrizionista nocera inferiore | 0 | 12 | 22,3 |

Angri offre la prima opportunità da monitorare per il CTR. Il dato da solo non dimostra un errore del codice: posizione e clic dipendono anche dal contesto dei risultati e dalla concorrenza. Nessuna riscrittura di titoli, descrizioni o contenuti effettuata in questo intervento.

## Indicizzazione

Il report Pagine è aggiornato al **4 ottobre 2026**, quindi precede l'aggiunta degli articoli. Segnala **8 pagine indicizzate e 16 escluse**: le 24 URL note a Google non coincidono con le 24 URL della sitemap attuale.

| Causa | URL | Interpretazione |
| --- | --- | --- |
| Pagina con reindirizzamento | 3 | Varianti HTTP e www della home: esclusione corretta. |
| Errore di reindirizzamento | 2 | Salerno e Nocera senza slash finale, ultima scansione 23 luglio. Oggi entrambe fanno un solo 301 verso la pagina con slash, che risponde 200. Le destinazioni sono indicizzate. |
| Canonical alternativo appropriato | 1 | `/index.html`: canonical sulla home `/`, esclusione corretta. |
| Scansionata, non indicizzata | 2 | Videotestimonianze di Rosita e Stefania, ultime scansioni 3 e 11 luglio. Richiedono una nuova valutazione dopo la pubblicazione delle correzioni. |
| Rilevata, non indicizzata | 8 | Le sei storie in `/recensioni/` e i video di Chiara e Olimpia; ultima scansione non disponibile. |
| Non trovata (404) | 0 | Convalida precedente superata. |

Le otto pagine indicizzate sono home, testimonianze, recensioni hub, le tre landing locali e i video di Giovanna e Daniela.

La sitemap risulta **riuscita**, ultima lettura **3 ottobre**, con **18 pagine rilevate**. La sitemap pubblicata oggi contiene tutte le **24 URL**, inclusi i sei blog.

### Controllo diretto del nuovo blog

URL campione: `/blog/prima-visita-nutrizionista-come-funziona`.

- Indice Google: URL sconosciuto, nessuna scansione precedente o sitemap di referral rilevata.
- Test in tempo reale del 10 ottobre, ore 19:00: **URL disponibile per Google**, recupero riuscito con smartphone, scansione e indicizzazione consentite.
- Canonical dichiarato corretto; un breadcrumb valido rilevato.

Questo risultato esclude un blocco tecnico di accesso nel campione. Non garantisce l'indicizzazione e non certifica lo stato individuale degli altri cinque blog.

## Dati strutturati e modifiche applicate

Search Console segnala **6 elementi recensione non validi**, tutti su `testimonianze.html`, per **campo mancante `itemReviewed`**. La precedente convalida è fallita il 20 agosto; gli esempi riportano scansione del 3 ottobre. Sono inoltre presenti 19 elementi recensione validi nel report.

La correzione adottata considera anche l'idoneità: [Google esclude le recensioni della propria attività dalle stelline](https://developers.google.com/search/docs/appearance/structured-data/review-snippet#guidelines), comprese quelle mostrate tramite servizi esterni. Un JSON sintatticamente valido non certifica l'idoneità ai risultati avanzati.

Modifiche salvate:

1. Rimossi i blocchi/proprietà `Review` e `AggregateRating` relativi allo studio da home, landing locali, testimonianze, storie e dal video di Rosita. Stelle, valutazioni e recensioni visibili restano identiche.
2. Le sei storie dei pazienti usano ora `Article`, con titolo e descrizione già presenti, autore/publisher dello studio, URL canonico e breadcrumb. Nessuna attribuzione editoriale o data inventata.
3. Nelle sei pagine video, allineato il JSON-LD dello studio al `MedicalOrganization` della home, con le tre sedi e le coordinate corrette. Eliminati il vecchio tipo `DietNutrition`, le coordinate errate di Salerno e la scheda che attribuiva due indirizzi a un'unica sede.
4. La specialità medica usa `https://schema.org/DietNutrition`; [Schema.org la definisce come valore di enumerazione](https://schema.org/DietNutrition).
5. Rimossi tre caricamenti dello script Trustpilot sulle landing locali: non esisteva alcun widget associato negli HTML.
6. Aggiornati i `lastmod` delle pagine modificate oggi, inclusi metadati e aggiornamenti Trustpilot del precedente recheck.
7. Esteso l'audit per rilevare il reinserimento di `Review`/`AggregateRating` in JSON-LD o microdata HTML e l'uso di `DietNutrition` come tipo di attività. Aggiornate le regole nel README.

## Video, esperienza, sicurezza e link

- Indicizzazione video: **0 indicizzati, 1 escluso**. Il video escluso è quello di Chiara nella **home**, perché non è una pagina dedicata alla visione. È coerente con lo scopo della home e non richiede di trasformarla in una pagina video.
- Miglioramenti video: 3 elementi validi, 0 non validi nel riepilogo.
- Breadcrumb: 1 elemento valido, 0 non validi nel riepilogo.
- Dati strutturati non analizzabili: 0 nel riepilogo.
- Core Web Vitals: dati insufficienti sia per mobile sia per desktop. Non è un voto positivo o negativo sulle prestazioni.
- HTTPS: 5 URL HTTPS, 0 non HTTPS nel riepilogo; report distinto da quello delle pagine indicizzate.
- Azioni manuali: nessun problema rilevato.
- Problemi di sicurezza: nessun problema rilevato.
- Link esterni rilevati: 34, di cui 32 da Trustpilot, uno da abbrevia.it e uno da gowork.com. Il profilo delle fonti è poco diversificato; aumentare citazioni pertinenti richiede lavoro esterno al codice.

## Verifica e passi successivi

- `npm test`: superato, 24 URL in sitemap, 31 HTML, 0 errori e 0 avvisi.
- `git diff --check`: superato.
- Confronto automatico del testo visibile prima/dopo questo intervento: nessuna pagina modificata.
- Controlli HTTP reali: varianti HTTP/www della home e i due URL locali senza slash fanno un solo 301 verso una destinazione 200.
- Preservate le modifiche Analytics già presenti nel workspace.

Dopo la pubblicazione:

1. Far rileggere la sitemap aggiornata e richiedere l'indicizzazione delle URL prioritarie tramite Controllo URL: nuovi blog e storie principali. Le richieste non garantiscono l'inclusione nell'indice.
2. Ripetere il test pubblico di `testimonianze.html` e avviare la nuova convalida del problema recensioni; convalidare anche i due vecchi errori di redirect se ancora presenti.
3. Monitorare copertura e query locali a 2–4 settimane, confrontando periodi equivalenti. I report precedenti alla pubblicazione non misurano l'effetto delle correzioni odierne.
4. Per sviluppare risultati video, verificare prima le date reali di pubblicazione su YouTube e poi completare `VideoObject` nelle pagine dedicate. Non sono state inventate date per soddisfare i campi richiesti.
5. Per i contenuti sanitari, rendere riconoscibili firma, qualifiche e revisione professionale: lavoro editoriale separato, da concordare rispettando il vincolo sui testi.

Non sono state inviate richieste di indicizzazione, convalide o nuove sitemap durante questa verifica. Le nuove correzioni al codice devono essere pubblicate prima di misurarne l'effetto.
