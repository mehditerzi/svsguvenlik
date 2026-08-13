export const brand = {
  name: 'SVS',
  sub: 'Shadow VIP Security',
  full: 'SVS Shadow VIP Security',
  claim: 'Sahayı gören güvenlik.',
  phone: '+90 216 306 06 01',
  mail: 'operasyon@svsguvenlik.com',
  address: ['Merkez Ofis', 'Kordonboyu, Ankara Cd. No:160', '34860 Kartal / İstanbul']
}

export const nav = [
  { label: 'Kurumsal', to: '/kurumsal', index: '01' },
  { label: 'Faaliyet Alanları', to: '/faaliyet-alanlari', index: '02' },
  { label: 'Referanslar', to: '/referanslar', index: '03' },
  { label: 'İletişim', to: '/iletisim', index: '04' }
]

export type CanvasVariant = 'patrol' | 'crowd' | 'optics' | 'facility' | 'risk' | 'dispatch'

/**
 * Each placement of a live diagram gets its own seed/speed/mirror so the same
 * interaction language never reads twice the same way on one page.
 */
export type CanvasSpec = {
  variant: CanvasVariant
  seed?: number
  speed?: number
  density?: number
  mirror?: boolean
}

export type Sector = {
  id: string
  index: string
  title: string
  lead: string
  body: string
  image: string
  meta: { k: string; v: string }[]
  tone: string
  canvas: CanvasSpec
}

export const sectors: Sector[] = [
  {
    id: 'guvenlik',
    index: '01',
    title: 'Güvenlik',
    lead: 'Sertifikalı kadro, tek komuta.',
    body:
      '5188 sayılı kanun kapsamında eğitimli özel güvenlik kadromuzla hastane, plaza, site, fabrika ve etkinlik alanlarında 7/24 kesintisiz fiziki koruma yürütüyoruz.',
    image: '/media/sector-guvenlik.webp',
    canvas: { variant: 'patrol', seed: 3, speed: 0.9 },
    meta: [
      { k: 'Kapsam', v: 'Fiziki Güvenlik' },
      { k: 'Kadro', v: '5188 Sertifikalı' },
      { k: 'Vardiya', v: '7/24 Kesintisiz' }
    ],
    tone: '#0A0B0D'
  },
  {
    id: 'tesis',
    index: '02',
    title: 'Tesis Yönetimi',
    lead: 'Binanın tamamı, tek sözleşme.',
    body:
      'Teknik bakım, temizlik, peyzaj ve enerji yönetimini tek noktadan yürüterek tesisin işletme maliyetini ölçülebilir biçimde aşağı çekiyoruz.',
    image: '/media/sector-tesis.webp',
    canvas: { variant: 'facility', seed: 11, speed: 1.1, mirror: true },
    meta: [
      { k: 'Kapsam', v: 'Teknik & Temizlik' },
      { k: 'Model', v: 'Entegre FM' },
      { k: 'Raporlama', v: 'Aylık KPI' }
    ],
    tone: '#0C0F13'
  },
  {
    id: 'teknoloji',
    index: '03',
    title: 'Teknoloji',
    lead: 'Sahayı veriye çeviren altyapı.',
    body:
      'CCTV, geçiş kontrol, alarm ve IoT sensörlerini kendi izleme yazılımımızda birleştirip operasyonu ekrandan yönetilebilir hale getiriyoruz.',
    image: '/media/sector-teknoloji.webp',
    canvas: { variant: 'optics', seed: 21, speed: 0.85 },
    meta: [
      { k: 'Kapsam', v: 'CCTV & Geçiş' },
      { k: 'Katman', v: 'IoT & Yazılım' },
      { k: 'İzleme', v: 'Uzaktan' }
    ],
    tone: '#0B0E12'
  },
  {
    id: 'operasyon',
    index: '04',
    title: 'Operasyon',
    lead: 'Komuta merkezi hiç kapanmaz.',
    body:
      'Türkiye genelindeki sahaları tek komuta merkezinden yönetiyor; olay anında müdahale ekibini dakikalar içinde konumlandırıyoruz.',
    image: '/media/sector-operasyon.webp',
    canvas: { variant: 'dispatch', seed: 31, speed: 1.05, density: 1.2 },
    meta: [
      { k: 'Kapsam', v: 'Komuta Merkezi' },
      { k: 'Erişim', v: '81 İl' },
      { k: 'Müdahale', v: 'Ortalama 9 dk' }
    ],
    tone: '#090A0C'
  }
]

export type Project = {
  id: string
  title: string
  sector: string
  city: string
  year: string
  image: string
  size: 'lg' | 'md' | 'sm' | 'wide'
  scope: string
}

export const projects: Project[] = [
  {
    id: 'meridyen',
    title: 'Meridyen Plaza',
    sector: 'Kurumsal Güvenlik',
    city: 'İstanbul',
    year: '2024',
    image: '/media/project-01.webp',
    size: 'lg',
    scope: '42 katlı ofis kulesi · 68 kişilik kadro · entegre geçiş kontrol'
  },
  {
    id: 'kuzey-avm',
    title: 'Kuzey AVM',
    sector: 'Perakende',
    city: 'Ankara',
    year: '2023',
    image: '/media/project-02.webp',
    size: 'sm',
    scope: '118.000 m² · CCTV yenileme · kalabalık yönetimi'
  },
  {
    id: 'tersane',
    title: 'Tersane Lojistik',
    sector: 'Endüstriyel',
    city: 'Kocaeli',
    year: '2024',
    image: '/media/project-03.webp',
    size: 'md',
    scope: 'Liman sahası · araç tanıma · 7/24 devriye'
  },
  {
    id: 'arena',
    title: 'Arena Stadyum',
    sector: 'Etkinlik',
    city: 'İzmir',
    year: '2025',
    image: '/media/project-04.webp',
    size: 'wide',
    scope: '41.000 kişilik kapasite · maç günü operasyonu'
  },
  {
    id: 'egitim-arastirma',
    title: 'Eğitim & Araştırma Hastanesi',
    sector: 'Sağlık Tesisi',
    city: 'İstanbul',
    year: '2023',
    image: '/media/project-05.webp',
    size: 'md',
    scope: 'Poliklinik akışı · ziyaretçi kartı · nöbet devri prosedürü'
  },
  {
    id: 'sehir-hastanesi',
    title: 'Şehir Hastanesi',
    sector: 'Sağlık Tesisi',
    city: 'Ankara',
    year: '2024',
    image: '/media/project-06.webp',
    size: 'sm',
    scope: 'Acil giriş kontrolü · triyaj noktası · 7/24 fiziki güvenlik'
  }
]

export type Service = {
  n: string
  title: string
  /** One-line summary used in lists. */
  desc: string
  /** The longer case for the service, used on the detail page. */
  detail: string
  /** What the client actually receives. */
  points: string[]
  meta: { k: string; v: string }[]
  image: string
  canvas: CanvasSpec
}

/**
 * Nine services. Variants repeat across the list on purpose — the seed, speed
 * and mirror flags keep two placements of the same diagram from reading alike.
 */
export const services: Service[] = [
  {
    n: '01',
    title: 'VIP & Yakın Koruma',
    desc: 'Yönetici, aile ve delegasyonlar için düşük profilli yakın koruma ve güzergâh planlaması.',
    detail:
      'Koruma ekibi işe güzergâhtan başlar. Rota alternatifleri, durak noktaları, giriş–çıkış senaryoları ve tahliye planı önceden yazılır; ekip sahaya bu plana hâkim olarak çıkar. Amaç görünür bir kalabalık kurmak değil, korunan kişinin gününü aksatmadan riski düşürmektir.',
    points: [
      'Güzergâh keşfi ve alternatif rota planı',
      'Öncü ekip ile varış noktası kontrolü',
      'Konvoy düzeni ve sürücü koordinasyonu',
      'Etkinlik ve toplantı alanı ön taraması'
    ],
    meta: [
      { k: 'Profil', v: 'Düşük görünürlük' },
      { k: 'Ekip', v: 'Öncü + refakat' },
      { k: 'Planlama', v: 'Görev öncesi keşif' }
    ],
    image: '/media/service-01.webp',
    canvas: { variant: 'patrol', seed: 7, speed: 1.2 }
  },
  {
    n: '02',
    title: 'Silahsız Özel Güvenlik',
    desc: 'Plaza, rezidans ve fabrika sahalarında sabit nokta, devriye ve resepsiyon hizmeti.',
    detail:
      '5188 sayılı kanun kapsamında sertifikalı kadroyla sabit nokta, resepsiyon ve devriye görevlerini yürütürüz. Her saha için vardiya çizelgesi, tur güzergâhı ve olay bildirim akışı yazılı hale getirilir; görevli değişse de prosedür değişmez.',
    points: [
      'Sabit nokta ve resepsiyon görevlendirmesi',
      'Saatlik devriye turu ve tur kaydı',
      'Ziyaretçi kayıt ve kartlı geçiş takibi',
      'Vardiya devir teslim tutanağı'
    ],
    meta: [
      { k: 'Kadro', v: '5188 sertifikalı' },
      { k: 'Vardiya', v: '3 vardiya / 7 gün' },
      { k: 'Kayıt', v: 'Dijital tur takibi' }
    ],
    image: '/media/service-01.webp',
    canvas: { variant: 'patrol', seed: 47, speed: 0.95, mirror: true }
  },
  {
    n: '03',
    title: 'Silahlı Özel Güvenlik',
    desc: 'Banka, değerli madde ve kritik altyapı tesislerinde silahlı görevli ile koruma.',
    detail:
      'Silahlı görevlendirme yalnızca kanunun izin verdiği tesis tiplerinde ve valilik izni alınmış görev yerlerinde yapılır. Görevli seçimi, atış yeterliliği ve psikoteknik takibi kadro dosyasında düzenli olarak yenilenir.',
    points: [
      'Valilik izinli görev yeri dosyası',
      'Atış yeterlilik ve psikoteknik takibi',
      'Kasa ve para nakil noktası prosedürü',
      'Olay anında kolluk koordinasyonu'
    ],
    meta: [
      { k: 'Yetki', v: 'Valilik izinli' },
      { k: 'Takip', v: 'Yıllık yenileme' },
      { k: 'Alan', v: 'Finans & kritik tesis' }
    ],
    image: '/media/service-03.webp',
    canvas: { variant: 'optics', seed: 91, speed: 0.9 }
  },
  {
    n: '04',
    title: 'Sağlık Tesisi Güvenliği',
    desc: 'Hastane acil girişleri, poliklinik akışı, ziyaretçi kartı ve nöbet devri prosedürleri.',
    detail:
      'Hastane, diğer sahalardan farklı olarak hiç boşalmayan ve duygusal yükü yüksek bir alandır. Acil giriş, triyaj ve yoğun bakım koridorlarında görevli, sağlık personelini koruyacak ve hasta yakınıyla temasını yönetecek şekilde eğitilir.',
    points: [
      'Acil servis giriş kontrolü ve yönlendirme',
      'Beyaz kod müdahale prosedürü',
      'Ziyaretçi kartı ve refakatçi takibi',
      'Poliklinik yoğunluk saatleri planlaması'
    ],
    meta: [
      { k: 'Kapsam', v: 'Acil & poliklinik' },
      { k: 'Prosedür', v: 'Beyaz kod' },
      { k: 'Vardiya', v: '7/24 kesintisiz' }
    ],
    image: '/media/service-02.webp',
    canvas: { variant: 'crowd', seed: 133, speed: 0.85, mirror: true }
  },
  {
    n: '05',
    title: 'Kalabalık & Etkinlik',
    desc: 'Stadyum, konser ve fuar alanlarında akış planlaması, arama noktaları ve tahliye senaryoları.',
    detail:
      'Etkinlik güvenliği kapı açılmadan önce biter. Kapasite, giriş sayısı, arama noktası hızı ve tahliye süresi kâğıt üzerinde hesaplanır; saha ekibi bu sayıları tutturmak için konumlandırılır.',
    points: [
      'Kapasite ve giriş hızı hesabı',
      'Arama noktası ve turnike planlaması',
      'Tahliye rotaları ve toplanma alanı',
      'Sahne önü ve backstage ayrımı'
    ],
    meta: [
      { k: 'Ölçek', v: '40.000+ kapasite' },
      { k: 'Planlama', v: 'Etkinlik öncesi' },
      { k: 'Koordinasyon', v: 'Kolluk & sağlık' }
    ],
    image: '/media/service-02.webp',
    canvas: { variant: 'crowd', seed: 5, speed: 1.05 }
  },
  {
    n: '06',
    title: 'Güvenlik Teknolojileri',
    desc: 'CCTV, geçiş kontrol ve alarm sistemlerinin projelendirilmesi, kurulumu ve bakımı.',
    detail:
      'Kamera sayısı değil, kapsanan alan önemlidir. Projelendirmeye kör nokta analiziyle başlar; kamera açısı, gece görüş mesafesi ve kayıt süresini tesisin gerçek risk haritasına göre belirleriz.',
    points: [
      'Kör nokta analizi ve kamera yerleşim planı',
      'Kartlı / biyometrik geçiş kontrol kurulumu',
      'Alarm ve yangın sistemleri entegrasyonu',
      'Periyodik bakım ve arıza müdahalesi'
    ],
    meta: [
      { k: 'Kapsam', v: 'CCTV & geçiş' },
      { k: 'Kayıt', v: 'Yasal saklama süresi' },
      { k: 'Bakım', v: 'Periyodik sözleşme' }
    ],
    image: '/media/service-03.webp',
    canvas: { variant: 'optics', seed: 63, speed: 1.05, mirror: true }
  },
  {
    n: '07',
    title: 'Alarm İzleme & Komuta',
    desc: 'Tüm sahaların tek merkezden izlenmesi, alarm doğrulama ve mobil ekip yönlendirmesi.',
    detail:
      'Komuta merkezi alarmı almakla yetinmez, doğrular. Kamera üzerinden teyit edilen olayda en yakın mobil ekip yönlendirilir; teyit edilemeyen sinyal saha görevlisine bağlanır. Böylece yanlış alarm trafiği operasyonu meşgul etmez.',
    points: [
      'Kamera destekli alarm doğrulama',
      'En yakın mobil ekibin yönlendirilmesi',
      'Olay kaydı ve zaman damgalı rapor',
      'Aylık alarm istatistiği ve trend analizi'
    ],
    meta: [
      { k: 'Merkez', v: '7/24 · 365 gün' },
      { k: 'Müdahale', v: 'Ortalama 9 dk' },
      { k: 'Rapor', v: 'Aylık KPI' }
    ],
    image: '/media/service-05.webp',
    canvas: { variant: 'dispatch', seed: 71, speed: 1.1 }
  },
  {
    n: '08',
    title: 'Tesis Yönetimi & Temizlik',
    desc: 'Teknik bakım, genel temizlik, peyzaj ve enerji yönetiminde entegre işletme.',
    detail:
      'Güvenlik ve tesis hizmetini aynı sözleşmede topladığımızda tek bir saha sorumlusu, tek raporlama ve ölçülebilir bir işletme maliyeti ortaya çıkar. Bina, bir hizmet listesi değil işleyen bir sistem olarak yönetilir.',
    points: [
      'Teknik bakım ve arıza yönetimi',
      'Genel alan ve ofis temizliği',
      'Peyzaj ve dış alan bakımı',
      'Enerji tüketimi takibi ve raporu'
    ],
    meta: [
      { k: 'Model', v: 'Entegre FM' },
      { k: 'Sorumlu', v: 'Tek saha müdürü' },
      { k: 'Rapor', v: 'Aylık KPI' }
    ],
    image: '/media/service-04.webp',
    canvas: { variant: 'facility', seed: 88, speed: 0.9, density: 1.15 }
  },
  {
    n: '09',
    title: 'Risk Analizi & Danışmanlık',
    desc: 'Saha analizi, tehdit modellemesi ve güvenlik prosedürlerinin yeniden yazımı.',
    detail:
      'Mevcut kurulumunuzu yerinde inceler, kadro–teknoloji–prosedür üçgeninde nerede fazla, nerede eksik olduğunuzu çıkarırız. Çıktı bir teklif değil, uygulanabilir bir yol haritasıdır; isterseniz uygulamayı başka bir firmayla da yürütebilirsiniz.',
    points: [
      'Yerinde saha ve kör nokta analizi',
      'Tehdit modellemesi ve senaryo çalışması',
      'Güvenlik prosedürlerinin yeniden yazımı',
      'Kadro ve teknoloji ihtiyaç raporu'
    ],
    meta: [
      { k: 'Süre', v: '5 iş günü' },
      { k: 'Çıktı', v: 'Yazılı yol haritası' },
      { k: 'Bağlayıcılık', v: 'Yok' }
    ],
    image: '/media/service-05.webp',
    canvas: { variant: 'risk', seed: 17, speed: 0.95 }
  },
  {
    n: '10',
    title: 'Peyzaj & Bahçe Bakımı',
    desc: 'Yeşil alan, çim saha ve dış mekân bakımını periyodik bir programla, tesis yönetiminden bağımsız da yürütebiliriz.',
    detail:
      'Peyzaj tek seferlik bir düzenleme değil, süregelen bir bakım işidir. Sulama, budama, çim biçimi ve mevsimlik dikim takvimini tesisin kullanım yoğunluğuna göre planlar; dış mekânın yıl boyunca aynı standardı korumasını sağlarız.',
    points: [
      'Çim biçimi ve sulama takvimi',
      'Ağaç, çalı ve mevsimlik bitki bakımı',
      'Dış mekân temizliği ve atık yönetimi',
      'Sezonluk peyzaj yenileme planı'
    ],
    meta: [
      { k: 'Kapsam', v: 'Yeşil alan & dış mekân' },
      { k: 'Periyot', v: 'Haftalık / aylık program' },
      { k: 'Model', v: 'Bağımsız veya entegre' }
    ],
    image: '/media/service-04.webp',
    canvas: { variant: 'facility', seed: 152, speed: 1, mirror: true }
  }
]

/**
 * How an engagement actually runs, start to finish.
 * Named `workflow`, not `process`: Nitro injects its own `process` binding into
 * the SSR bundle and a same-named export crashes the server at runtime.
 */
export const workflow = [
  {
    n: '01',
    title: 'Saha analizi',
    desc: 'Tesisi yerinde geziyor, kör noktaları ve mevcut kurulumun eksiklerini çıkarıyoruz.',
    out: 'Yazılı risk raporu'
  },
  {
    n: '02',
    title: 'Kurulum',
    desc: 'Kadro, vardiya çizelgesi ve teknoloji ihtiyacı sahaya özel olarak planlanıp devreye alınır.',
    out: 'Görev talimatları'
  },
  {
    n: '03',
    title: 'İşletme',
    desc: 'Ekip sahada, tüm noktalar komuta merkezinde. Olaylar zaman damgasıyla kayıt altına alınır.',
    out: '7/24 izleme'
  },
  {
    n: '04',
    title: 'Raporlama',
    desc: 'Devriye turu, olay kaydı ve müdahale süresi aylık rapora girer; gerekirse plan revize edilir.',
    out: 'Aylık KPI raporu'
  }
]

/** Legal basis and certification — the part procurement teams check first. */
export const compliance = [
  { k: '5188', v: 'Özel Güvenlik Hizmetlerine Dair Kanun kapsamında faaliyet izni' },
  { k: 'Sertifika', v: 'Tüm saha kadrosunda geçerli özel güvenlik kimlik kartı' },
  { k: 'Sigorta', v: 'Mesleki sorumluluk ve üçüncü şahıs mali mesuliyet poliçesi' },
  { k: 'KVKK', v: 'Kamera kayıtlarında aydınlatma metni ve saklama süresi uyumu' },
  { k: 'İSG', v: '6331 sayılı kanun kapsamında iş sağlığı ve güvenliği takibi' },
  { k: 'Denetim', v: 'Aylık iç denetim ve yıllık müşteri memnuniyet ölçümü' }
]

/** Questions that actually come up in the first meeting. */
export const faq = [
  {
    q: 'Kaç kişilik ekip gerekir?',
    a: 'Bu, tesisin giriş sayısı, vardiya ihtiyacı ve kapalı alan büyüklüğüyle belirlenir. Saha analizinden sonra minimum kadroyu ve gerekçesini yazılı olarak paylaşıyoruz — fazla personel önermiyoruz.'
  },
  {
    q: 'Mevcut kamera sistemimizi kullanabilir misiniz?',
    a: 'Çoğu durumda evet. Mevcut kurulumu inceleyip hangi kameraların komuta merkezine bağlanabileceğini, hangilerinin değişmesi gerektiğini ayrı ayrı raporluyoruz.'
  },
  {
    q: 'Sözleşme süresi ne kadar?',
    a: 'Standart sözleşme 12 aylıktır. İlk 2 ay karşılıklı deneme süresi olarak işler; bu sürede taraflardan biri 30 gün önceden bildirimle sözleşmeyi sonlandırabilir.'
  },
  {
    q: 'Personel değişimi ne sıklıkta oluyor?',
    a: 'Saha kadrosunu sabit tutmayı hedefliyoruz; devir olduğunda yeni görevli, eski görevliyle birlikte en az bir vardiya çalışarak sahayı devralır.'
  },
  {
    q: 'Olay yaşandığında süreç nasıl işliyor?',
    a: 'Görevli olayı komuta merkezine bildirir, merkez kamera üzerinden doğrular ve gerekirse mobil ekibi yönlendirir. Tüm adımlar zaman damgasıyla kayda geçer ve aynı gün tarafınıza iletilir.'
  },
  {
    q: 'Hangi şehirlerde hizmet veriyorsunuz?',
    a: 'Merkez operasyonumuz İstanbul’da. Türkiye genelinde 81 ilde saha kurma ve müdahale yetkinliğimiz var; şehir dışı sahalarda bölge sorumlusu atanır.'
  }
]

/**
 * Ekipler rol bazında tanıtılır: sahada çalışan birimler, kişi kartları değil.
 */
export const units = [
  {
    n: '01',
    title: 'Komuta Merkezi',
    role: 'İzleme & Yönlendirme',
    desc: 'Tüm sahaların canlı görüntüsü, alarm akışı ve vardiya planı bu odada birleşir.',
    image: '/media/unit-01.webp',
    stat: '7/24'
  },
  {
    n: '02',
    title: 'Saha Ekipleri',
    role: 'Devriye & Nokta',
    desc: 'Sertifikalı güvenlik görevlileri, amirler ve mobil devriye araçlarından oluşan çekirdek kadro.',
    image: '/media/unit-02.webp',
    stat: '1.240+'
  },
  {
    n: '03',
    title: 'Teknik Servis',
    role: 'Kurulum & Bakım',
    desc: 'Kamera, geçiş ve alarm altyapısını kuran, arıza anında sahaya inen mühendis ekibi.',
    image: '/media/unit-03.webp',
    stat: '9 dk'
  }
]

export const stats = [
  { value: 1240, suffix: '+', label: 'Sahada görevli personel', note: 'Sertifikalı kadro' },
  { value: 81, suffix: '', label: 'İlde operasyon yetkinliği', note: 'Türkiye geneli' },
  { value: 9, suffix: ' dk', label: 'Ortalama müdahale süresi', note: 'Komuta merkezi' },
  { value: 17, suffix: '', label: 'Yıllık saha tecrübesi', note: '2008’den beri' }
]

/** Front-of-site belt: the kinds of sites we run, not client names. */
export const clients = [
  'Şehir Hastaneleri',
  'Plaza & Rezidans',
  'Alışveriş Merkezleri',
  'Organize Sanayi',
  'Lojistik Merkezleri',
  'Kamu Kurumları',
  'Spor Tesisleri',
  'Veri Merkezleri'
]

/**
 * Institutional record. Deliberately understated and placed deep in the
 * references page — this reads as a credential for anyone who goes looking,
 * not as a logo wall on the homepage.
 */
export const institutions = [
  { name: 'Halk Bankası', note: 'Şube ve bölge tesisleri' },
  { name: 'Vakıfbank', note: 'Şube ve bölge tesisleri' },
  { name: 'Şehir Hastanesi — Ankara', note: 'Fiziki güvenlik' },
  { name: 'Eğitim & Araştırma Hastanesi', note: 'Fiziki güvenlik' },
  { name: 'Organize Sanayi Bölgesi', note: 'Çevre güvenliği' },
  { name: 'Belediye Tesisleri', note: 'Nokta görevlendirme' }
]
