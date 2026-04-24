import type { Metadata } from 'next'
import Link from 'next/link'
import Image from 'next/image'
import { GoogleTranslate } from '@/components/parent/google-translate'
import { LanguageBlocks } from '@/components/parent/language-blocks'

export const metadata: Metadata = {
  title: 'Welcome -- information for parents in your language',
  description:
    'A short summary of Pathfinder Scotland for parents and guardians, in 29 languages. University is free for Scottish students; bursaries and grants help with living costs.',
  alternates: { canonical: '/parent/welcome' },
}

// NOTE: All non-English translations below are MACHINE-GENERATED drafts.
// Every block carries needs_verification: true and must be reviewed by a
// native speaker before launch. Scottish education terms (Highers, UCAS,
// SAAS, guidance teacher) translate poorly and are deliberately kept as
// English with a parenthetical note in most blocks.
//
// Scottish Gaelic: cross-check against Faclair Beag (faclair.com) where
// possible. Scots: uses accessible vocabulary, not dense literary Scots.

type LanguageBlock = {
  languageName: string           // In English
  languageNameNative: string     // In the target language
  bcp47: string                  // lang attribute
  dir: 'ltr' | 'rtl'
  fontFamily?: string
  text: string
  flag?: string                  // Flag emoji (omitted where ambiguous)
  needs_verification: true
}

const BLOCKS: LanguageBlock[] = [
  {
    languageName: 'Scottish Gaelic',
    languageNameNative: 'Gàidhlig',
    bcp47: 'gd',
    dir: 'ltr',
    flag: '🏴󠁧󠁢󠁳󠁣󠁴󠁿',
    text: `Fàilte gu Pathfinder Alba. Tha Pathfinder na làrach-lìn a tha a' cuideachadh do phàiste gus cuspairean sgoile a thaghadh agus an cùrsa oilthigh no colaiste ceart a lorg airson an ama ri teachd. Tha oilthigh an-asgaidh do dh'oileanaich Albannach a tha a' fuireach ann an Alba. Chan eil agaibh ri phàigheadh airson cosgaisean teagaisg. Tha taic airgid (bursary agus grant) ri fhaighinn airson cosgaisean beòshlaint, an urra ri teachd-a-steach an teaghlaich agaibh. Tha tidsear stiùiridh (guidance teacher) anns gach sgoil a bheir taic do phàiste. Tadhlaibh air pathfinderscot.co.uk/parent/join gus cunntas pàrant an-asgaidh a chruthachadh agus adhartas do phàiste a lèirmheas.`,
    needs_verification: true,
  },
  {
    languageName: 'Scots',
    languageNameNative: 'Scots',
    bcp47: 'sco',
    dir: 'ltr',
    flag: '🏴󠁧󠁢󠁳󠁣󠁴󠁿',
    text: `Walcome tae Pathfinder Scotland. Pathfinder is a wabsite that helps yer bairn pick schuil subjects an find the richt university or college coorse for their future. University is free for Scottish students that bide in Scotland. Yer bairn disnae pey tuition fees. Bursaries an grants are there tae help wi livin costs, dependin on yer faimily income an hame situation. Ilka schuil has a guidance teacher wha can help yer bairn plan their subjects an apply tae university or college. Gang tae pathfinderscot.co.uk/parent/join tae mak a free parent accoont an see hou yer bairn is gettin on.`,
    needs_verification: true,
  },
  {
    languageName: 'Polish',
    languageNameNative: 'Polski',
    bcp47: 'pl',
    dir: 'ltr',
    flag: '🇵🇱',
    text: `Witamy w Pathfinder Scotland. Pathfinder to strona internetowa, która pomaga Państwa dziecku wybrać przedmioty szkolne i znaleźć odpowiedni kierunek studiów na uniwersytecie lub w college'u. Studia są bezpłatne dla szkockich studentów mieszkających w Szkocji. Państwa dziecko nie płaci czesnego. Dostępne są stypendia i granty na pokrycie kosztów utrzymania. Kwota zależy od dochodu rodziny i sytuacji mieszkaniowej. Każda szkoła ma doradcę (guidance teacher), który może pomóc dziecku zaplanować przedmioty i złożyć podania. Odwiedź stronę pathfinderscot.co.uk/parent/join, aby utworzyć bezpłatne konto rodzica i śledzić postępy dziecka.`,
    needs_verification: true,
  },
  {
    languageName: 'Romanian',
    languageNameNative: 'Română',
    bcp47: 'ro',
    dir: 'ltr',
    flag: '🇷🇴',
    text: `Bun venit la Pathfinder Scotland. Pathfinder este un site web care ajută copilul dumneavoastră să aleagă materiile școlare și să găsească cursul universitar sau de colegiu potrivit pentru viitorul său. Universitatea este gratuită pentru studenții scoțieni care locuiesc în Scoția. Copilul dumneavoastră nu plătește taxe de școlarizare. Există burse și ajutoare financiare pentru cheltuielile de trai, în funcție de venitul familiei și situația dumneavoastră. Fiecare școală are un profesor consilier (guidance teacher) care poate ajuta copilul să își planifice materiile și să aplice la universitate sau colegiu. Vizitați pathfinderscot.co.uk/parent/join pentru a crea un cont gratuit de părinte.`,
    needs_verification: true,
  },
  {
    languageName: 'Lithuanian',
    languageNameNative: 'Lietuvių',
    bcp47: 'lt',
    dir: 'ltr',
    flag: '🇱🇹',
    text: `Sveiki atvykę į Pathfinder Scotland. Pathfinder yra svetainė, padedanti jūsų vaikui pasirinkti mokyklinius dalykus ir surasti tinkamą universiteto ar koledžo kursą ateičiai. Universiteto studijos yra nemokamos Škotijos studentams, gyvenantiems Škotijoje. Jūsų vaikas nemoka už mokslą. Yra stipendijų ir pašalpų pragyvenimo išlaidoms padengti. Suma priklauso nuo šeimos pajamų ir gyvenimo sąlygų. Kiekvienoje mokykloje yra mokytojas patarėjas (guidance teacher), kuris gali padėti jūsų vaikui planuoti dalykus ir teikti paraiškas. Apsilankykite pathfinderscot.co.uk/parent/join, kad sukurtumėte nemokamą tėvų paskyrą.`,
    needs_verification: true,
  },
  {
    languageName: 'Italian',
    languageNameNative: 'Italiano',
    bcp47: 'it',
    dir: 'ltr',
    flag: '🇮🇹',
    text: `Benvenuti in Pathfinder Scotland. Pathfinder è un sito web che aiuta vostro figlio a scegliere le materie scolastiche e a trovare il corso universitario o di college adatto al suo futuro. L'università è gratuita per gli studenti scozzesi residenti in Scozia. Vostro figlio non paga tasse universitarie. Sono disponibili borse di studio e sussidi per le spese di vita, in base al reddito familiare e alla vostra situazione. Ogni scuola ha un insegnante di orientamento (guidance teacher) che può aiutare vostro figlio a pianificare le materie e a fare domanda. Visitate pathfinderscot.co.uk/parent/join per creare un account genitore gratuito.`,
    needs_verification: true,
  },
  {
    languageName: 'Spanish',
    languageNameNative: 'Español',
    bcp47: 'es',
    dir: 'ltr',
    flag: '🇪🇸',
    text: `Bienvenido a Pathfinder Scotland. Pathfinder es un sitio web que ayuda a su hijo a elegir las asignaturas escolares y a encontrar el curso universitario o de college adecuado para su futuro. La universidad es gratuita para los estudiantes escoceses que viven en Escocia. Su hijo no paga matrícula. Hay becas y ayudas disponibles para los gastos de manutención, según los ingresos familiares y su situación. Cada escuela tiene un profesor orientador (guidance teacher) que puede ayudar a su hijo a planificar sus asignaturas y a solicitar plaza. Visite pathfinderscot.co.uk/parent/join para crear una cuenta de padre o madre gratuita.`,
    needs_verification: true,
  },
  {
    languageName: 'French',
    languageNameNative: 'Français',
    bcp47: 'fr',
    dir: 'ltr',
    flag: '🇫🇷',
    text: `Bienvenue sur Pathfinder Scotland. Pathfinder est un site web qui aide votre enfant à choisir ses matières scolaires et à trouver le cours universitaire ou de college adapté à son avenir. L'université est gratuite pour les étudiants écossais qui vivent en Écosse. Votre enfant ne paie pas de frais de scolarité. Des bourses et des aides financières sont disponibles pour les frais de vie, selon les revenus de la famille et votre situation. Chaque école a un conseiller d'orientation (guidance teacher) qui peut aider votre enfant à planifier ses matières et à postuler. Visitez pathfinderscot.co.uk/parent/join pour créer un compte parent gratuit.`,
    needs_verification: true,
  },
  {
    languageName: 'Portuguese',
    languageNameNative: 'Português',
    bcp47: 'pt',
    dir: 'ltr',
    flag: '🇵🇹',
    text: `Bem-vindo ao Pathfinder Scotland. Pathfinder é um site que ajuda o seu filho a escolher as disciplinas escolares e a encontrar o curso universitário ou de college certo para o seu futuro. A universidade é gratuita para estudantes escoceses que vivem na Escócia. O seu filho não paga propinas. Há bolsas e apoios disponíveis para os custos de vida, com base no rendimento familiar e na sua situação. Cada escola tem um professor orientador (guidance teacher) que pode ajudar o seu filho a planear as disciplinas e a candidatar-se. Visite pathfinderscot.co.uk/parent/join para criar uma conta de pai/mãe gratuita.`,
    needs_verification: true,
  },
  {
    languageName: 'Latvian',
    languageNameNative: 'Latviešu',
    bcp47: 'lv',
    dir: 'ltr',
    flag: '🇱🇻',
    text: `Laipni lūdzam Pathfinder Scotland. Pathfinder ir tīmekļa vietne, kas palīdz jūsu bērnam izvēlēties skolas priekšmetus un atrast piemērotu universitātes vai koledžas kursu nākotnei. Universitāte ir bez maksas Skotijas studentiem, kas dzīvo Skotijā. Jūsu bērnam nav jāmaksā mācību maksa. Ir pieejamas stipendijas un pabalsti dzīves izmaksu segšanai, atkarībā no ģimenes ienākumiem un jūsu situācijas. Katrā skolā ir skolotājs konsultants (guidance teacher), kas var palīdzēt jūsu bērnam plānot priekšmetus un pieteikties. Apmeklējiet pathfinderscot.co.uk/parent/join, lai izveidotu bezmaksas vecāku kontu.`,
    needs_verification: true,
  },
  {
    languageName: 'Bulgarian',
    languageNameNative: 'Български',
    bcp47: 'bg',
    dir: 'ltr',
    flag: '🇧🇬',
    text: `Добре дошли в Pathfinder Scotland. Pathfinder е уебсайт, който помага на вашето дете да избере училищните предмети и да намери подходящ университетски или колежански курс за своето бъдеще. Университетът е безплатен за шотландски студенти, живеещи в Шотландия. Вашето дете не плаща такси за обучение. Налични са стипендии и помощи за разходи за живот, в зависимост от семейния доход и вашето положение. Всяко училище има учител-консултант (guidance teacher), който може да помогне на детето ви да планира предметите и да кандидатства. Посетете pathfinderscot.co.uk/parent/join, за да създадете безплатен родителски акаунт.`,
    needs_verification: true,
  },
  {
    languageName: 'Czech',
    languageNameNative: 'Čeština',
    bcp47: 'cs',
    dir: 'ltr',
    flag: '🇨🇿',
    text: `Vítejte v Pathfinder Scotland. Pathfinder je webová stránka, která pomáhá vašemu dítěti vybrat si školní předměty a najít správný univerzitní nebo college kurz pro jeho budoucnost. Univerzita je zdarma pro skotské studenty žijící ve Skotsku. Vaše dítě neplatí školné. Jsou k dispozici stipendia a podpora na životní náklady, podle rodinného příjmu a vaší situace. Každá škola má poradce (guidance teacher), který může pomoci vašemu dítěti naplánovat předměty a podat přihlášku. Navštivte pathfinderscot.co.uk/parent/join a vytvořte si bezplatný rodičovský účet.`,
    needs_verification: true,
  },
  {
    languageName: 'Slovak',
    languageNameNative: 'Slovenčina',
    bcp47: 'sk',
    dir: 'ltr',
    flag: '🇸🇰',
    text: `Vitajte v Pathfinder Scotland. Pathfinder je webová stránka, ktorá pomáha vášmu dieťaťu vybrať si školské predmety a nájsť správny univerzitný alebo college kurz pre jeho budúcnosť. Univerzita je bezplatná pre škótskych študentov žijúcich v Škótsku. Vaše dieťa neplatí školné. K dispozícii sú štipendiá a podpora na životné náklady, podľa rodinného príjmu a vašej situácie. Každá škola má poradcu (guidance teacher), ktorý môže pomôcť vášmu dieťaťu naplánovať predmety a podať prihlášku. Navštívte pathfinderscot.co.uk/parent/join a vytvorte si bezplatný rodičovský účet.`,
    needs_verification: true,
  },
  {
    languageName: 'Russian',
    languageNameNative: 'Русский',
    bcp47: 'ru',
    dir: 'ltr',
    flag: '🇷🇺',
    text: `Добро пожаловать на Pathfinder Scotland. Pathfinder — это сайт, который помогает вашему ребёнку выбрать школьные предметы и найти подходящий университетский или колледжский курс. Университет бесплатный для шотландских студентов, живущих в Шотландии. Ваш ребёнок не платит за обучение. Доступны стипендии и пособия на расходы на проживание, в зависимости от дохода семьи и вашей ситуации. В каждой школе есть учитель-консультант (guidance teacher), который может помочь вашему ребёнку спланировать предметы и подать заявление. Посетите pathfinderscot.co.uk/parent/join, чтобы создать бесплатный родительский аккаунт.`,
    needs_verification: true,
  },
  {
    languageName: 'Ukrainian',
    languageNameNative: 'Українська',
    bcp47: 'uk',
    dir: 'ltr',
    flag: '🇺🇦',
    text: `Ласкаво просимо до Pathfinder Scotland. Pathfinder — це вебсайт, який допомагає вашій дитині обрати шкільні предмети та знайти відповідний університетський чи коледжний курс. Університет безкоштовний для шотландських студентів, які живуть у Шотландії. Ваша дитина не платить за навчання. Доступні стипендії та допомога на витрати на проживання, залежно від доходу сім'ї та вашої ситуації. У кожній школі є вчитель-консультант (guidance teacher), який може допомогти вашій дитині спланувати предмети та подати заяву. Відвідайте pathfinderscot.co.uk/parent/join, щоб створити безкоштовний батьківський обліковий запис.`,
    needs_verification: true,
  },
  {
    languageName: 'Hungarian',
    languageNameNative: 'Magyar',
    bcp47: 'hu',
    dir: 'ltr',
    flag: '🇭🇺',
    text: `Üdvözöljük a Pathfinder Scotland oldalán. A Pathfinder egy weboldal, amely segít gyermekének kiválasztani az iskolai tantárgyakat és megtalálni a megfelelő egyetemi vagy college kurzust. Az egyetem ingyenes a Skóciában élő skót diákok számára. Gyermeke nem fizet tandíjat. Ösztöndíjak és támogatások állnak rendelkezésre a megélhetési költségekre, a családi jövedelem és a helyzetük alapján. Minden iskolában van pályaválasztási tanácsadó (guidance teacher), aki segíthet gyermekének megtervezni a tantárgyakat és jelentkezni. Látogasson el a pathfinderscot.co.uk/parent/join oldalra, hogy ingyenes szülői fiókot hozzon létre.`,
    needs_verification: true,
  },
  {
    languageName: 'Urdu',
    languageNameNative: 'اردو',
    bcp47: 'ur',
    dir: 'rtl',
    flag: '🇵🇰',
    fontFamily: '"Noto Nastaliq Urdu", "Jameel Noori Nastaleeq", serif',
    text: `پاتھ فائنڈر سکاٹ لینڈ میں خوش آمدید۔ پاتھ فائنڈر ایک ویب سائٹ ہے جو آپ کے بچے کو اسکول کے مضامین منتخب کرنے اور اس کے مستقبل کے لیے مناسب یونیورسٹی یا کالج کورس تلاش کرنے میں مدد دیتی ہے۔ اسکاٹ لینڈ میں رہنے والے اسکاٹش طلباء کے لیے یونیورسٹی مفت ہے۔ آپ کا بچہ تعلیمی فیس ادا نہیں کرتا۔ زندگی کے اخراجات کے لیے وظائف اور گرانٹس دستیاب ہیں، جو آپ کی خاندانی آمدنی اور صورتحال پر منحصر ہیں۔ ہر اسکول میں ایک رہنمائی استاد (guidance teacher) ہوتا ہے جو آپ کے بچے کی مدد کر سکتا ہے۔ مفت والدین اکاؤنٹ بنانے کے لیے pathfinderscot.co.uk/parent/join پر جائیں۔`,
    needs_verification: true,
  },
  {
    languageName: 'Punjabi (Gurmukhi)',
    languageNameNative: 'ਪੰਜਾਬੀ',
    bcp47: 'pa',
    dir: 'ltr',
    flag: '🇮🇳',
    text: `ਪਾਥਫਾਈਂਡਰ ਸਕਾਟਲੈਂਡ ਵਿੱਚ ਜੀ ਆਇਆਂ ਨੂੰ। ਪਾਥਫਾਈਂਡਰ ਇੱਕ ਵੈਬਸਾਈਟ ਹੈ ਜੋ ਤੁਹਾਡੇ ਬੱਚੇ ਨੂੰ ਸਕੂਲ ਦੇ ਵਿਸ਼ੇ ਚੁਣਨ ਅਤੇ ਉਸਦੇ ਭਵਿੱਖ ਲਈ ਸਹੀ ਯੂਨੀਵਰਸਿਟੀ ਜਾਂ ਕਾਲਜ ਕੋਰਸ ਲੱਭਣ ਵਿੱਚ ਮਦਦ ਕਰਦੀ ਹੈ। ਸਕਾਟਲੈਂਡ ਵਿੱਚ ਰਹਿਣ ਵਾਲੇ ਸਕਾਟਿਸ਼ ਵਿਦਿਆਰਥੀਆਂ ਲਈ ਯੂਨੀਵਰਸਿਟੀ ਮੁਫ਼ਤ ਹੈ। ਤੁਹਾਡਾ ਬੱਚਾ ਫੀਸ ਨਹੀਂ ਦਿੰਦਾ। ਪਰਿਵਾਰ ਦੀ ਆਮਦਨ ਦੇ ਆਧਾਰ 'ਤੇ ਰਹਿਣ-ਸਹਿਣ ਦੇ ਖਰਚਿਆਂ ਲਈ ਵਜ਼ੀਫ਼ੇ ਅਤੇ ਗ੍ਰਾਂਟਾਂ ਉਪਲਬਧ ਹਨ। ਹਰ ਸਕੂਲ ਵਿੱਚ ਇੱਕ ਮਾਰਗਦਰਸ਼ਨ ਅਧਿਆਪਕ (guidance teacher) ਹੁੰਦਾ ਹੈ। ਮੁਫ਼ਤ ਮਾਪਿਆਂ ਦਾ ਖਾਤਾ ਬਣਾਉਣ ਲਈ pathfinderscot.co.uk/parent/join 'ਤੇ ਜਾਓ।`,
    needs_verification: true,
  },
  {
    languageName: 'Punjabi (Shahmukhi)',
    languageNameNative: 'پنجابی',
    bcp47: 'pnb',
    dir: 'rtl',
    flag: '🇵🇰',
    fontFamily: '"Noto Nastaliq Urdu", "Jameel Noori Nastaleeq", serif',
    text: `پاتھ فائنڈر سکاٹ لینڈ وچ خوش آمدید۔ پاتھ فائنڈر اک ویب سائٹ اے جہڑی تہاڈے بچے نوں سکول دے مضمون چُنن تے اوہدے مستقبل لئی ٹھیک یونیورسٹی یا کالج کورس لبھن وچ مدد کردی اے۔ سکاٹ لینڈ وچ رہن والے سکاٹش ودیارتھیاں لئی یونیورسٹی مفت اے۔ تہاڈا بچہ فیس نئیں دیندا۔ پریوار دی آمدن تے تہاڈی حالت دے حساب نال رہن سہن دے خرچاں لئی وظیفے تے گرانٹاں دستیاب نیں۔ ہر سکول وچ اک رہنمائی استاد (guidance teacher) ہوندا اے۔ مفت والدین اکاؤنٹ بنان لئی pathfinderscot.co.uk/parent/join تے جاؤ۔`,
    needs_verification: true,
  },
  {
    languageName: 'Bengali',
    languageNameNative: 'বাংলা',
    bcp47: 'bn',
    dir: 'ltr',
    flag: '🇧🇩',
    text: `পাথফাইন্ডার স্কটল্যান্ডে স্বাগতম। পাথফাইন্ডার একটি ওয়েবসাইট যা আপনার সন্তানকে স্কুলের বিষয় নির্বাচন করতে এবং তার ভবিষ্যতের জন্য সঠিক বিশ্ববিদ্যালয় বা কলেজ কোর্স খুঁজে পেতে সাহায্য করে। স্কটল্যান্ডে বসবাসকারী স্কটিশ ছাত্রছাত্রীদের জন্য বিশ্ববিদ্যালয় বিনামূল্যে। আপনার সন্তানকে টিউশন ফি দিতে হয় না। পরিবারের আয় এবং আপনার পরিস্থিতির উপর নির্ভর করে জীবনযাত্রার খরচের জন্য বৃত্তি ও অনুদান পাওয়া যায়। প্রতিটি স্কুলে একজন গাইডেন্স শিক্ষক (guidance teacher) আছেন যিনি আপনার সন্তানকে সাহায্য করতে পারেন। বিনামূল্যে অভিভাবক অ্যাকাউন্ট তৈরি করতে pathfinderscot.co.uk/parent/join এ যান।`,
    needs_verification: true,
  },
  {
    languageName: 'Hindi',
    languageNameNative: 'हिन्दी',
    bcp47: 'hi',
    dir: 'ltr',
    flag: '🇮🇳',
    text: `पाथफाइंडर स्कॉटलैंड में आपका स्वागत है। पाथफाइंडर एक वेबसाइट है जो आपके बच्चे को स्कूल के विषय चुनने और उसके भविष्य के लिए सही विश्वविद्यालय या कॉलेज कोर्स खोजने में मदद करती है। स्कॉटलैंड में रहने वाले स्कॉटिश छात्रों के लिए विश्वविद्यालय मुफ़्त है। आपका बच्चा ट्यूशन फ़ीस नहीं देता। परिवार की आय और आपकी स्थिति के आधार पर रहने के खर्च के लिए छात्रवृत्ति और अनुदान उपलब्ध हैं। हर स्कूल में एक मार्गदर्शन शिक्षक (guidance teacher) होता है जो आपके बच्चे की मदद कर सकता है। मुफ़्त माता-पिता खाता बनाने के लिए pathfinderscot.co.uk/parent/join पर जाएं।`,
    needs_verification: true,
  },
  {
    languageName: 'Mandarin Chinese (Simplified)',
    languageNameNative: '简体中文',
    bcp47: 'zh-Hans',
    dir: 'ltr',
    flag: '🇨🇳',
    text: `欢迎来到 Pathfinder Scotland（苏格兰寻路者）。Pathfinder 是一个网站，帮助您的孩子选择学校科目，并为他们的未来找到合适的大学或学院课程。对于居住在苏格兰的苏格兰学生，大学是免费的。您的孩子不需要支付学费。根据家庭收入和情况，可以获得助学金和补助金，用于生活费用。每所学校都有一位指导老师 (guidance teacher)，可以帮助您的孩子规划科目和申请大学。请访问 pathfinderscot.co.uk/parent/join，创建免费的家长账户，查看孩子的学习进度。`,
    needs_verification: true,
  },
  {
    languageName: 'Cantonese Chinese (Traditional)',
    languageNameNative: '繁體中文',
    bcp47: 'zh-Hant',
    dir: 'ltr',
    flag: '🇭🇰',
    text: `歡迎來到 Pathfinder Scotland（蘇格蘭尋路者）。Pathfinder 係一個網站，幫助你嘅仔女揀學校科目，同埋搵啱佢哋未來嘅大學或者學院課程。住喺蘇格蘭嘅蘇格蘭學生讀大學係免費嘅。你嘅仔女唔使畀學費。根據家庭收入同你嘅情況，可以申請助學金同資助嚟支付生活費。每間學校都有一位輔導老師 (guidance teacher)，可以幫你嘅仔女計劃科目同申請大學。請去 pathfinderscot.co.uk/parent/join 建立一個免費嘅家長帳戶。`,
    needs_verification: true,
  },
  {
    languageName: 'Arabic',
    languageNameNative: 'العربية',
    bcp47: 'ar',
    dir: 'rtl',
    // flag omitted -- Arabic is an official language in 20+ countries; no single flag is appropriate
    text: `مرحباً بكم في Pathfinder Scotland. باث فايندر هو موقع إلكتروني يساعد طفلك على اختيار المواد الدراسية والعثور على دورة الجامعة أو الكلية المناسبة لمستقبله. الجامعة مجانية للطلاب الاسكتلنديين الذين يعيشون في اسكتلندا. لا يدفع طفلك رسوماً دراسية. تتوفر منح ومساعدات لتكاليف المعيشة بناءً على دخل الأسرة ووضعكم. كل مدرسة لديها مرشد طلابي (guidance teacher) يمكنه مساعدة طفلك في تخطيط المواد والتقديم للجامعة. قم بزيارة pathfinderscot.co.uk/parent/join لإنشاء حساب ولي أمر مجاني ومتابعة تقدم طفلك.`,
    needs_verification: true,
  },
  {
    languageName: 'Kurdish (Sorani)',
    languageNameNative: 'کوردی',
    bcp47: 'ckb',
    dir: 'rtl',
    // flag omitted -- Sorani Kurdish has no internationally recognised national flag
    text: `بەخێربێن بۆ Pathfinder Scotland. پاسفایندەر ماڵپەڕێکە کە یارمەتی منداڵەکەت دەدات بۆ هەڵبژاردنی بابەتە قوتابخانەییەکان و دۆزینەوەی خولی زانکۆ یان کۆلێژی گونجاو بۆ داهاتووی. زانکۆ بە خۆڕاییە بۆ قوتابیانی سکۆتلەندی کە لە سکۆتلەندا دەژین. منداڵەکەت پارەی خوێندن نادات. بەپێی داهاتی خێزان و دۆخەکەت، پاداشت و یارمەتی بۆ تێچووی ژیان بەردەستە. هەر قوتابخانەیەک مامۆستای ڕێنمایی (guidance teacher) ی هەیە کە دەتوانێت یارمەتی منداڵەکەت بدات. سەردانی pathfinderscot.co.uk/parent/join بکە بۆ دروستکردنی هەژمارێکی باوانی بە خۆڕایی.`,
    needs_verification: true,
  },
  {
    languageName: 'Farsi / Persian',
    languageNameNative: 'فارسی',
    bcp47: 'fa',
    dir: 'rtl',
    flag: '🇮🇷',
    text: `به Pathfinder Scotland خوش آمدید. پث‌فایندر یک وب‌سایت است که به فرزند شما کمک می‌کند درس‌های مدرسه را انتخاب کند و دوره‌ی دانشگاهی یا کالج مناسب برای آینده‌اش را پیدا کند. دانشگاه برای دانشجویان اسکاتلندی که در اسکاتلند زندگی می‌کنند رایگان است. فرزند شما شهریه نمی‌پردازد. بورس‌ها و کمک‌هزینه‌ها برای هزینه‌های زندگی در دسترس است و بر اساس درآمد خانواده و شرایط شما تعیین می‌شود. هر مدرسه یک معلم راهنما (guidance teacher) دارد که می‌تواند به فرزند شما کمک کند. برای ایجاد حساب والدین رایگان، به pathfinderscot.co.uk/parent/join مراجعه کنید.`,
    needs_verification: true,
  },
  {
    languageName: 'Turkish',
    languageNameNative: 'Türkçe',
    bcp47: 'tr',
    dir: 'ltr',
    flag: '🇹🇷',
    text: `Pathfinder Scotland'a hoş geldiniz. Pathfinder, çocuğunuzun okul derslerini seçmesine ve geleceği için doğru üniversite veya kolej kursunu bulmasına yardımcı olan bir web sitesidir. İskoçya'da yaşayan İskoç öğrenciler için üniversite ücretsizdir. Çocuğunuz öğrenim ücreti ödemez. Aile gelirine ve durumunuza bağlı olarak yaşam giderleri için burslar ve yardımlar mevcuttur. Her okulda, çocuğunuzun derslerini planlamasına ve başvuru yapmasına yardımcı olabilecek bir rehber öğretmen (guidance teacher) bulunur. Ücretsiz bir veli hesabı oluşturmak için pathfinderscot.co.uk/parent/join adresini ziyaret edin.`,
    needs_verification: true,
  },
  {
    languageName: 'Somali',
    languageNameNative: 'Soomaali',
    bcp47: 'so',
    dir: 'ltr',
    flag: '🇸🇴',
    text: `Ku soo dhowow Pathfinder Scotland. Pathfinder waa website caawiya ilmahaaga inuu doorto maaddooyinka dugsiga oo uu helo koorsada jaamacadda ama kulliyadda ku habboon mustaqbalkiisa. Jaamacaddu waa bilaash arday Scottish ah oo ku nool Scotland. Ilmahaagu ma bixiyo lacag waxbarasho. Waxaa la heli karaa deeqo iyo taageero lacageed oo loogu talagalay kharashaadka nololeed, iyadoo ku xiran dakhliga qoyska iyo xaaladaada. Dugsi kastaa wuxuu leeyahay macallin hanuuniye (guidance teacher) oo caawin kara ilmahaaga. Booqo pathfinderscot.co.uk/parent/join si aad u sameysato akoon waalid oo bilaash ah.`,
    needs_verification: true,
  },
  {
    languageName: 'Tigrinya',
    languageNameNative: 'ትግርኛ',
    bcp47: 'ti',
    dir: 'ltr',
    flag: '🇪🇷',
    text: `ብሓጎስ ናብ Pathfinder Scotland እንቋዕ ብደሓን መጻእኩም። ፓዝፋይንደር ንውላድኩም ትምህርትታት ቤት ትምህርቲ ክመርጽ ከምኡውን ንመጻኢኡ ዝሰማማዕ ናይ ዩኒቨርስቲ ወይ ኮሌጅ ኮርስ ክረክብ ዝሕግዝ መርበብ ሓበሬታ እዩ። ኣብ ስኮትላንድ ዝነብሩ ስኮትላንዳዊ ተማሃሮ ዩኒቨርስቲ ብነጻ እዩ። ውላድኩም ክፍሊት ትምህርቲ ኣይከፍልን። ብመሰረት እቶት ስድራቤትኩምን ኩነታትኩምን ንወጻኢታት ናብራ ዝኸውን ስኮላርሺፕን ደገፍን ኣለዉ። ነፍሲ ወከፍ ቤት ትምህርቲ መምህር መምርሒ (guidance teacher) ኣለዎ። ብነጻ ናይ ወለዲ ሕሳብ ንምኽፋት pathfinderscot.co.uk/parent/join ይብጽሑ።`,
    needs_verification: true,
  },
  {
    languageName: 'Amharic',
    languageNameNative: 'አማርኛ',
    bcp47: 'am',
    dir: 'ltr',
    flag: '🇪🇹',
    text: `እንኳን ወደ Pathfinder Scotland በሰላም መጡ። ፓዝፋይንደር ለልጅዎ የትምህርት ዓይነቶችን ለመምረጥ እና ለወደፊት ምቹ የዩኒቨርሲቲ ወይም ኮሌጅ ኮርስ ለማግኘት የሚያግዝ ድረ-ገጽ ነው። በስኮትላንድ ለሚኖሩ የስኮትላንድ ተማሪዎች ዩኒቨርሲቲ ነፃ ነው። ልጅዎ የትምህርት ክፍያ አይከፍልም። በቤተሰብ ገቢ እና በሁኔታዎ ላይ በመመስረት ለኑሮ ወጪዎች የሚሰጥ እርዳታ እና ድጎማ አለ። እያንዳንዱ ትምህርት ቤት የምክር መምህር (guidance teacher) አለው። ነፃ የወላጅ መለያ ለመፍጠር pathfinderscot.co.uk/parent/join ይጎብኙ።`,
    needs_verification: true,
  },
]

export default function ParentWelcomePage() {
  return (
    <div className="pf-container pt-8 pb-12" style={{ maxWidth: '820px' }}>
      {/* Logo header */}
      <div style={{ textAlign: 'center', marginBottom: '16px' }}>
        <Link
          href="/"
          className="inline-flex items-center justify-center no-underline hover:no-underline"
        >
          <Image
            src="/logo-full-2x.png"
            alt="Pathfinder Scotland"
            width={320}
            height={133}
            priority
            style={{ height: '64px', width: 'auto' }}
          />
        </Link>
      </div>

      {/* Google Translate widget (top-right, parent pages only) */}
      <GoogleTranslate />

      {/* Top caveat */}
      <div
        className="pf-card"
        style={{
          backgroundColor: 'var(--pf-blue-50)',
          borderLeft: '4px solid var(--pf-blue-700)',
          marginBottom: '24px',
        }}
      >
        <p style={{ margin: 0, fontSize: '0.9375rem', lineHeight: 1.55 }}>
          This information has been translated to help you understand our service. If you
          need further help in your language, contact your child&apos;s school.
        </p>
      </div>

      {/* English welcome content -- source of truth, always visible */}
      <section lang="en" style={{ marginBottom: '40px' }}>
        <h1 style={{ marginBottom: '8px' }}>Welcome to Pathfinder Scotland</h1>
        <p style={{ color: 'var(--pf-grey-600)', marginBottom: '16px' }}>
          A short guide for parents and guardians in Scotland.
        </p>

        <p style={{ lineHeight: 1.6, marginBottom: '12px' }}>
          Pathfinder is a website that helps your child choose their school subjects and
          find the right university or college course for their future. It shows which
          subjects they need to study, which jobs different courses lead to, and how much
          each course could cost.
        </p>
        <p style={{ lineHeight: 1.6, marginBottom: '12px' }}>
          <strong>University is free for Scottish students.</strong> If your family lives in
          Scotland, your child does not pay tuition fees to study at a Scottish university.
        </p>
        <p style={{ lineHeight: 1.6, marginBottom: '12px' }}>
          <strong>Bursaries and grants are available.</strong> Extra money to help with
          living costs is based on your family income and your home situation. Many
          students receive thousands of pounds each year.
        </p>
        <p style={{ lineHeight: 1.6, marginBottom: '12px' }}>
          <strong>Ask your child&apos;s guidance teacher.</strong> Every secondary school
          has a guidance teacher who can help your child plan their subjects and apply to
          university or college. Please speak to them if you have questions.
        </p>
        <p style={{ lineHeight: 1.6, marginBottom: '16px' }}>
          Visit{' '}
          <Link
            href="/parent/join"
            style={{ color: 'var(--pf-blue-700)', fontWeight: 600 }}
          >
            pathfinderscot.co.uk/parent/join
          </Link>{' '}
          to create a free parent account and see your child&apos;s progress.
        </p>

        <Link
          href="/parent/join"
          className="pf-btn-primary"
          style={{ display: 'inline-block' }}
        >
          Create parent account
        </Link>
      </section>

      {/* Language search and accordion blocks */}
      <LanguageBlocks blocks={BLOCKS} />

      {/* Bottom reminder */}
      <div
        className="pf-card"
        style={{
          backgroundColor: 'var(--pf-grey-50, #f8fafc)',
          marginTop: '32px',
          fontSize: '0.875rem',
          color: 'var(--pf-grey-700)',
        }}
      >
        <p style={{ margin: 0, lineHeight: 1.55 }}>
          All translations on this page have been prepared by machine translation and are
          pending review by native speakers. If you spot an error, please email{' '}
          <a href="mailto:hello@pathfinderscot.co.uk" style={{ color: 'var(--pf-blue-700)' }}>
            hello@pathfinderscot.co.uk
          </a>
          .
        </p>
      </div>
    </div>
  )
}
