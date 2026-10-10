# dimagrimentolento.it

Sito statico di Dimagrimento Lento, pubblicato tramite GitHub Pages.

## Comandi di manutenzione

Richiede Node.js per l'audit/build CSS e `cwebp` per rigenerare le immagini responsive.

```bash
npm install
npm run build:css
npm run audit:seo
npm run optimize:images
```

Il file `assets/css/tailwind.min.css` è una build Tailwind 2.2.19 purgata sulle classi realmente presenti negli HTML e negli script. Va rigenerato quando vengono introdotte nuove utility Tailwind.

Lo script `scripts/seo-audit.mjs` controlla le URL in sitemap, canonical, title, description, H1, JSON-LD, link/asset locali, immagini, lingua e dipendenze SEO legacy. Riconosce anche gli slug senza estensione serviti da GitHub Pages tramite i corrispondenti file `.html`.

## Regole SEO del progetto

- URL canoniche: HTTPS, host apex `dimagrimentolento.it` e percorsi presenti in `sitemap.xml`.
- Le pagine strategiche devono essere raggiungibili tramite link HTML, non soltanto tramite JavaScript.
- Il JSON-LD deve essere prodotto con oggetti serializzati tramite `JSON.stringify`, mai concatenando testo non sanificato.
- Le immagini sotto la piega devono avere dimensioni esplicite e `loading="lazy"`; l'immagine LCP deve restare eager.
- Aggiornare `lastmod` nella sitemap soltanto quando cambia il contenuto della pagina.
- Le recensioni dello studio restano visibili per gli utenti, senza markup `Review` o `AggregateRating`: le recensioni della propria attività non sono idonee alle stelline Google, anche quando provengono da Trustpilot. Le storie dei pazienti usano `Article` e `BreadcrumbList`.
- Le singole sedi usano `MedicalClinic`, lo studio nel suo insieme `MedicalOrganization`; `https://schema.org/DietNutrition` è il valore di `medicalSpecialty`, non un tipo di attività.

## Analytics (GA4)

Tutta la misurazione vive in `assets/js/analytics.js`, incluso da ogni pagina con un solo tag `<script>`. Non aggiungere snippet `gtag` inline nelle pagine: nuove pagine devono solo includere lo script.

- **Consenso**: GA4 parte solo dopo il consenso "tracking" del banner cookie (Consent Mode v2, modalità `basic`). Per passare ai ping anonimi pre-consenso cambiare `consentMode` in `'advanced'` in cima al file.
- **Debug**: aprire qualsiasi pagina con `?dl_debug=1` per vedere gli eventi in console e nella DebugView di GA4.
- **Brevo**: a ogni invio il campo nascosto `URL` del form riceve pagina + provenienza, ad esempio `…/nutrizionista-salerno/?src=google&med=organic&lp=/blog/…&cta=hero`. È il dato che permette di collegare ogni contatto (e poi ogni paziente) al canale che lo ha portato, anche per chi rifiuta i cookie. Non attivare il redirect post-invio nel form Brevo: il lead viene rilevato dal messaggio di conferma in pagina.

### Eventi

| Evento | Quando scatta | Parametri |
| --- | --- | --- |
| `generate_lead` | Brevo conferma l'invio del form | `cta_location`, `cta_page`, `form_duration_sec`, `time_on_page_sec` |
| `contact_click` | Click su telefono, WhatsApp o email | `contact_method`, `cta_location`, `cta_text` |
| `cta_click` | Click su un pulsante che porta al form | `cta_text`, `cta_location`, `cta_destination` |
| `form_view` / `form_start` / `form_submit` | Form visibile / primo campo toccato / invio tentato | `cta_location`, `cta_page`, `first_field`, `fields_filled` |
| `form_error` / `form_abandon` | Errore su un campo o sull'invio / uscita a form iniziato | `error_field`, `last_field`, `fields_filled`, `submit_attempted` |
| `section_view` | Una sezione resta a schermo almeno 3 secondi | `section_id`, `section_index`, `section_count` |
| `engagement_summary` | Uscita dalla pagina | `top_section`, `top_section_sec`, `sections_viewed`, `max_scroll_pct`, `active_time_sec` |
| `scroll_depth` | 25 / 50 / 75 / 100% della pagina | `percent_scrolled` |
| `video_start` | Avvio di una videotestimonianza | `video_id`, `video_title`, `cta_location` |
| `faq_open` | Apertura di una domanda frequente | `faq_question`, `cta_location` |
| `directions_click` | Click su "Indicazioni" di uno studio | `studio_location` |
| `article_read` | Articolo del blog letto (75% + 30 secondi) | `read_time_sec` |

Ogni evento porta anche `page_type` (`home`, `local_landing`, `blog_article`, `review_story`, `reviews_hub`, `video_testimonial`, `testimonials_hub`), `content_group` e, sulle landing locali, `studio_location`. La proprietà utente `lead_status` vale `prospect` o `lead`.

Il nome di una sezione (`section_id`, `cta_location`) deriva dal suo `id` o dal titolo; per fissarlo e non perdere lo storico quando cambia il testo, aggiungere `data-section="nome"` al `<section>`.

### Da configurare una volta in GA4

1. Amministrazione → Conservazione dei dati → **14 mesi** (il default di 2 mesi impedisce i confronti a 6-12 mesi nelle Esplorazioni).
2. Eventi chiave: `generate_lead` e `contact_click`.
3. Definizioni personalizzate, ambito evento: `cta_location`, `cta_page`, `cta_text`, `contact_method`, `section_id`, `top_section`, `page_type`, `studio_location`, `faq_question`, `last_field`, `error_field`, `video_title`. Ambito utente: `lead_status`. Metriche: `form_duration_sec`, `active_time_sec`, `max_scroll_pct`.
4. Esplorazione a imbuto: `page_view` → `cta_click` → `form_view` → `form_start` → `form_submit` → `generate_lead`, scomposta per `page_type` e per dispositivo.
5. Collegare Search Console e attivare l'export BigQuery per conservare i dati grezzi oltre i 14 mesi.
