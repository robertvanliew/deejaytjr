import type { Locale } from '../lib/markets';

/**
 * Shared interface text. English is the source; Portuguese (pt-BR) and French
 * are DRAFTS awaiting a native reviewer, exactly like the market pages that
 * use them. They are only ever rendered on draft (noindex) pages until then.
 */
const en = {
  langName: 'English',
  draftBanner: '',
  // template headings
  audience: 'Her audience here',
  cities: 'Cities',
  cityNameYours: 'Not listed? Name your city in the form and we will tell you what she draws there.',
  howItWorks: (_inCountry: string) => 'How a date here works',
  routing: 'Two or more dates in the region share the travel cost.',
  routingCity: 'Can be routed with',
  faq: 'What bookers here ask',
  video: 'See her play',
  bookHere: (inPlace: string) => `Book a date ${inPlace}.`,
  checkAvail: 'Check availability',
  bookLede: 'Send the date and the room. You will have availability and an itemised quote within one business day.',
  lanes: (_inPlace: string) => 'What she is booked for here',
  // travel facts
  flights: 'Flights',
  direct: (code: string) => `Direct from Toronto Pearson (YYZ) to ${code}.`,
  connection: (code: string) => `From Toronto Pearson (YYZ) to ${code}, usually with one connection.`,
  authorisation: 'Work authorisation',
  authText: 'Handled by us. Allow six to eight weeks; some markets are faster.',
  quote: 'The quote',
  quoteText: 'Itemised: performance fee, flights, accommodation and ground transport. One landed cost, no surprises.',
  backline: 'Equipment',
  backlineText: 'Her own battle setup, or the venue’s CDJs. The technical rider is on the press page.',
  source: 'Source:',
  // form
  f: {
    name: 'Your name', email: 'Email', type: 'Event type', select: 'Select one', date: 'Event date',
    city: 'City and country', guests: 'Guest count', budget: 'Entertainment budget', preferNot: 'Prefer not to say yet',
    heard: 'How did you hear about DEEJAY T-JR.?', message: 'Tell us about the event',
    otherCities: 'Other cities on this trip?', otherCitiesHint: 'For promoters routing more than one date.',
    basedIn: 'Where is the event, and where are you based?', basedInHint: 'e.g. "Wedding in Tulum, we live in Toronto".',
    submit: 'Send booking request', sending: 'Sending…', consent: 'We only use this to answer your enquiry. No list, no newsletter.',
    sent: 'Sent.', sentText: 'You’ll hear from us within one business day. A copy of your request is on its way to your inbox.',
    direct: 'Direct', preferEmail: 'Prefer email? Reach us at', include: 'What to include',
    inc: ['Date, or a range of dates you are holding', 'City, venue and expected guest count', 'Set length and whether you want a scratch showcase', 'Whether you need her to host or MC any part of the night'],
    travel: 'Travel', travelText: 'Based in Toronto, travelling from Toronto Pearson. International dates are routine; allow travel and accommodation in the budget.',
    fail: 'Something went wrong sending that. Please email',
    errors: {} as Record<string, string>,
  },
};

type Dict = typeof en;

const ptbr: Dict = {
  langName: 'Português',
  draftBanner: 'Rascunho para revisão: não publicado. Texto em português aguardando revisão de um falante nativo.',
  audience: 'O público dela aqui',
  cities: 'Cidades',
  cityNameYours: 'Sua cidade não está na lista? Informe no formulário e mostramos quanto público ela tem aí.',
  howItWorks: (_inCountry: string) => 'Como funciona uma data aqui',
  routing: 'Duas ou mais datas na mesma região dividem o custo da viagem.',
  routingCity: 'Pode ser combinada com',
  faq: 'Perguntas frequentes',
  video: 'Veja a DJ em ação',
  bookHere: (inPlace: string) => `Contrate uma data ${inPlace}.`,
  checkAvail: 'Verificar disponibilidade',
  bookLede: 'Envie a data e o local. Você recebe disponibilidade e um orçamento detalhado em até um dia útil.',
  lanes: (_inPlace: string) => 'Formatos mais contratados',
  flights: 'Voos',
  direct: (code: string) => `Voo direto de Toronto (YYZ) para ${code}.`,
  connection: (code: string) => `De Toronto (YYZ) para ${code}, normalmente com uma conexão.`,
  authorisation: 'Documentação',
  authText: 'Por nossa conta. Conte com seis a oito semanas de antecedência.',
  quote: 'O orçamento',
  quoteText: 'Detalhado: cachê, passagens, hospedagem e transporte local. Um custo total, sem surpresas.',
  backline: 'Equipamento',
  backlineText: 'Ela leva o próprio setup de batalha ou usa os CDJs da casa. O rider técnico está na página de imprensa.',
  source: 'Fonte:',
  f: {
    name: 'Seu nome', email: 'E-mail', type: 'Tipo de evento', select: 'Selecione', date: 'Data do evento',
    city: 'Cidade e país', guests: 'Número de convidados', budget: 'Orçamento para entretenimento', preferNot: 'Prefiro não dizer agora',
    heard: 'Como conheceu a DEEJAY T-JR.?', message: 'Conte sobre o evento',
    otherCities: 'Outras cidades na mesma viagem?', otherCitiesHint: 'Para produtores com mais de uma data.',
    basedIn: 'Onde é o evento e onde você está?', basedInHint: 'Ex.: "Festa em São Paulo, estamos no Rio".',
    submit: 'Enviar pedido', sending: 'Enviando…', consent: 'Usamos estes dados apenas para responder ao seu pedido. Sem lista, sem newsletter.',
    sent: 'Enviado.', sentText: 'Você terá uma resposta em até um dia útil. Uma cópia do pedido está a caminho do seu e-mail.',
    direct: 'Contato direto', preferEmail: 'Prefere e-mail? Escreva para', include: 'O que incluir',
    inc: ['A data, ou o período que você está considerando', 'Cidade, local e número de convidados', 'Duração do set e se deseja um showcase de scratch', 'Se ela também deve apresentar ou atuar como MC em parte da noite'],
    travel: 'Viagem', travelText: 'Baseada em Toronto, com voos a partir de Toronto Pearson. Datas internacionais fazem parte da rotina; inclua passagens e hospedagem no orçamento.',
    fail: 'Algo deu errado no envio. Por favor, escreva para',
    errors: {
      name: 'Informe seu nome para sabermos quem está perguntando.',
      email: 'Informe um e-mail para podermos responder.',
      eventType: 'Escolha o tipo de evento.',
      eventDate: 'Informe uma data futura, ou deixe em branco.',
      message: 'Texto longo demais. Resuma e envie os detalhes por e-mail.',
    },
  },
};

const fr: Dict = {
  langName: 'Français',
  draftBanner: 'Brouillon en relecture : non publié. Texte français en attente de relecture par un locuteur natif.',
  audience: 'Son public ici',
  cities: 'Villes',
  cityNameYours: 'Votre ville n’apparaît pas ? Indiquez-la dans le formulaire et nous vous dirons quel public elle y touche.',
  howItWorks: (inCountry: string) => `Comment se déroule une date ${inCountry}`,
  routing: 'Deux dates ou plus dans la région partagent les frais de voyage.',
  routingCity: 'Peut être combinée avec',
  faq: 'Questions fréquentes',
  video: 'La voir jouer',
  bookHere: (inPlace: string) => `Réserver une date ${inPlace}.`,
  checkAvail: 'Vérifier la disponibilité',
  bookLede: 'Envoyez la date et le lieu. Vous recevrez sa disponibilité et un devis détaillé sous un jour ouvré.',
  lanes: (inPlace: string) => `Formats proposés ${inPlace}`,
  flights: 'Vols',
  direct: (code: string) => `Vol direct de Toronto (YYZ) vers ${code}.`,
  connection: (code: string) => `De Toronto (YYZ) vers ${code}, généralement avec une escale.`,
  authorisation: 'Autorisation de travail',
  authText: 'Nous nous en chargeons. Prévoyez six à huit semaines.',
  quote: 'Le devis',
  quoteText: 'Détaillé : cachet, vols, hébergement et transports sur place. Un coût total, sans surprise.',
  backline: 'Matériel',
  backlineText: 'Elle vient avec son setup de battle ou joue sur les CDJ du lieu. La fiche technique est sur la page presse.',
  source: 'Source :',
  f: {
    name: 'Votre nom', email: 'E-mail', type: 'Type d’événement', select: 'Choisir', date: 'Date de l’événement',
    city: 'Ville et pays', guests: 'Nombre d’invités', budget: 'Budget artistique', preferNot: 'Je préfère ne pas le dire pour l’instant',
    heard: 'Comment avez-vous connu DEEJAY T-JR. ?', message: 'Parlez-nous de l’événement',
    otherCities: 'D’autres dates sur le même déplacement ?', otherCitiesHint: 'Pour les organisateurs avec plusieurs dates.',
    basedIn: 'Où a lieu l’événement, et d’où nous écrivez-vous ?', basedInHint: 'Ex. : « Mariage à Lisbonne, nous vivons à Paris ».',
    submit: 'Envoyer la demande', sending: 'Envoi…', consent: 'Nous utilisons ces données uniquement pour vous répondre. Pas de liste, pas de newsletter.',
    sent: 'Envoyé.', sentText: 'Vous aurez une réponse sous un jour ouvré. Une copie de votre demande arrive dans votre boîte mail.',
    direct: 'Contact direct', preferEmail: 'Vous préférez l’e-mail ? Écrivez à', include: 'À préciser',
    inc: ['La date, ou la période que vous bloquez', 'Ville, lieu et nombre d’invités', 'Durée du set et si vous souhaitez un showcase scratch', 'Si elle doit animer ou faire le MC sur une partie de la soirée'],
    travel: 'Voyage', travelText: 'Basée à Toronto, au départ de Toronto Pearson. Les dates à l’international sont courantes ; prévoyez le voyage et l’hébergement dans le budget.',
    fail: 'L’envoi a échoué. Merci d’écrire à',
    errors: {
      name: 'Indiquez votre nom pour que nous sachions qui écrit.',
      email: 'Indiquez une adresse e-mail pour que nous puissions répondre.',
      eventType: 'Choisissez le type d’événement.',
      eventDate: 'Indiquez une date à venir, ou laissez vide.',
      message: 'C’est trop long. Résumez et envoyez le détail par e-mail.',
    },
  },
};

export const UI: Record<Locale, Dict> = { en, 'pt-br': ptbr, fr };
export const t = (locale: Locale) => UI[locale];

/** Event-type labels per locale; values stay the same so the server is unchanged. */
export const EVENT_LABELS: Record<Locale, Record<string, string>> = {
  en: { corporate: 'Corporate event', private: 'Private event', club: 'Club or festival', brand: 'Brand partnership or showcase', other: 'Other' },
  'pt-br': { corporate: 'Evento corporativo', private: 'Evento privado', club: 'Clube ou festival', brand: 'Parceria ou ação de marca', other: 'Outro' },
  fr: { corporate: 'Événement d’entreprise', private: 'Événement privé', club: 'Club ou festival', brand: 'Partenariat ou activation de marque', other: 'Autre' },
};

/** Booking lanes shown on city pages. */
export const LANE_TEXT: Record<Locale, Record<string, { title: string; body: string }>> = {
  en: {
    club: { title: 'Club nights and festivals', body: 'Headline sets and scratch showcases for promoters who want a name their crowd already follows.' },
    corporate: { title: 'Corporate events', body: 'Galas, conferences, launches and award nights, worked to your run of show.' },
    private: { title: 'Private events', body: 'Milestone birthdays, weddings and private parties, planned with you in advance.' },
    brand: { title: 'Brand activations', body: 'Launches, product demos and activations, from a DJ a gear brand chose to feature.' },
  },
  'pt-br': {
    club: { title: 'Clubes e festivais', body: 'Sets como atração principal e showcases de scratch para produtores que querem um nome que o público já segue.' },
    corporate: { title: 'Eventos corporativos', body: 'Galas, conferências, lançamentos e premiações, seguindo o seu roteiro.' },
    private: { title: 'Eventos privados', body: 'Aniversários, casamentos e festas privadas, planejados com você.' },
    brand: { title: 'Ações de marca', body: 'Lançamentos, demonstrações e ativações, com uma DJ que já se apresentou no estande da Pioneer DJ na NAMM.' },
  },
  fr: {
    club: { title: 'Clubs et festivals', body: 'Sets en tête d’affiche et showcases scratch pour les organisateurs qui veulent un nom que leur public suit déjà.' },
    corporate: { title: 'Événements d’entreprise', body: 'Galas, conférences, lancements et remises de prix, selon votre déroulé.' },
    private: { title: 'Événements privés', body: 'Anniversaires, mariages et soirées privées, préparés avec vous.' },
    brand: { title: 'Activations de marque', body: 'Lancements, démonstrations et activations, avec une DJ qui s’est produite sur le stand Pioneer DJ au NAMM.' },
  },
};

/**
 * Site chrome (nav, footer, video tiles) per locale. The links still lead to
 * the English pages, since those are the only versions that exist; only the
 * labels change, so a Portuguese or French visitor is not dropped into an
 * English frame around a translated page. Drafts, like the rest of this file.
 */
type Chrome = {
  nav: Record<string, string>;
  cta: string;
  openMenu: string;
  blurb: (city: string) => string;
  cols: { book: string; about: string; intl: string; listen: string };
  links: Record<string, string>;
  allMarkets: string;
  listenBandcamp: string;
  merch: string;
  follow: string;
  rights: string;
  privacy: string;
  terms: string;
  designBy: string;
  play: (title: string) => string;
  playExpanded: (title: string) => string;
  videoBy: string;
  watchYt: string;
};

export const CHROME: Record<Locale, Chrome> = {
  en: {
    nav: {},
    cta: 'Check availability',
    openMenu: 'Open menu',
    blurb: (city) => `Three-time DMC Canadian Champion. Based in ${city}, available worldwide for corporate, private, club, festival and brand bookings.`,
    cols: { book: 'Book', about: 'About', intl: 'International', listen: 'Listen and support' },
    links: {},
    allMarkets: 'All markets',
    listenBandcamp: 'Listen on Bandcamp',
    merch: 'Merch on Bandcamp',
    follow: 'Follow',
    rights: 'All rights reserved.',
    privacy: 'Privacy',
    terms: 'Terms',
    designBy: 'Design by',
    play: (t) => `Play video: ${t}`,
    playExpanded: (t) => `Play video: ${t} (opens expanded)`,
    videoBy: 'Video by',
    watchYt: 'Watch on YouTube',
  },
  'pt-br': {
    nav: {
      '/corporate-events': 'Corporativo',
      '/private-events': 'Privado',
      '/international': 'Internacional',
      '/brand-partnerships': 'Marcas',
      '/music': 'Ouvir',
      '/about': 'A história',
      '/press': 'Imprensa',
      '/media-kit': 'Mídia kit',
    },
    cta: 'Verificar disponibilidade',
    openMenu: 'Abrir menu',
    blurb: (city) => `Tricampeã canadense do DMC. Baseada em ${city}, disponível no mundo todo para eventos corporativos, privados, clubes, festivais e marcas.`,
    cols: { book: 'Contratar', about: 'Sobre', intl: 'Internacional', listen: 'Ouvir e apoiar' },
    links: {
      '/corporate-events': 'Eventos corporativos',
      '/private-events': 'Eventos privados',
      '/clubs-and-festivals': 'Clubes e festivais',
      '/brand-partnerships': 'Parcerias com marcas',
      '/contact': 'Verificar disponibilidade',
      '/about': 'A história',
      '/press': 'Imprensa e EPK',
      '/media-kit': 'Mídia kit',
      '/latest': 'Novidades',
      '/watch': 'Vídeos',
      '/destination-events': 'Eventos no exterior',
      '/music': 'Ouvir',
    },
    allMarkets: 'Todos os mercados',
    listenBandcamp: 'Ouvir no Bandcamp',
    merch: 'Produtos no Bandcamp',
    follow: 'Siga',
    rights: 'Todos os direitos reservados.',
    privacy: 'Privacidade',
    terms: 'Termos',
    designBy: 'Design por',
    play: (t) => `Assistir ao vídeo: ${t}`,
    playExpanded: (t) => `Assistir ao vídeo: ${t} (abre ampliado)`,
    videoBy: 'Vídeo de',
    watchYt: 'Assistir no YouTube',
  },
  fr: {
    nav: {
      '/corporate-events': 'Entreprises',
      '/private-events': 'Privé',
      '/international': 'International',
      '/brand-partnerships': 'Marques',
      '/music': 'Écouter',
      '/about': 'Son histoire',
      '/press': 'Presse',
      '/media-kit': 'Kit média',
    },
    cta: 'Vérifier la disponibilité',
    openMenu: 'Ouvrir le menu',
    blurb: (city) => `Triple championne DMC du Canada. Basée à ${city}, disponible dans le monde entier pour les événements d’entreprise, privés, clubs, festivals et marques.`,
    cols: { book: 'Réserver', about: 'À propos', intl: 'International', listen: 'Écouter et soutenir' },
    links: {
      '/corporate-events': 'Événements d’entreprise',
      '/private-events': 'Événements privés',
      '/clubs-and-festivals': 'Clubs et festivals',
      '/brand-partnerships': 'Partenariats de marque',
      '/contact': 'Vérifier la disponibilité',
      '/about': 'Son histoire',
      '/press': 'Presse et EPK',
      '/media-kit': 'Kit média',
      '/latest': 'Actualités',
      '/watch': 'Vidéos',
      '/destination-events': 'Événements à l’étranger',
      '/music': 'Écouter',
    },
    allMarkets: 'Tous les marchés',
    listenBandcamp: 'Écouter sur Bandcamp',
    merch: 'Boutique sur Bandcamp',
    follow: 'Suivre',
    rights: 'Tous droits réservés.',
    privacy: 'Confidentialité',
    terms: 'Conditions',
    designBy: 'Design par',
    play: (t) => `Lire la vidéo : ${t}`,
    playExpanded: (t) => `Lire la vidéo : ${t} (s’ouvre en grand)`,
    videoBy: 'Vidéo :',
    watchYt: 'Voir sur YouTube',
  },
};

/**
 * Budget options. The option VALUE stays the English string (what the lead
 * email and the sheet show); only the visible label is localised:
 * "US$ 5.000 a US$ 7.500" in pt-BR, "5 000 à 7 500 USD" in French.
 */
export function budgetLabel(locale: Locale, currency: 'CAD' | 'USD', lo: number, hi: number | null): string {
  if (locale === 'pt-br') {
    const n = (x: number) => x.toLocaleString('pt-BR');
    const sym = currency === 'USD' ? 'US$' : 'C$';
    return hi ? `${sym} ${n(lo)} a ${sym} ${n(hi)}` : `Acima de ${sym} ${n(lo)}`;
  }
  if (locale === 'fr') {
    /* Thousands separated by a narrow no-break space (U+202F), the French standard. */
    const n = (x: number) => x.toLocaleString('fr-FR').replace(/[\u202f\u00a0 ]/g, '\u202f');
    return hi ? `${n(lo)} à ${n(hi)} ${currency}` : `${n(lo)} ${currency} et plus`;
  }
  const n = (x: number) => `$${x.toLocaleString('en-US')}`;
  return hi ? `${n(lo)} to ${n(hi)} ${currency}` : `${n(lo)} ${currency} and up`;
}
