<script setup lang="ts">
import { stats } from '~/data/site'

useHead({ title: 'Kurumsal — SVS Shadow VIP Security' })

const timeline = [
  { y: '2008', t: 'Kuruluş', d: 'İstanbul’da 24 kişilik kadroyla ilk plaza sözleşmesi.' },
  { y: '2013', t: 'Komuta merkezi', d: 'Tüm sahaların tek ekrandan izlendiği ilk operasyon odası.' },
  { y: '2017', t: 'Teknoloji birimi', d: 'CCTV ve geçiş kontrol kurulumları kendi ekibimize geçti.' },
  { y: '2021', t: 'Tesis yönetimi', d: 'Temizlik, teknik bakım ve peyzaj entegre sözleşmeye dahil edildi.' },
  { y: '2025', t: '81 il', d: 'Türkiye genelinde saha kurma ve müdahale yetkinliği.' }
]

const values = [
  { n: '01', t: 'Prosedür kişiye bağlı değildir', d: 'Her saha için yazılı senaryo, her vardiya için aynı kontrol listesi.' },
  { n: '02', t: 'Ölçmediğimiz şeyi yönetmeyiz', d: 'Devriye turu, olay kaydı ve müdahale süresi aylık rapora girer.' },
  { n: '03', t: 'Teknoloji insanı değiştirmez', d: 'Sistemler görevlinin gözünü büyütür; kararı yine saha ekibi verir.' }
]
</script>

<template>
  <main>
    <ChromePageHero
      index="01 — Kurumsal"
      :title="['Bir güvenlik', 'şirketinden', 'fazlası.']"
      lead="2008’den bu yana özel güvenlik, tesis yönetimi ve güvenlik teknolojilerini aynı operasyon disiplini altında yürütüyoruz."
      image="/media/hero-tower.webp"
    />

    <section class="krm section on-paper stage">
      <div class="krm__intro shell">
        <MotionRevealText
          class="lede krm__para"
          text="SVS Shadow VIP Security, sahayı bir hizmet kalemi değil sürekli işleyen bir sistem olarak görür. Kadro, prosedür ve teknoloji aynı masada planlanır; sahada olan her şey komuta merkezine düşer."
          :accent="['sistem', 'olarak']"
        />
        <div class="krm__stats">
          <div v-for="s in stats" :key="s.label" class="krm__stat">
            <p class="serif-num krm__num"><MotionCountUp :value="s.value" :suffix="s.suffix" /></p>
            <p class="krm__lab">{{ s.label }}</p>
          </div>
        </div>
      </div>

      <div class="krm__values shell">
        <article v-for="v in values" :key="v.n" class="krm__v">
          <span class="meta meta--brass">{{ v.n }}</span>
          <h3 class="krm__vt">{{ v.t }}</h3>
          <p class="body-s">{{ v.d }}</p>
        </article>
      </div>
    </section>

    <section class="tml section on-ink stage">
      <div class="shell">
        <span class="meta meta--brass">Zaman çizelgesi</span>
        <MotionKineticHeading class="tml__h" :lines="['17 YIL']" :drift="[-6]" />

        <ol class="tml__list">
          <li v-for="t in timeline" :key="t.y" class="tml__item">
            <span class="serif-num tml__y">{{ t.y }}</span>
            <div class="tml__c">
              <h3 class="tml__t">{{ t.t }}</h3>
              <p class="body-s">{{ t.d }}</p>
            </div>
          </li>
        </ol>
      </div>
    </section>

    <ScenesContactScene />
  </main>
</template>

<style scoped lang="scss">
.krm {
  padding-block: clamp(60px, 11vh, 150px);
}

.krm__intro {
  display: grid;
  grid-template-columns: minmax(0, 1.1fr) minmax(0, 0.9fr);
  gap: clamp(2rem, 5vw, 6rem);
  align-items: start;
}

.krm__para {
  font-size: clamp(1.15rem, 1.7vw, 1.85rem);
  line-height: 1.28;
  max-width: 32ch;
}

.krm__stats {
  display: grid;
  grid-template-columns: repeat(2, minmax(0, 1fr));
  gap: clamp(1.4rem, 3vw, 3rem);
}

.krm__stat {
  border-top: 1px solid var(--rule);
  padding-top: 0.9rem;
}

.krm__num {
  font-size: clamp(2.4rem, 4.6vw, 4.6rem);
  color: var(--brass);
  margin-bottom: 0.5rem;
}

.krm__lab {
  font-size: 0.96rem;
  opacity: 0.7;
  max-width: 20ch;
}

.krm__values {
  display: grid;
  grid-template-columns: repeat(3, minmax(0, 1fr));
  gap: clamp(1.6rem, 4vw, 4rem);
  margin-top: clamp(3rem, 10vh, 8rem);
  border-top: 1px solid var(--rule);
  padding-top: clamp(1.4rem, 3vh, 2.6rem);
}

.krm__v {
  display: grid;
  gap: 0.6rem;
  align-content: start;
}

.krm__vt {
  font-size: clamp(1.2rem, 1.9vw, 1.8rem);
  font-weight: 500;
  letter-spacing: -0.032em;
  line-height: 1.06;
  max-width: 16ch;
}

.tml {
  padding-block: clamp(60px, 11vh, 150px);
}

.tml__h {
  font-size: clamp(3.4rem, 15vw, 17rem);
  margin-block: 0.2em 0.4em;
}

.tml__list {
  display: grid;
}

.tml__item {
  display: grid;
  grid-template-columns: minmax(0, 0.3fr) minmax(0, 1fr);
  gap: clamp(1rem, 3vw, 3rem);
  padding-block: clamp(1rem, 2.6vh, 2rem);
  border-top: 1px solid var(--rule);
  transition: padding 0.6s var(--ease);

  &:hover {
    padding-left: 1.2rem;
  }
}

.tml__y {
  font-size: clamp(1.8rem, 3vw, 3rem);
  color: var(--brass);
}

.tml__t {
  font-size: clamp(1.1rem, 1.7vw, 1.6rem);
  font-weight: 500;
  letter-spacing: -0.03em;
  margin-bottom: 0.35rem;
}

@media (max-width: 1024px) {
  .krm__intro,
  .krm__values {
    grid-template-columns: 1fr;
    gap: 2.2rem;
  }
  .tml__item {
    grid-template-columns: 1fr;
    gap: 0.5rem;
  }
}
</style>
