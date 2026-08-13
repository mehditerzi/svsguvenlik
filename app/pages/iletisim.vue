<script setup lang="ts">
import { gsap } from '~/composables/useMotion'
import { brand, sectors } from '~/data/site'

useHead({ title: 'İletişim — SVS Shadow VIP Security' })

const form = reactive({ name: '', company: '', mail: '', sector: sectors[0]!.title, note: '' })
const sent = ref(false)
const root = ref<HTMLElement | null>(null)

useScene((_ctx, el) => {
  gsap.fromTo(
    el.querySelectorAll('.frm__field'),
    { y: 34, autoAlpha: 0 },
    {
      y: 0,
      autoAlpha: 1,
      duration: 0.9,
      stagger: 0.06,
      ease: 'expo.out',
      scrollTrigger: { trigger: el, start: 'top 78%', once: true }
    }
  )
}, root)

const submit = () => {
  // No backend in this build — the form validates and confirms locally.
  if (!form.name || !form.mail) return
  sent.value = true
}
</script>

<template>
  <main>
    <ChromePageHero
      index="04 — İletişim"
      :title="['Sahayı', 'konuşalım.']"
      lead="Mevcut kurulumunuzu inceleyip 5 iş günü içinde kapsam ve fiyat teklifiyle dönüyoruz."
    />

    <section ref="root" class="ctc section on-paper stage">
      <div class="ctc__grid shell">
        <form class="frm" @submit.prevent="submit">
          <div class="frm__field">
            <label class="meta" for="f-name">Ad Soyad *</label>
            <input id="f-name" v-model="form.name" type="text" required autocomplete="name" />
          </div>
          <div class="frm__field">
            <label class="meta" for="f-comp">Kurum</label>
            <input id="f-comp" v-model="form.company" type="text" autocomplete="organization" />
          </div>
          <div class="frm__field">
            <label class="meta" for="f-mail">E-posta *</label>
            <input id="f-mail" v-model="form.mail" type="email" required autocomplete="email" />
          </div>
          <div class="frm__field">
            <label class="meta" for="f-sec">İlgilendiğiniz alan</label>
            <select id="f-sec" v-model="form.sector">
              <option v-for="s in sectors" :key="s.id">{{ s.title }}</option>
            </select>
          </div>
          <div class="frm__field frm__field--wide">
            <label class="meta" for="f-note">Sahaya dair notunuz</label>
            <textarea id="f-note" v-model="form.note" rows="4" />
          </div>

          <div class="frm__actions frm__field frm__field--wide">
            <MotionMagneticButton label="Teklif isteği gönder" variant="solid" cursor="Gönder" />
            <span v-if="sent" class="meta meta--brass">Talebiniz alındı — 5 iş günü içinde dönüş yapılacak.</span>
          </div>
        </form>

        <aside class="ctc__aside">
          <div class="ctc__blk">
            <span class="meta">Merkez ofis</span>
            <p v-for="l in brand.address" :key="l" class="ctc__line">{{ l }}</p>
          </div>
          <div class="ctc__blk">
            <span class="meta">Doğrudan hat</span>
            <a class="ctc__line ctc__link" :href="`tel:${brand.phone.replace(/\s/g, '')}`">{{ brand.phone }}</a>
            <a class="ctc__line ctc__link" :href="`mailto:${brand.mail}`">{{ brand.mail }}</a>
          </div>
          <div class="ctc__blk">
            <span class="meta">Komuta merkezi</span>
            <p class="ctc__line">7/24 · 365 gün açık</p>
            <p class="body-s">Acil durumlarda saha ekibi ortalama 9 dakikada konumlanır.</p>
          </div>
        </aside>
      </div>
    </section>
  </main>
</template>

<style scoped lang="scss">
.ctc {
  padding-block: clamp(56px, 10vh, 140px) clamp(70px, 13vh, 170px);
}

.ctc__grid {
  display: grid;
  grid-template-columns: minmax(0, 1.25fr) minmax(0, 0.75fr);
  gap: clamp(2rem, 6vw, 6rem);
}

.frm {
  display: grid;
  grid-template-columns: repeat(2, minmax(0, 1fr));
  gap: clamp(1.2rem, 3vw, 2.4rem);
}

.frm__field {
  display: grid;
  gap: 0.5rem;
  align-content: start;
}

.frm__field--wide {
  grid-column: 1 / -1;
}

input,
select,
textarea {
  font: inherit;
  font-size: clamp(1rem, 1.25vw, 1.25rem);
  color: inherit;
  background: transparent;
  border: 0;
  border-bottom: 1px solid color-mix(in srgb, var(--fg) 24%, transparent);
  padding: 0.55rem 0;
  border-radius: 0;
  outline: none;
  transition: border-color 0.5s var(--ease);
  resize: none;

  &:focus {
    border-color: var(--brass);
  }
}

select {
  appearance: none;
  cursor: pointer;
}

.frm__actions {
  display: flex;
  flex-wrap: wrap;
  align-items: center;
  gap: 1.4rem;
  margin-top: 0.8rem;
}

.ctc__aside {
  display: grid;
  gap: clamp(1.4rem, 3vh, 2.4rem);
  align-content: start;
}

.ctc__blk {
  display: grid;
  gap: 0.35rem;
  border-top: 1px solid var(--rule);
  padding-top: 0.9rem;

  .meta {
    margin-bottom: 0.4rem;
  }
}

.ctc__line {
  font-size: clamp(1rem, 1.2vw, 1.2rem);
  letter-spacing: -0.02em;
}

.ctc__link {
  width: fit-content;
  border-bottom: 1px solid transparent;
  transition: border-color 0.5s var(--ease);

  &:hover {
    border-color: var(--brass);
  }
}

@media (max-width: 1024px) {
  .ctc__grid,
  .frm {
    grid-template-columns: 1fr;
  }
}
</style>
