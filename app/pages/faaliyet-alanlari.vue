<script setup lang="ts">
import { sectors, services, workflow as steps, compliance, faq } from '~/data/site'

useHead({ title: 'Faaliyet Alanları — SVS Shadow VIP Security' })
</script>

<template>
  <main>
    <ChromePageHero
      index="02 — Faaliyet alanları"
      :title="['Dört alan,', 'tek operasyon', 'masası.']"
      lead="Güvenlik, tesis yönetimi, teknoloji ve saha operasyonu; birbirini besleyen dört birim olarak çalışır."
    />

    <section class="fal section on-paper stage">
      <article v-for="(s, i) in sectors" :id="s.id" :key="s.id" class="fal__row" :class="i % 2 && 'fal__row--rev'">
        <MotionRevealImage
          class="fal__img"
          :src="s.image"
          :alt="s.title"
          ratio="4 / 3"
          :from="i % 2 ? 'right' : 'left'"
          :parallax="6"
        />

        <div class="fal__body">
          <span class="meta meta--brass">{{ s.index }}</span>
          <MotionSplitText as="h2" class="display d-md fal__t" :lines="[s.title]" mode="char" :stagger="0.03" />
          <p class="fal__lead">{{ s.lead }}</p>
          <p class="body-s">{{ s.body }}</p>
          <dl class="fal__meta">
            <div v-for="m in s.meta" :key="m.k">
              <dt class="meta">{{ m.k }}</dt>
              <dd>{{ m.v }}</dd>
            </div>
          </dl>
        </div>
      </article>
    </section>

    <!-- full service catalogue: each one carries its own live diagram -->
    <section class="svl section on-ink stage">
      <div class="shell">
        <span class="meta meta--brass">Hizmet kataloğu</span>
        <h2 class="display d-md svl__h">On hizmet, tek sözleşme.</h2>
      </div>

      <div class="svl__list shell">
        <article v-for="s in services" :key="s.n" :id="`hizmet-${s.n}`" class="scard">
          <div class="scard__vis">
            <GlServiceCanvas
              :variant="s.canvas.variant"
              :seed="(s.canvas.seed ?? 0) + 400"
              :speed="s.canvas.speed"
              :density="s.canvas.density"
              :mirror="!s.canvas.mirror"
              bare
            />
          </div>

          <div class="scard__body">
            <span class="serif-num svc__n">{{ s.n }}</span>
            <h3 class="scard__t">{{ s.title }}</h3>
            <p class="scard__lead">{{ s.desc }}</p>
            <p class="body-s scard__detail">{{ s.detail }}</p>

            <ul class="scard__points">
              <li v-for="pt in s.points" :key="pt">{{ pt }}</li>
            </ul>

            <dl class="scard__meta">
              <div v-for="m in s.meta" :key="m.k">
                <dt class="meta">{{ m.k }}</dt>
                <dd>{{ m.v }}</dd>
              </div>
            </dl>
          </div>
        </article>
      </div>
    </section>

    <!-- how an engagement runs -->
    <section class="prc section on-paper stage">
      <div class="shell">
        <span class="meta meta--brass">Nasıl çalışıyoruz</span>
        <h2 class="display d-md prc__h">Analizden aylık rapora.</h2>

        <ol class="prc__list">
          <li v-for="st in steps" :key="st.n" class="prc__step">
            <span class="serif-num prc__n">{{ st.n }}</span>
            <h3 class="prc__t">{{ st.title }}</h3>
            <p class="body-s">{{ st.desc }}</p>
            <span class="meta meta--brass prc__out">{{ st.out }}</span>
          </li>
        </ol>
      </div>
    </section>

    <!-- the paperwork procurement asks for first -->
    <section class="cmp section on-ink stage">
      <div class="shell cmp__grid">
        <div class="cmp__head">
          <span class="meta meta--brass">Mevzuat & belgeler</span>
          <h2 class="display d-sm cmp__h">Kâğıt üzerinde de tamam.</h2>
        </div>
        <dl class="cmp__list">
          <div v-for="c in compliance" :key="c.k" class="cmp__row">
            <dt class="cmp__k">{{ c.k }}</dt>
            <dd class="cmp__v">{{ c.v }}</dd>
          </div>
        </dl>
      </div>
    </section>

    <!-- questions from the first meeting -->
    <section class="faq section on-paper stage">
      <div class="shell">
        <span class="meta meta--brass">Sık sorulanlar</span>
        <h2 class="display d-md faq__h">İlk toplantıda çıkan sorular.</h2>

        <div class="faq__list">
          <details v-for="(f, i) in faq" :key="i" class="faq__i">
            <summary class="faq__q">
              <span>{{ f.q }}</span>
              <i class="faq__mark" aria-hidden="true" />
            </summary>
            <p class="body-s faq__a">{{ f.a }}</p>
          </details>
        </div>
      </div>
    </section>

    <ScenesContactScene />
  </main>
</template>

<style scoped lang="scss">
.fal {
  padding-block: clamp(60px, 11vh, 150px);
  display: grid;
  gap: clamp(3rem, 12vh, 10rem);
}

.fal__row {
  display: grid;
  grid-template-columns: minmax(0, 1.05fr) minmax(0, 0.95fr);
  gap: clamp(1.6rem, 5vw, 5rem);
  align-items: center;
  padding-inline: var(--gut);
  scroll-margin-top: 100px;
}

.fal__row--rev {
  direction: rtl;
  > * {
    direction: ltr;
  }
}

.fal__body {
  display: grid;
  gap: 0.85rem;
  align-content: center;
}

.fal__t {
  font-weight: 500;
}

.fal__lead {
  font-size: clamp(1.1rem, 1.5vw, 1.5rem);
  letter-spacing: -0.028em;
  line-height: 1.14;
  color: var(--brass);
}

.fal__meta {
  display: grid;
  grid-template-columns: repeat(3, minmax(0, 1fr));
  gap: 1rem;
  border-top: 1px solid var(--rule);
  padding-top: 0.9rem;
  margin-top: 0.6rem;

  dd {
    font-size: 0.98rem;
    margin-top: 0.2rem;
  }
}

.svl {
  padding-block: clamp(60px, 11vh, 150px);
}

.svl__h {
  max-width: 16ch;
  margin-top: 0.6rem;
}

.svl__list {
  display: grid;
  gap: clamp(2.4rem, 7vh, 6rem);
  margin-top: clamp(2.4rem, 7vh, 5rem);
}

.scard {
  display: grid;
  grid-template-columns: minmax(0, 0.85fr) minmax(0, 1.15fr);
  gap: clamp(1.4rem, 4vw, 3.6rem);
  align-items: start;
  padding-top: clamp(1.4rem, 3vh, 2.4rem);
  border-top: 1px solid var(--rule);
  scroll-margin-top: 110px;
}

.scard__vis {
  aspect-ratio: 4 / 3;
  position: sticky;
  top: 18vh;
  /* the canvas fills with ink, which matches the band — a hairline frame and a
     touch of lift are what make it read as a panel rather than a hole */
  border: 1px solid var(--rule);
  background: #0E1116;
  overflow: hidden;
}

.scard__body {
  display: grid;
  gap: 0.7rem;
}

.scard__n {
  font-size: clamp(1.6rem, 2.4vw, 2.4rem);
  color: var(--brass);
}

.scard__t {
  font-size: clamp(1.5rem, 2.8vw, 2.8rem);
  font-weight: 500;
  letter-spacing: -0.04em;
  line-height: 1;
}

.scard__lead {
  font-size: clamp(1.02rem, 1.3vw, 1.3rem);
  letter-spacing: -0.02em;
  line-height: 1.24;
  max-width: 40ch;
}

.scard__detail {
  max-width: 58ch;
}

.scard__points {
  display: grid;
  gap: 0.4rem;
  margin-top: 0.4rem;

  li {
    position: relative;
    padding-left: 1.1rem;
    font-size: 0.96rem;
    opacity: 0.82;

    &::before {
      content: '';
      position: absolute;
      left: 0;
      top: 0.62em;
      width: 5px;
      height: 5px;
      background: var(--brass);
    }
  }
}

.scard__meta {
  display: grid;
  grid-template-columns: repeat(3, minmax(0, 1fr));
  gap: 1rem;
  border-top: 1px solid var(--rule);
  padding-top: 0.9rem;
  margin-top: 0.6rem;

  dd {
    font-size: 0.96rem;
    margin-top: 0.15rem;
  }
}

/* ── process ─────────────────────────────────────────────────────────────── */
.prc {
  padding-block: clamp(60px, 11vh, 150px);
}

.prc__h {
  max-width: 14ch;
  margin-top: 0.6rem;
}

.prc__list {
  display: grid;
  grid-template-columns: repeat(4, minmax(0, 1fr));
  gap: clamp(1.2rem, 3vw, 2.6rem);
  margin-top: clamp(2rem, 6vh, 4rem);
}

.prc__step {
  display: grid;
  gap: 0.5rem;
  align-content: start;
  border-top: 1px solid var(--rule);
  padding-top: 1rem;
  transition: transform 0.6s var(--ease);

  &:hover {
    transform: translateY(-6px);
  }
}

.prc__n {
  font-size: clamp(2rem, 3.4vw, 3.2rem);
  color: var(--brass);
}

.prc__t {
  font-size: clamp(1.1rem, 1.6vw, 1.5rem);
  font-weight: 500;
  letter-spacing: -0.03em;
}

.prc__out {
  margin-top: 0.4rem;
}

/* ── compliance ──────────────────────────────────────────────────────────── */
.cmp {
  padding-block: clamp(60px, 11vh, 150px);
}

.cmp__grid {
  display: grid;
  grid-template-columns: minmax(0, 0.7fr) minmax(0, 1.3fr);
  gap: clamp(1.6rem, 5vw, 5rem);
  align-items: start;
}

.cmp__head {
  display: grid;
  gap: 0.8rem;
  position: sticky;
  top: 20vh;
}

.cmp__list {
  display: grid;
}

.cmp__row {
  display: grid;
  grid-template-columns: 8rem minmax(0, 1fr);
  gap: clamp(1rem, 3vw, 2.4rem);
  padding-block: clamp(0.9rem, 2.2vh, 1.5rem);
  border-top: 1px solid var(--rule);
  transition: padding-left 0.6s var(--ease);

  &:hover {
    padding-left: 0.8rem;
  }
}

.cmp__k {
  font-family: var(--font-mono);
  font-size: 0.82rem;
  letter-spacing: 0.1em;
  text-transform: uppercase;
  color: var(--brass);
  padding-top: 0.2em;
}

.cmp__v {
  font-size: clamp(1rem, 1.2vw, 1.18rem);
  line-height: 1.4;
}

/* ── faq ─────────────────────────────────────────────────────────────────── */
.faq {
  padding-block: clamp(60px, 11vh, 150px);
}

.faq__h {
  max-width: 16ch;
  margin-top: 0.6rem;
}

.faq__list {
  margin-top: clamp(2rem, 6vh, 4rem);
  border-top: 1px solid var(--rule);
}

.faq__i {
  border-bottom: 1px solid var(--rule);
}

.faq__q {
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 2rem;
  padding-block: clamp(1rem, 2.4vh, 1.7rem);
  cursor: pointer;
  list-style: none;
  font-size: clamp(1.05rem, 1.7vw, 1.6rem);
  font-weight: 500;
  letter-spacing: -0.03em;
  transition: padding-left 0.5s var(--ease), color 0.4s var(--ease);

  &::-webkit-details-marker { display: none; }

  &:hover {
    padding-left: 0.7rem;
    color: var(--brass);
  }
}

/* the marker morphs from + to − rather than swapping glyphs */
.faq__mark {
  position: relative;
  flex: none;
  width: 16px;
  height: 16px;

  &::before,
  &::after {
    content: '';
    position: absolute;
    inset: 50% 0 auto 0;
    height: 1.5px;
    background: currentColor;
    transition: transform 0.5s var(--ease);
  }
  &::after {
    transform: rotate(90deg);
  }
}

.faq__i[open] .faq__mark::after {
  transform: rotate(0deg);
}
.faq__i[open] .faq__q {
  color: var(--brass);
}

.faq__a {
  max-width: 68ch;
  padding-bottom: clamp(1rem, 2.4vh, 1.6rem);
}

@media (max-width: 1024px) {
  .fal__row,
  .fal__row--rev {
    grid-template-columns: 1fr;
    direction: ltr;
    gap: 1.6rem;
  }
  .scard {
    grid-template-columns: 1fr;
    gap: 1.2rem;
  }
  .scard__vis {
    position: static;
    aspect-ratio: 16 / 10;
  }
  .scard__meta {
    grid-template-columns: repeat(2, minmax(0, 1fr));
  }
  .prc__list {
    grid-template-columns: repeat(2, minmax(0, 1fr));
  }
  .cmp__grid {
    grid-template-columns: 1fr;
  }
  .cmp__head {
    position: static;
  }
  .cmp__row {
    grid-template-columns: 1fr;
    gap: 0.3rem;
  }
}

@media (max-width: 560px) {
  .prc__list {
    grid-template-columns: 1fr;
  }
  .scard__meta {
    grid-template-columns: 1fr;
  }
}
</style>
