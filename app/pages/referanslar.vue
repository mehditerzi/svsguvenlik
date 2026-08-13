<script setup lang="ts">
import { projects, clients, institutions } from '~/data/site'

useHead({ title: 'Referanslar — SVS Shadow VIP Security' })
</script>

<template>
  <main>
    <ChromePageHero
      index="03 — Referanslar"
      :title="['Kurulan', 'sistemler,', 'işleyen sahalar.']"
      lead="Plazadan limana, stadyumdan veri merkezine; farklı risk profillerinde kurduğumuz operasyonlardan bir seçki."
    />

    <section class="ref section on-paper stage">
      <article v-for="(p, i) in projects" :id="p.id" :key="p.id" class="ref__item">
        <div class="ref__no">
          <span class="serif-num">{{ String(i + 1).padStart(2, '0') }}</span>
        </div>

        <MotionRevealImage
          class="ref__img"
          :src="p.image"
          :alt="p.title"
          :ratio="i % 3 === 0 ? '16 / 9' : '4 / 3'"
          :from="i % 2 ? 'right' : 'bottom'"
          :parallax="7"
        />

        <div class="ref__meta">
          <h2 class="ref__t">{{ p.title }}</h2>
          <p class="meta">{{ p.sector }} · {{ p.city }} · {{ p.year }}</p>
          <p class="body-s">{{ p.scope }}</p>
        </div>
      </article>
    </section>

    <section class="cl section on-ink stage">
      <div class="shell">
        <span class="meta meta--brass">Hizmet verdiğimiz saha tipleri</span>
        <ul class="cl__grid">
          <li v-for="c in clients" :key="c" class="cl__i">{{ c }}</li>
        </ul>

        <!-- Kept understated on purpose: a record for whoever reads this far. -->
        <div class="inst">
          <div class="inst__head">
            <span class="meta">Kurumsal sicil</span>
            <span class="meta inst__note">Detaylı referans listesi talep üzerine paylaşılır</span>
          </div>
          <ul class="inst__list">
            <li v-for="i in institutions" :key="i.name" class="inst__i">
              <span class="inst__n">{{ i.name }}</span>
              <span class="meta">{{ i.note }}</span>
            </li>
          </ul>
        </div>
      </div>
    </section>

    <ScenesContactScene />
  </main>
</template>

<style scoped lang="scss">
.ref {
  padding-block: clamp(60px, 11vh, 150px);
  display: grid;
  gap: clamp(3rem, 11vh, 9rem);
}

.ref__item {
  display: grid;
  grid-template-columns: 5rem minmax(0, 1.6fr) minmax(0, 0.8fr);
  gap: clamp(1.2rem, 3vw, 3.4rem);
  align-items: start;
  padding-inline: var(--gut);
  scroll-margin-top: 110px;
}

.ref__item:nth-child(even) {
  grid-template-columns: minmax(0, 0.8fr) minmax(0, 1.6fr) 5rem;

  .ref__no { order: 3; }
  .ref__meta { order: 1; text-align: right; }
}

.ref__no .serif-num {
  font-size: clamp(1.8rem, 3vw, 3rem);
  color: var(--brass);
}

.ref__t {
  font-size: clamp(1.5rem, 2.6vw, 2.6rem);
  font-weight: 500;
  letter-spacing: -0.038em;
  line-height: 1;
  margin-bottom: 0.6rem;
}

.ref__meta {
  display: grid;
  gap: 0.55rem;
  padding-top: 0.4rem;
}

.cl {
  padding-block: clamp(60px, 11vh, 150px);
}

/* A quiet ledger, not a logo wall — small type, low contrast, set apart. */
.inst {
  margin-top: clamp(3rem, 9vh, 7rem);
  border-top: 1px solid var(--rule);
  padding-top: clamp(1.2rem, 3vh, 2rem);
  opacity: 0.62;
  transition: opacity 0.6s var(--ease);
}

.inst:hover {
  opacity: 1;
}

.inst__head {
  display: flex;
  flex-wrap: wrap;
  justify-content: space-between;
  gap: 0.6rem 2rem;
  margin-bottom: 1.4rem;
}

.inst__note {
  opacity: 0.7;
}

.inst__list {
  display: grid;
  grid-template-columns: repeat(3, minmax(0, 1fr));
  gap: 1rem clamp(1.2rem, 3vw, 3rem);
}

.inst__i {
  display: grid;
  gap: 0.2rem;
  padding-block: 0.5rem;
  border-top: 1px solid color-mix(in srgb, var(--fg) 9%, transparent);
}

.inst__n {
  font-size: 0.98rem;
  letter-spacing: -0.015em;
}

@media (max-width: 900px) {
  .inst__list {
    grid-template-columns: repeat(2, minmax(0, 1fr));
  }
}

@media (max-width: 560px) {
  .inst__list {
    grid-template-columns: 1fr;
  }
}

.cl__grid {
  display: grid;
  grid-template-columns: repeat(4, minmax(0, 1fr));
  margin-top: clamp(1.4rem, 4vh, 3rem);
  border-top: 1px solid var(--rule);
}

.cl__i {
  font-size: clamp(1.1rem, 1.9vw, 1.9rem);
  font-weight: 500;
  letter-spacing: -0.035em;
  padding-block: clamp(0.9rem, 2.4vh, 1.8rem);
  border-bottom: 1px solid var(--rule);
  border-right: 1px solid var(--rule);
  padding-left: 0.9rem;
  transition: color 0.5s var(--ease), background-color 0.5s var(--ease);

  &:hover {
    color: var(--brass);
  }
  &:nth-child(4n) {
    border-right: 0;
  }
}

@media (max-width: 1024px) {
  .ref__item,
  .ref__item:nth-child(even) {
    grid-template-columns: 3rem minmax(0, 1fr);
    gap: 1rem 1.2rem;

    .ref__no { order: 1; }
    .ref__img { grid-column: 1 / -1; }
    .ref__meta { order: 3; grid-column: 1 / -1; text-align: left; }
  }
  .cl__grid {
    grid-template-columns: repeat(2, minmax(0, 1fr));
  }
  .cl__i:nth-child(2n) {
    border-right: 0;
  }
}
</style>
