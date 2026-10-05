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
  howItWorks: 'How a date here works',
  routing: 'Two or more dates in the region share the travel cost.',
  routingCity: 'Can be routed with',
  faq: 'What bookers here ask',
  video: 'See her play',
  bookHere: (place: string) => `Book a date in ${place}.`,
  checkAvail: 'Check availability',
  bookLede: 'Send the date and the room. You will have availability and an itemised quote within one business day.',
  lanes: 'What she is booked for here',
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
  source: 'Source',
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
  cityNameYours: 'Sua cidade não está na lista? Informe no formulário e diremos qual é o público dela aí.',
  howItWorks: 'Como funciona uma data aqui',
  routing: 'Duas ou mais datas na mesma região dividem o custo da viagem.',
  routingCity: 'Pode ser combinada com',
  faq: 'Perguntas frequentes',
  video: 'Veja ela tocar',
  bookHere: (place: string) => `Contrate uma data em ${place}.`,
  checkAvail: 'Verificar disponibilidade',
  bookLede: 'Envie a data e o local. Você recebe disponibilidade e um orçamento detalhado em até um dia útil.',
  lanes: 'Para que ela é contratada aqui',
  flights: 'Voos',
  direct: (code: string) => `Voo direto de Toronto (YYZ) para ${code}.`,
  connection: (code: string) => `De Toronto (YYZ) para ${code}, normalmente com uma conexão.`,
  authorisation: 'Documentação',
  authText: 'Por nossa conta. Conte com seis a oito semanas; alguns países são mais rápidos.',
  quote: 'O orçamento',
  quoteText: 'Detalhado: cachê, passagens, hospedagem e transporte local. Um custo total, sem surpresas.',
  backline: 'Equipamento',
  backlineText: 'O próprio setup de batalha dela, ou os CDJs do local. O rider técnico está na página de imprensa.',
  source: 'Fonte',
  f: {
    name: 'Seu nome', email: 'E-mail', type: 'Tipo de evento', select: 'Selecione', date: 'Data do evento',
    city: 'Cidade e país', guests: 'Número de convidados', budget: 'Orçamento para entretenimento', preferNot: 'Prefiro não dizer agora',
    heard: 'Como conheceu a DEEJAY T-JR.?', message: 'Conte sobre o evento',
    otherCities: 'Outras cidades nesta viagem?', otherCitiesHint: 'Para produtores com mais de uma data.',
    basedIn: 'Onde é o evento e onde você está?', basedInHint: 'Ex.: "Festa em São Paulo, estamos no Rio".',
    submit: 'Enviar pedido', sending: 'Enviando…', consent: 'Usamos estes dados apenas para responder ao seu pedido. Sem lista, sem newsletter.',
    sent: 'Enviado.', sentText: 'Você terá uma resposta em até um dia útil. Uma cópia do pedido está a caminho do seu e-mail.',
    direct: 'Contato direto', preferEmail: 'Prefere e-mail? Escreva para', include: 'O que incluir',
    inc: ['Data, ou o período que você está reservando', 'Cidade, local e número de convidados', 'Duração do set e se deseja um showcase de scratch', 'Se precisa que ela apresente ou faça o MC em parte da noite'],
    travel: 'Viagem', travelText: 'Baseada em Toronto, viajando de Toronto Pearson. Datas internacionais são rotina; inclua viagem e hospedagem no orçamento.',
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
  cityNameYours: 'Votre ville n’apparaît pas ? Indiquez-la dans le formulaire et nous vous dirons quel public elle y rassemble.',
  howItWorks: 'Comment se passe une date ici',
  routing: 'Deux dates ou plus dans la région partagent les frais de voyage.',
  routingCity: 'Peut être combinée avec',
  faq: 'Questions fréquentes',
  video: 'La voir jouer',
  bookHere: (place: string) => `Réserver une date à ${place}.`,
  checkAvail: 'Vérifier la disponibilité',
  bookLede: 'Envoyez la date et le lieu. Vous recevrez sa disponibilité et un devis détaillé sous un jour ouvré.',
  lanes: 'Pour quoi on la réserve ici',
  flights: 'Vols',
  direct: (code: string) => `Vol direct de Toronto (YYZ) vers ${code}.`,
  connection: (code: string) => `De Toronto (YYZ) vers ${code}, généralement avec une escale.`,
  authorisation: 'Autorisation de travail',
  authText: 'Prise en charge par nous. Prévoyez six à huit semaines ; certains pays sont plus rapides.',
  quote: 'Le devis',
  quoteText: 'Détaillé : cachet, vols, hébergement et transports sur place. Un coût total, sans surprise.',
  backline: 'Matériel',
  backlineText: 'Son propre setup de battle, ou les CDJ du lieu. La fiche technique est sur la page presse.',
  source: 'Source',
  f: {
    name: 'Votre nom', email: 'E-mail', type: 'Type d’événement', select: 'Choisir', date: 'Date de l’événement',
    city: 'Ville et pays', guests: 'Nombre d’invités', budget: 'Budget artistique', preferNot: 'Je préfère ne pas le dire pour l’instant',
    heard: 'Comment avez-vous connu DEEJAY T-JR. ?', message: 'Parlez-nous de l’événement',
    otherCities: 'D’autres villes sur ce voyage ?', otherCitiesHint: 'Pour les organisateurs avec plusieurs dates.',
    basedIn: 'Où a lieu l’événement, et où êtes-vous basé ?', basedInHint: 'Ex. : « Mariage à Lisbonne, nous vivons à Paris ».',
    submit: 'Envoyer la demande', sending: 'Envoi…', consent: 'Nous utilisons ces données uniquement pour répondre. Pas de liste, pas de newsletter.',
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
    club: { title: 'Clubes e festivais', body: 'Sets principais e showcases de scratch para produtores que querem um nome que o público já segue.' },
    corporate: { title: 'Eventos corporativos', body: 'Galas, conferências, lançamentos e premiações, seguindo o seu roteiro.' },
    private: { title: 'Eventos privados', body: 'Aniversários, casamentos e festas privadas, planejados com você.' },
    brand: { title: 'Ações de marca', body: 'Lançamentos, demonstrações e ativações, com uma DJ que uma marca de equipamentos escolheu destacar.' },
  },
  fr: {
    club: { title: 'Clubs et festivals', body: 'Sets en tête d’affiche et showcases scratch pour les organisateurs qui veulent un nom que leur public suit déjà.' },
    corporate: { title: 'Événements d’entreprise', body: 'Galas, conférences, lancements et remises de prix, selon votre déroulé.' },
    private: { title: 'Événements privés', body: 'Anniversaires, mariages et soirées privées, préparés avec vous.' },
    brand: { title: 'Activations de marque', body: 'Lancements, démonstrations et activations, avec une DJ qu’une marque de matériel a choisi de mettre en avant.' },
  },
};
