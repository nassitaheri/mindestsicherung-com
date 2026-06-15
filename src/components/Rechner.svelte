<!--
  ============================================================================
   Rechner.svelte — Mindestsicherungs-Rechner
   Design-Überarbeitung nach DESIGN-OPTIMIERUNG.md Punkt 3
   LOGIK UNVERÄNDERT — nur visuelle Änderungen
  ============================================================================
-->
<script lang="ts">
  import { berechne, euro, type HaushaltInput } from '../lib/calc';
  import { formatAT } from '../lib/datum';
  import {
    BUNDESLAENDER,
    BUNDESLAND_REIHENFOLGE,
    DISCLAIMER,
    STAND,
    type BundeslandSlug,
  } from '../data/saetze-2026';

  type Props = {
    fixedBundesland?: BundeslandSlug;
  };

  let { fixedBundesland }: Props = $props();

  let bundesland = $state<BundeslandSlug>(fixedBundesland ?? 'wien');
  let konstellation = $state<HaushaltInput['konstellation']>('alleinstehend');
  let erwachseneInWg = $state(2);
  let kinder = $state(0);
  let mitBehinderung = $state(0);
  let einkommenMonat = $state(0);
  let vermoegen = $state(0);
  // Abweichung A — nur in Wien 2026 als Ausschlussgrund bestätigt.
  let subsidiaer = $state(false);

  let land = $derived(BUNDESLAENDER[bundesland]);
  let erwachsene = $derived.by(() => {
    if (konstellation === 'paar') return 2;
    if (konstellation === 'wg') return Math.max(2, erwachseneInWg);
    return 1;
  });

  let ergebnis = $derived(
    berechne({
      bundesland,
      konstellation,
      erwachsene,
      kinder,
      mitBehinderung,
      einkommenMonat,
      vermoegen,
      // Subsidiär-Ausschluss nur dort senden, wo er offiziell gilt (Wien).
      subsidiaerSchutzberechtigt: bundesland === 'wien' ? subsidiaer : false,
    }),
  );

  let resultLabel = $derived.by(() => {
    if (ergebnis.vermoegenUeberFreibetrag) return 'Kein Anspruch (Vermögen)';
    if (!ergebnis.hatAnspruch) return 'Kein Anspruch';
    return 'Voraussichtlicher Auszahlbetrag pro Monat';
  });
</script>

<section class="rechner" aria-labelledby="rechner-titel">
  <header class="rechner__head">
    <h2 id="rechner-titel" class="rechner__title">Mindestsicherung berechnen</h2>
    <p class="rechner__sub">
      Schnelle, unverbindliche Orientierung. Stand: {formatAT(STAND.datum)}.
    </p>
  </header>

  <!-- ===================== ERGEBNIS-BOX — Punkt 3 ========================= -->
  <div
    class="result"
    class:result--active={ergebnis.hatAnspruch}
    aria-live="polite"
    aria-atomic="true"
  >
    <div class="result__label">{resultLabel}</div>
    <div
      class="result__amount"
      class:result__amount--inactive={!ergebnis.hatAnspruch}
    >
      {#if ergebnis.hatAnspruch}
        {euro(ergebnis.auszahlbetrag)}
      {:else}
        — €
      {/if}
    </div>
    <div class="result__meta tabular">
      Gesamtbedarf {euro(ergebnis.gesamtbedarf)}
      &minus; Einkommen {euro(ergebnis.einkommen)}
    </div>
  </div>

  <!-- ===================== FORMULAR ======================================= -->
  <form class="form" onsubmit={(e) => e.preventDefault()} aria-describedby="disclaimer">

    <!-- Schritt 1: Bundesland -->
    {#if !fixedBundesland}
      <fieldset class="step">
        <legend class="step__legend">
          <span class="step__num">1</span>
          Bundesland
        </legend>
        <label class="field">
          <span class="field__label">In welchem Bundesland wohnst du?</span>
          <select
            class="field__input"
            bind:value={bundesland}
            aria-describedby="bundesland-hint"
          >
            {#each BUNDESLAND_REIHENFOLGE as slug}
              <option value={slug}>
                {BUNDESLAENDER[slug].name}{BUNDESLAENDER[slug].status === 'draft' ? ' (in Prüfung)' : ''}
              </option>
            {/each}
          </select>
          {#if land.status === 'draft'}
            <span id="bundesland-hint" class="field__hint field__hint--warn">
              Werte für {land.name} werden derzeit geprüft.
              Verbindliche Informationen direkt bei der zuständigen Stelle einholen.
            </span>
          {/if}
        </label>
      </fieldset>
    {/if}

    <!-- Schritt 2: Haushalt -->
    <fieldset class="step">
      <legend class="step__legend">
        <span class="step__num">{fixedBundesland ? 1 : 2}</span>
        Haushalt
      </legend>

      <div class="field">
        <span class="field__label">Wie wohnst du?</span>
        <!-- Pill-Cards — Punkt 3 DESIGN-OPTIMIERUNG -->
        <div class="pill-group" role="radiogroup" aria-label="Konstellation">
          {#each [
            { v: 'alleinstehend',   l: 'Alleinstehend' },
            { v: 'alleinerziehend', l: 'Alleinerziehend' },
            { v: 'paar',            l: 'Paar / Lebensgemeinschaft' },
            { v: 'wg',              l: 'Wohngemeinschaft' },
          ] as opt}
            <label class="pill" class:pill--active={konstellation === opt.v}>
              <input
                type="radio"
                name="konstellation"
                value={opt.v}
                checked={konstellation === opt.v}
                onchange={() => (konstellation = opt.v as HaushaltInput['konstellation'])}
              />
              <span>{opt.l}</span>
            </label>
          {/each}
        </div>
      </div>

      {#if konstellation === 'wg'}
        <label class="field">
          <span class="field__label">Anzahl Erwachsene in der WG</span>
          <input type="number" class="field__input" min="2" step="1" bind:value={erwachseneInWg} />
        </label>
      {/if}

      <label class="field">
        <span class="field__label">Minderjährige Kinder im Haushalt</span>
        <input type="number" class="field__input" min="0" step="1" bind:value={kinder} />
      </label>

      <label class="field">
        <span class="field__label">Personen mit Behindertenpass (§ 40 BBG)</span>
        <input
          type="number"
          class="field__input"
          min="0"
          step="1"
          bind:value={mitBehinderung}
          aria-describedby="behinderung-hint"
        />
        <span id="behinderung-hint" class="field__hint">
          Pro Person zusätzlich {euro(land.saetze.behindertenzuschlag)}.
        </span>
      </label>

      {#if bundesland === 'wien'}
        <!-- Abweichung A — subsidiär Schutzberechtigte: kein Anspruch (Wien 2026) -->
        <label class="check">
          <input type="checkbox" bind:checked={subsidiaer} aria-describedby="subsidiaer-hint" />
          <span class="check__body">
            <span class="check__label">Subsidiär schutzberechtigt</span>
            <span id="subsidiaer-hint" class="field__hint">
              Personen mit subsidiärem Schutz haben seit 1.1.2026 keinen Anspruch auf die
              Wiener Mindestsicherung mehr — zuständig ist die Grundversorgung.
            </span>
          </span>
        </label>
      {/if}
    </fieldset>

    <!-- Schritt 3: Einkommen + Vermögen -->
    <fieldset class="step">
      <legend class="step__legend">
        <span class="step__num">{fixedBundesland ? 2 : 3}</span>
        Einkommen &amp; Vermögen
      </legend>

      <label class="field">
        <span class="field__label">Monatliches Netto-Einkommen aller Personen (Euro)</span>
        <input
          type="number"
          class="field__input tabular"
          min="0"
          step="10"
          inputmode="decimal"
          bind:value={einkommenMonat}
          aria-describedby="einkommen-hint"
        />
        <span id="einkommen-hint" class="field__hint">
          Alle anrechenbaren Einkünfte zusammen. Familienbeihilfe wird in der Regel
          nicht angerechnet.
        </span>
      </label>

      <label class="field">
        <span class="field__label">Verwertbares Vermögen (Sparbuch, Bargeld, in Euro)</span>
        <input
          type="number"
          class="field__input tabular"
          min="0"
          step="100"
          inputmode="decimal"
          bind:value={vermoegen}
          aria-describedby="vermoegen-hint"
        />
        <span id="vermoegen-hint" class="field__hint">
          Freibetrag: {euro(ergebnis.vermoegensfreibetragGesamt)}
          ({euro(land.saetze.vermoegensfreibetrag)} pro volljähriger Person).
          Eigentumswohnung (Hauptwohnsitz), notwendiges Auto und Wohnungseinrichtung
          zählen nicht mit.
        </span>
      </label>
    </fieldset>

    <!-- ===================== AUFSCHLÜSSELUNG =============================== -->
    <section class="breakdown" aria-label="Aufschlüsselung der Berechnung">
      <h3 class="breakdown__title">So setzt sich das zusammen</h3>
      <dl class="breakdown__list">
        <div class="breakdown__row">
          <dt>Erwachsene</dt>
          <dd class="tabular">{euro(ergebnis.erwachsenenBedarf)}</dd>
        </div>
        {#if ergebnis.kinderBedarf > 0}
          <div class="breakdown__row">
            <dt>Kinder ({kinder})</dt>
            <dd class="tabular">{euro(ergebnis.kinderBedarf)}</dd>
          </div>
        {/if}
        {#if ergebnis.zuschlaege > 0}
          <div class="breakdown__row">
            <dt>Behindertenzuschlag</dt>
            <dd class="tabular">{euro(ergebnis.zuschlaege)}</dd>
          </div>
        {/if}
        <div class="breakdown__row breakdown__row--sum">
          <dt>Gesamtbedarf</dt>
          <dd class="tabular">{euro(ergebnis.gesamtbedarf)}</dd>
        </div>
        <div class="breakdown__row">
          <dt>− Einkommen</dt>
          <dd class="tabular">−{euro(ergebnis.einkommen)}</dd>
        </div>
        <div class="breakdown__row breakdown__row--result">
          <dt>Auszahlbetrag pro Monat</dt>
          <dd class="tabular">{euro(ergebnis.auszahlbetrag)}</dd>
        </div>
      </dl>
    </section>

    <!-- ===================== HINWEISE ====================================== -->
    {#if ergebnis.hinweise.length > 0}
      <aside class="notes notes--warn" aria-label="Hinweise zur Berechnung">
        <ul>
          {#each ergebnis.hinweise as note}
            <li>{note}</li>
          {/each}
        </ul>
      </aside>
    {/if}

    {#if land.hinweise.length > 0}
      <!-- Punkt 3: Seriöser Behörden-Hinweis in Primary-Farben -->
      <aside class="notes notes--info" aria-label="Wichtige Hinweise für {land.name}">
        <div class="notes__head">
          <!-- Info-Icon (Lucide-Stil) -->
          <svg width="16" height="16" viewBox="0 0 24 24" fill="none"
            stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"
            aria-hidden="true">
            <circle cx="12" cy="12" r="10"/>
            <line x1="12" y1="16" x2="12" y2="12"/>
            <line x1="12" y1="8" x2="12.01" y2="8"/>
          </svg>
          <strong>Wichtig für {land.name}</strong>
        </div>
        <ul>
          {#each land.hinweise as note}
            <li>{note}</li>
          {/each}
        </ul>
      </aside>
    {/if}

    <p id="disclaimer" class="disclaimer">{DISCLAIMER}</p>

    <p class="quelle">
      Quelle &amp; weitere Infos:
      <a href={land.quelle.url} target="_blank" rel="noopener noreferrer">
        {land.quelle.label}
      </a>
    </p>
  </form>
</section>

<style>
  /* ============================================================================
     RECHNER-DESIGN — komplett überarbeitet nach Punkt 3 DESIGN-OPTIMIERUNG.md
     Variablen aus global.css (via @theme → :root)
  ============================================================================ */

  .rechner {
    background: #fff;
    border: 1px solid var(--color-grey-200);
    border-radius: 16px;
    padding: clamp(20px, 5vw, 36px);
    box-shadow: 0 1px 4px rgba(0,0,0,0.04), 0 4px 16px rgba(0,0,0,0.04);
  }

  .rechner__head {
    margin-bottom: 24px;
  }
  .rechner__title {
    font-size: 20px;
    font-weight: 600;
    line-height: 1.2;
    letter-spacing: -0.01em;
    margin: 0 0 4px;
    color: var(--color-grey-900);
  }
  .rechner__sub {
    margin: 0;
    font-size: 13px;
    color: var(--color-grey-400);
  }

  /* ---- Ergebnis-Box — Punkt 3 ---- */
  .result {
    background: var(--color-grey-50);
    border: 1px solid var(--color-grey-200);
    border-left: 4px solid var(--color-grey-300);
    border-radius: 10px;
    padding: 20px 22px;
    margin-bottom: 32px;
    transition: border-left-color 200ms ease, background 200ms ease;
  }
  .result--active {
    background: var(--color-primary-50);
    border-color: var(--color-primary-200);
    border-left-color: var(--color-primary-500);
  }
  .result__label {
    font-size: 11px;
    font-weight: 500;
    text-transform: uppercase;
    letter-spacing: 0.08em;
    color: var(--color-grey-400);
    margin-bottom: 8px;
  }
  .result__amount {
    font-size: clamp(36px, 8vw, 48px);
    font-weight: 700;
    line-height: 1;
    letter-spacing: -0.02em;
    color: var(--color-primary-700);
    font-variant-numeric: tabular-nums;
    transition: color 200ms ease;
  }
  .result__amount--inactive {
    color: var(--color-grey-400);
  }
  .result__meta {
    margin-top: 10px;
    font-size: 13px;
    color: var(--color-grey-500);
    font-variant-numeric: tabular-nums;
  }

  /* ---- Form ---- */
  .form {
    display: flex;
    flex-direction: column;
    gap: 32px;  /* Punkt 4: 32px zwischen Schritten */
  }

  /* ---- Schritt-Fieldsets ---- */
  .step {
    border: none;
    padding: 0;
    margin: 0;
    display: flex;
    flex-direction: column;
    gap: 24px;  /* Punkt 4: 24px zwischen Form-Gruppen */
  }
  .step__legend {
    display: flex;
    align-items: center;
    gap: 10px;
    font-size: 16px;
    font-weight: 600;
    color: var(--color-grey-800);
    letter-spacing: -0.01em;
    margin-bottom: 4px;
  }
  /* Schritt-Nummer — Punkt 3: Primary-100 bg, Primary-600 text */
  .step__num {
    display: inline-flex;
    align-items: center;
    justify-content: center;
    width: 24px;
    height: 24px;
    min-height: 0;
    border-radius: 50%;
    background: var(--color-primary-100);
    color: var(--color-primary-600);
    font-size: 12px;
    font-weight: 600;
    flex-shrink: 0;
  }

  /* ---- Felder ---- */
  .field {
    display: flex;
    flex-direction: column;
    gap: 8px;  /* Punkt 4: 8px zwischen Label und Input */
  }
  /* Labels — Punkt 3: 12px uppercase weight 500 Grey-500 */
  .field__label {
    font-size: 12px;
    font-weight: 500;
    text-transform: uppercase;
    letter-spacing: 0.08em;
    color: var(--color-grey-500);
  }
  /* Inputs — Punkt 3 */
  .field__input {
    appearance: none;
    -webkit-appearance: none;
    background: #fff;
    border: 1px solid var(--color-grey-200);
    border-radius: 8px;
    padding: 12px 16px;
    font-size: 16px;
    font-family: inherit;
    color: var(--color-grey-900);
    transition: border-color 120ms ease, box-shadow 120ms ease;
  }
  .field__input:hover {
    border-color: var(--color-grey-300);
  }
  .field__input:focus {
    outline: none;
    border-color: var(--color-primary-500);
    box-shadow: 0 0 0 3px var(--color-primary-100);
  }
  .field__hint {
    font-size: 13px;
    color: var(--color-grey-400);
    line-height: 1.45;
  }
  .field__hint--warn {
    color: var(--color-warning-text);
    background: var(--color-warning-bg);
    padding: 8px 12px;
    border-radius: 8px;
    font-size: 13px;
  }

  /* ---- Checkbox-Feld (z.B. subsidiär schutzberechtigt) ---- */
  .check {
    display: flex;
    align-items: flex-start;
    gap: 12px;
    cursor: pointer;
  }
  .check input {
    width: 18px;
    height: 18px;
    margin-top: 2px;
    flex-shrink: 0;
    accent-color: var(--color-primary-500);
    cursor: pointer;
  }
  .check__body {
    display: flex;
    flex-direction: column;
    gap: 4px;
  }
  .check__label {
    font-size: 14px;
    font-weight: 500;
    color: var(--color-grey-700);
    line-height: 1.3;
  }

  /* ---- Pill-Cards (Haushalt-Auswahl) — Punkt 3 ---- */
  .pill-group {
    display: grid;
    grid-template-columns: 1fr 1fr;
    gap: 8px;
  }
  @media (max-width: 440px) {
    .pill-group { grid-template-columns: 1fr; }
  }
  .pill {
    display: flex;
    align-items: center;
    gap: 10px;
    padding: 10px 14px;
    border: 1px solid var(--color-grey-200);
    border-radius: 8px;
    background: #fff;
    cursor: pointer;
    font-size: 14px;
    font-weight: 400;
    color: var(--color-grey-700);
    line-height: 1.3;
    transition: border-color 120ms ease, background 120ms ease, color 120ms ease;
    min-height: 44px;
  }
  .pill:hover {
    border-color: var(--color-grey-300);
    background: var(--color-grey-50);
  }
  .pill--active {
    background: var(--color-primary-50);
    border-color: var(--color-primary-500);
    color: var(--color-primary-700);
    font-weight: 500;
  }
  .pill input {
    /* visuell verstecken, aber für a11y erhalten */
    appearance: none;
    -webkit-appearance: none;
    width: 16px;
    height: 16px;
    min-height: 0;
    border: 2px solid var(--color-grey-300);
    border-radius: 50%;
    flex-shrink: 0;
    background: #fff;
    transition: border-color 120ms ease, background 120ms ease;
  }
  .pill--active input {
    background: var(--color-primary-500);
    border-color: var(--color-primary-500);
    box-shadow: inset 0 0 0 3px #fff;
  }

  /* ---- Aufschlüsselung — Punkt 3 ---- */
  .breakdown {
    border-top: 1px solid var(--color-grey-100);
    padding-top: 24px;
  }
  .breakdown__title {
    font-size: 12px;
    font-weight: 500;
    text-transform: uppercase;
    letter-spacing: 0.08em;
    color: var(--color-grey-400);
    margin: 0 0 16px;
  }
  .breakdown__list {
    margin: 0;
    display: flex;
    flex-direction: column;
    gap: 10px;
  }
  .breakdown__row {
    display: flex;
    justify-content: space-between;
    align-items: baseline;
    gap: 16px;
    font-size: 14px;
    color: var(--color-grey-500);
    margin: 0;
  }
  .breakdown__row dt { margin: 0; }
  .breakdown__row dd { margin: 0; font-weight: 400; }
  /* Trennlinie vor Gesamtbedarf */
  .breakdown__row--sum {
    border-top: 1px solid var(--color-grey-100);
    padding-top: 10px;
    margin-top: 2px;
    font-weight: 600;
    color: var(--color-grey-800);
  }
  .breakdown__row--sum dd { font-weight: 600; }
  /* Auszahlbetrag — fetter, primary */
  .breakdown__row--result {
    border-top: 1px solid var(--color-grey-100);
    padding-top: 12px;
    margin-top: 4px;
    font-size: 16px;
    font-weight: 700;
    color: var(--color-primary-700);
  }
  .breakdown__row--result dd { font-weight: 700; }

  /* ---- Hinweis-Boxen — Punkt 3 ---- */
  .notes {
    border-radius: 8px;
    font-size: 13px;
    line-height: 1.5;
  }
  /* Berechnungs-Hinweise (Kein Anspruch etc.) — Amber/Warning */
  .notes--warn {
    background: var(--color-warning-bg);
    border-left: 4px solid var(--color-warning-border);
    padding: 14px 16px;
    color: var(--color-warning-text);
  }
  /* Bundesland-Hinweise — seriöser Behördenhinweis in Primary */
  .notes--info {
    background: var(--color-primary-50);
    border-left: 4px solid var(--color-primary-200);
    padding: 14px 16px;
    color: var(--color-primary-700);
  }
  .notes__head {
    display: flex;
    align-items: center;
    gap: 8px;
    font-size: 13px;
    margin-bottom: 8px;
    color: var(--color-primary-700);
  }
  .notes ul {
    margin: 0;
    padding-left: 18px;
  }
  .notes li { margin-bottom: 4px; }

  /* ---- Disclaimer + Quelle ---- */
  .disclaimer {
    font-size: 13px;
    color: var(--color-grey-400);
    line-height: 1.5;
    margin: 0;
    font-style: italic;
  }
  .quelle {
    font-size: 13px;
    color: var(--color-grey-400);
    margin: 0;
  }
  .quelle a {
    color: var(--color-primary-600);
    text-decoration: underline;
    text-underline-offset: 2px;
  }
</style>
