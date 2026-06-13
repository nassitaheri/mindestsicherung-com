<!--
  ============================================================================
   Rechner.svelte — Mindestsicherungs-Rechner (interaktive Insel)
  ============================================================================

   - Schrittweise Felder (Brief 6), aber alles auf einer Seite mit Defaults.
   - Live-Update: Ergebnis aktualisiert sich bei jeder Eingabe.
   - aria-live für Screenreader, sichtbarer Fokus per global.css.
   - Komplette Rechenlogik lebt in src/lib/calc.ts — diese Komponente macht
     NUR Eingabe/Ausgabe, keine eigene Mathematik.
  ============================================================================
-->
<script lang="ts">
  import { berechne, euro, type HaushaltInput } from '../lib/calc';
  import {
    BUNDESLAENDER,
    BUNDESLAND_REIHENFOLGE,
    DISCLAIMER,
    STAND,
    type BundeslandSlug,
  } from '../data/saetze-2026';

  type Props = {
    /** Wenn gesetzt: Bundesland-Auswahl ist gesperrt (auf Wien-Seite). */
    fixedBundesland?: BundeslandSlug;
  };

  let { fixedBundesland }: Props = $props();

  // ---- State ----------------------------------------------------------------
  let bundesland = $state<BundeslandSlug>(fixedBundesland ?? 'wien');
  let konstellation = $state<HaushaltInput['konstellation']>('alleinstehend');
  let erwachseneInWg = $state(2);
  let kinder = $state(0);
  let mitBehinderung = $state(0);
  let einkommenMonat = $state(0);
  let vermoegen = $state(0);

  // ---- Abgeleitet -----------------------------------------------------------
  let land = $derived(BUNDESLAENDER[bundesland]);
  let erwachsene = $derived.by(() => {
    if (konstellation === 'paar') return 2;
    if (konstellation === 'wg') return Math.max(2, erwachseneInWg);
    return 1; // alleinstehend / alleinerziehend
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
    }),
  );

  // Klartext-Begründung für das Ergebnis (für die "Was bedeutet das?"-Box).
  let resultLabel = $derived.by(() => {
    if (ergebnis.vermoegenUeberFreibetrag) return 'Kein Anspruch (Vermögen)';
    if (!ergebnis.hatAnspruch) return 'Kein Anspruch';
    return 'Voraussichtlicher Auszahlbetrag pro Monat';
  });
</script>

<section class="rechner" aria-labelledby="rechner-titel">
  <header class="rechner__head">
    <h2 id="rechner-titel" class="rechner__title">
      Mindestsicherung berechnen
    </h2>
    <p class="rechner__sub">
      Schnelle, unverbindliche Orientierung — alle Felder sind optional bis auf das Einkommen.
      Stand: {STAND.datum}.
    </p>
  </header>

  <!-- ===================== ERGEBNIS (oben, sticky auf Mobile) ============== -->
  <div class="result" aria-live="polite">
    <div class="result__label">{resultLabel}</div>
    <div class="result__amount">
      {#if ergebnis.hatAnspruch}
        {euro(ergebnis.auszahlbetrag)}
      {:else}
        — €
      {/if}
    </div>
    <div class="result__meta">
      Gesamtbedarf {euro(ergebnis.gesamtbedarf)} − Einkommen {euro(ergebnis.einkommen)}
    </div>
  </div>

  <!-- ===================== EINGABE-FORMULAR ================================ -->
  <form
    class="form"
    onsubmit={(e) => e.preventDefault()}
    aria-describedby="disclaimer"
  >
    <!-- Schritt 1: Bundesland -->
    {#if !fixedBundesland}
      <fieldset class="step">
        <legend class="step__legend">
          <span class="step__num">1</span> Bundesland
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
                {BUNDESLAENDER[slug].name}
                {BUNDESLAENDER[slug].status === 'draft' ? ' (in Prüfung)' : ''}
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
        <span class="step__num">{fixedBundesland ? 1 : 2}</span> Haushalt
      </legend>

      <div class="field">
        <span class="field__label">Wie wohnst du?</span>
        <div class="radio-group" role="radiogroup" aria-label="Konstellation">
          {#each [
            { v: 'alleinstehend', l: 'Alleinstehend' },
            { v: 'alleinerziehend', l: 'Alleinerziehend' },
            { v: 'paar', l: 'Paar / Lebensgemeinschaft' },
            { v: 'wg', l: 'Wohngemeinschaft' },
          ] as opt}
            <label class="radio">
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
          <input
            type="number"
            class="field__input"
            min="2"
            step="1"
            bind:value={erwachseneInWg}
          />
        </label>
      {/if}

      <label class="field">
        <span class="field__label">Minderjährige Kinder im Haushalt</span>
        <input
          type="number"
          class="field__input"
          min="0"
          step="1"
          bind:value={kinder}
        />
      </label>

      <label class="field">
        <span class="field__label">
          Personen mit Behindertenpass (§40 BBG)
        </span>
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
    </fieldset>

    <!-- Schritt 3: Einkommen + Vermögen -->
    <fieldset class="step">
      <legend class="step__legend">
        <span class="step__num">{fixedBundesland ? 2 : 3}</span> Einkommen &amp; Vermögen
      </legend>

      <label class="field">
        <span class="field__label">
          Monatliches Netto-Einkommen aller Personen (Euro)
        </span>
        <input
          type="number"
          class="field__input"
          min="0"
          step="10"
          inputmode="decimal"
          bind:value={einkommenMonat}
          aria-describedby="einkommen-hint"
        />
        <span id="einkommen-hint" class="field__hint">
          Alle anrechenbaren Einkünfte zusammen. Familienbeihilfe wird in der Regel
          nicht angerechnet — im Zweifel bei der zuständigen Stelle nachfragen.
        </span>
      </label>

      <label class="field">
        <span class="field__label">
          Verwertbares Vermögen (Sparbuch, Bargeld, in Euro)
        </span>
        <input
          type="number"
          class="field__input"
          min="0"
          step="100"
          inputmode="decimal"
          bind:value={vermoegen}
          aria-describedby="vermoegen-hint"
        />
        <span id="vermoegen-hint" class="field__hint">
          Freibetrag: {euro(ergebnis.vermoegensfreibetragGesamt)}
          ({euro(land.saetze.vermoegensfreibetrag)} pro volljähriger Person).
          Selbst bewohnte Eigentumswohnung, notwendiges Auto und Wohnungseinrichtung
          zählen nicht mit.
        </span>
      </label>
    </fieldset>

    <!-- ===================== AUFSCHLÜSSELUNG =============================== -->
    <section class="breakdown" aria-label="Aufschlüsselung der Berechnung">
      <h3 class="breakdown__title">So setzt sich das zusammen</h3>
      <dl class="breakdown__list">
        <div>
          <dt>Erwachsene</dt>
          <dd>{euro(ergebnis.erwachsenenBedarf)}</dd>
        </div>
        {#if ergebnis.kinderBedarf > 0}
          <div>
            <dt>Kinder ({kinder})</dt>
            <dd>{euro(ergebnis.kinderBedarf)}</dd>
          </div>
        {/if}
        {#if ergebnis.zuschlaege > 0}
          <div>
            <dt>Behindertenzuschlag</dt>
            <dd>{euro(ergebnis.zuschlaege)}</dd>
          </div>
        {/if}
        <div class="breakdown__sum">
          <dt>Gesamtbedarf</dt>
          <dd>{euro(ergebnis.gesamtbedarf)}</dd>
        </div>
        <div>
          <dt>− Einkommen</dt>
          <dd>−{euro(ergebnis.einkommen)}</dd>
        </div>
        <div class="breakdown__result">
          <dt>Auszahlbetrag pro Monat</dt>
          <dd>{euro(ergebnis.auszahlbetrag)}</dd>
        </div>
      </dl>
    </section>

    <!-- ===================== HINWEISE & DISCLAIMER ========================= -->
    {#if ergebnis.hinweise.length > 0}
      <aside class="notes" aria-label="Hinweise">
        <ul>
          {#each ergebnis.hinweise as note}
            <li>{note}</li>
          {/each}
        </ul>
      </aside>
    {/if}

    {#if land.hinweise.length > 0}
      <aside class="notes notes--land" aria-label="Bundesland-Hinweise">
        <h4>Wichtig für {land.name}</h4>
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
  /* Wir nutzen bewusst Komponenten-CSS hier, statt Tailwind-Klassen, damit
     diese Insel ohne den Tailwind-Build prinzipiell auch standalone funktioniert
     und das Markup nicht visuell überfrachtet wird. Tokens kommen aus global.css. */

  .rechner {
    background: var(--color-surface);
    border: 1px solid var(--color-line);
    border-radius: var(--radius-card);
    padding: clamp(20px, 4vw, 32px);
    box-shadow: 0 1px 0 rgba(17, 20, 24, 0.02);
  }

  .rechner__head {
    margin-bottom: 24px;
  }
  .rechner__title {
    font-family: var(--font-display);
    font-size: clamp(22px, 3.5vw, 28px);
    line-height: 1.15;
    margin: 0 0 6px;
    color: var(--color-ink);
    letter-spacing: -0.01em;
  }
  .rechner__sub {
    margin: 0;
    color: var(--color-muted);
    font-size: 14px;
  }

  /* ---- Ergebnis-Box ---- */
  .result {
    background: var(--color-accent-soft);
    border: 1px solid color-mix(in srgb, var(--color-accent) 22%, transparent);
    border-radius: 12px;
    padding: 20px 22px;
    margin-bottom: 28px;
  }
  .result__label {
    font-size: 13px;
    color: var(--color-ink-soft);
    text-transform: uppercase;
    letter-spacing: 0.06em;
    margin-bottom: 6px;
  }
  .result__amount {
    font-family: var(--font-display);
    font-size: clamp(40px, 8vw, 56px);
    font-weight: 600;
    color: var(--color-accent);
    line-height: 1;
    letter-spacing: -0.02em;
    font-variant-numeric: tabular-nums;
  }
  .result__meta {
    margin-top: 8px;
    font-size: 13px;
    color: var(--color-ink-soft);
    font-variant-numeric: tabular-nums;
  }

  /* ---- Form ---- */
  .form {
    display: flex;
    flex-direction: column;
    gap: 28px;
  }
  .step {
    border: none;
    padding: 0;
    margin: 0;
    display: flex;
    flex-direction: column;
    gap: 18px;
  }
  .step__legend {
    display: flex;
    align-items: center;
    gap: 10px;
    font-weight: 600;
    color: var(--color-ink);
    font-size: 16px;
    margin-bottom: 4px;
  }
  .step__num {
    display: inline-flex;
    align-items: center;
    justify-content: center;
    width: 26px;
    height: 26px;
    min-height: 0;
    background: var(--color-ink);
    color: white;
    border-radius: 999px;
    font-size: 13px;
    font-weight: 600;
  }

  .field {
    display: flex;
    flex-direction: column;
    gap: 6px;
  }
  .field__label {
    font-size: 14px;
    color: var(--color-ink);
    font-weight: 500;
  }
  .field__input {
    appearance: none;
    -webkit-appearance: none;
    border: 1px solid var(--color-line);
    border-radius: 10px;
    background: white;
    padding: 10px 14px;
    font-size: 16px; /* ≥16px verhindert iOS-Zoom */
    color: var(--color-ink);
    font-variant-numeric: tabular-nums;
    transition: border-color 120ms ease;
  }
  .field__input:hover {
    border-color: color-mix(in srgb, var(--color-ink) 25%, var(--color-line));
  }
  .field__hint {
    font-size: 13px;
    color: var(--color-muted);
    line-height: 1.4;
  }
  .field__hint--warn {
    color: var(--color-warn);
    background: var(--color-warn-soft);
    padding: 8px 12px;
    border-radius: 8px;
  }

  .radio-group {
    display: grid;
    grid-template-columns: 1fr 1fr;
    gap: 8px;
  }
  @media (max-width: 480px) {
    .radio-group {
      grid-template-columns: 1fr;
    }
  }
  .radio {
    display: flex;
    align-items: center;
    gap: 10px;
    padding: 12px 14px;
    border: 1px solid var(--color-line);
    border-radius: 10px;
    background: white;
    cursor: pointer;
    font-size: 15px;
    line-height: 1.2;
    transition: border-color 120ms ease, background 120ms ease;
  }
  .radio:has(input:checked) {
    border-color: var(--color-accent);
    background: var(--color-accent-soft);
  }
  .radio input {
    accent-color: var(--color-accent);
    min-height: 0;
    width: 18px;
    height: 18px;
  }

  /* ---- Aufschlüsselung ---- */
  .breakdown {
    border-top: 1px solid var(--color-line);
    padding-top: 22px;
  }
  .breakdown__title {
    font-size: 14px;
    text-transform: uppercase;
    letter-spacing: 0.06em;
    color: var(--color-muted);
    margin: 0 0 14px;
    font-weight: 600;
  }
  .breakdown__list {
    margin: 0;
    display: flex;
    flex-direction: column;
    gap: 8px;
    font-variant-numeric: tabular-nums;
  }
  .breakdown__list > div {
    display: flex;
    justify-content: space-between;
    gap: 16px;
    color: var(--color-ink-soft);
    font-size: 15px;
  }
  .breakdown__list dt {
    margin: 0;
  }
  .breakdown__list dd {
    margin: 0;
  }
  .breakdown__sum {
    border-top: 1px solid var(--color-line);
    padding-top: 8px;
    margin-top: 4px;
    font-weight: 600;
    color: var(--color-ink) !important;
  }
  .breakdown__result {
    border-top: 1px solid var(--color-line);
    padding-top: 12px;
    margin-top: 8px;
    font-weight: 700;
    color: var(--color-accent) !important;
    font-size: 17px !important;
  }

  /* ---- Hinweise ---- */
  .notes {
    background: var(--color-warn-soft);
    border-left: 3px solid var(--color-warn);
    padding: 14px 16px;
    border-radius: 4px;
    font-size: 14px;
    color: var(--color-ink-soft);
  }
  .notes h4 {
    margin: 0 0 6px;
    font-size: 14px;
    color: var(--color-ink);
  }
  .notes ul {
    margin: 0;
    padding-left: 18px;
  }
  .notes--land {
    background: #f5f5f0;
    border-left-color: var(--color-ink-soft);
  }

  .disclaimer {
    font-size: 13px;
    color: var(--color-muted);
    line-height: 1.5;
    margin: 0;
    font-style: italic;
  }
  .quelle {
    font-size: 13px;
    color: var(--color-muted);
    margin: 0;
  }
  .quelle a {
    color: var(--color-accent);
    text-decoration: underline;
    text-underline-offset: 2px;
  }
</style>
