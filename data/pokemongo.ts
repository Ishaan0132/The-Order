/**
 * A listing of every Pokemon that can be obtained from Pokemon GO and how the can be obtained.
 * If a Pokemon is not listed here, it cannot be obtained from Pokemon GO.
 *
 * Key:
 * - Origin:
 * - wild: Can be found in the overworld, either as a regular spawn or through a similar source such as GO Snapshot
 * - egg: Hatches from 2, 5, or 10 km eggs
 * - giovanni: Shadow Pokemon rescued from Giovanni and purified
 * - 7kmegg: Hatches from a 7 km egg, which is obtained from gifts which unlock at level 10 alongside friends
 * - 12kmegg: Hatches from a 12 km egg, which is obtained from Team GO Rocket Leaders which unlock at level 8
 * - raid: Caught from defeating a raid boss
 * - research: Reward from field research, special research, or research breakthrough
 * If the Pokemon is obtainable from the wild, other sources do not need to be included due to redundancy.
 * For shinies that can't be obtained from the wild, all other sources should be included.
 *
 * - Shiny origin restrictions:
 * - noshiny: This Pokemon's shiny form is unavailable in Pokemon GO
 * - noeggshiny: This Pokemon can't be obtained as shiny from 2, 5, or 10 km eggs (but may be obtained from other eggs)
 * - no7kmeggshiny: This Pokemon can't be obtained as shiny from 7 km eggs
 * - noresearchshiny: This Pokemon can't be obtained as shiny from a research reward
 * - nowildshiny: This Pokemon can't be obtained as shiny from the wild
 *
 * - Trade restrictions:
 * - notrade: This Pokemon cannot be traded at all
 * - specialtrade: This Pokemon must be traded in a special trade
 *
 * Certain sources have been excluded from this list, which are:
 * - GO Battle League: same level and IV floor as raid bosses, and all from GO Battle League have also been in raids
 * - Shadow Pokemon: most can also be obtained from the wild, and those that can't are from defeating Giovanni, which
 *   is handled as as its own encounter
 */
export const PokemonGoData: {[source: string]: PokemonGoData} = {
	bulbasaur: {encounters: ['wild']},
	ivysaur: {encounters: ['wild']},
	venusaur: {encounters: ['wild']},
	charmander: {encounters: ['wild']},
	charmeleon: {encounters: ['wild']},
	charizard: {encounters: ['wild']},
	squirtle: {encounters: ['wild']},
	wartortle: {encounters: ['wild']},
	blastoise: {encounters: ['wild']},
	caterpie: {encounters: ['wild']},
	metapod: {encounters: ['wild']},
	butterfree: {encounters: ['wild']},
	weedle: {encounters: ['wild']},
	kakuna: {encounters: ['wild']},
	beedrill: {encounters: ['wild']},
	pidgey: {encounters: ['wild']},
	pidgeotto: {encounters: ['wild']},
	pidgeot: {encounters: ['wild']},
	rattata: {encounters: ['wild']},
	rattataalola: {encounters: ['wild']},
	raticate: {encounters: ['wild']},
	raticatealola: {encounters: ['wild']},
	spearow: {encounters: ['wild']},
	fearow: {encounters: ['wild']},
	ekans: {encounters: ['wild']},
	arbok: {encounters: ['wild']},
	pikachu: {encounters: ['wild']},
	raichu: {encounters: ['wild']},
	raichualola: {encounters: ['wild']},
	sandshrew: {encounters: ['wild']},
	sandshrewalola: {encounters: ['wild']},
	sandslash: {encounters: ['wild']},
	sandslashalola: {encounters: ['wild']},
	nidoranf: {encounters: ['wild']},
	nidorina: {encounters: ['wild']},
	nidoqueen: {encounters: ['wild']},
	nidoranm: {encounters: ['wild']},
	nidorino: {encounters: ['wild']},
	nidoking: {encounters: ['wild']},
	clefairy: {encounters: ['wild']},
	clefable: {encounters: ['wild']},
	vulpix: {encounters: ['wild']},
	vulpixalola: {encounters: ['wild']},
	ninetales: {encounters: ['wild']},
	ninetalesalola: {encounters: ['wild']},
	jigglypuff: {encounters: ['wild']},
	wigglytuff: {encounters: ['wild']},
	zubat: {encounters: ['wild']},
	golbat: {encounters: ['wild']},
	oddish: {encounters: ['wild']},
	gloom: {encounters: ['wild']},
	vileplume: {encounters: ['wild']},
	paras: {encounters: ['wild']},
	parasect: {encounters: ['wild']},
	venonat: {encounters: ['wild']},
	venomoth: {encounters: ['wild']},
	diglett: {encounters: ['wild']},
	diglettalola: {encounters: ['wild']},
	dugtrio: {encounters: ['wild']},
	dugtrioalola: {encounters: ['wild']},
	meowth: {encounters: ['wild']},
	meowthalola: {encounters: ['wild']},
	meowthgalar: {encounters: ['7kmegg', 'raid', 'research']},
	persian: {encounters: ['wild']},
	persianalola: {encounters: ['7kmegg', 'raid', 'research']},
	psyduck: {encounters: ['wild']},
	golduck: {encounters: ['wild']},
	mankey: {encounters: ['wild']},
	primeape: {encounters: ['wild']},
	growlithe: {encounters: ['wild']},
	growlithehisui: {encounters: ['7kmegg', 'raid', 'research', 'noshiny']},
	arcanine: {encounters: ['wild']},
	arcaninehisui: {encounters: ['7kmegg', 'raid', 'research', 'noshiny']},
	poliwag: {encounters: ['wild']},
	poliwhirl: {encounters: ['wild']},
	poliwrath: {encounters: ['wild']},
	abra: {encounters: ['wild']},
	kadabra: {encounters: ['wild']},
	alakazam: {encounters: ['wild']},
	machop: {encounters: ['wild']},
	machoke: {encounters: ['wild']},
	machamp: {encounters: ['wild']},
	bellsprout: {encounters: ['wild']},
	weepinbell: {encounters: ['wild']},
	victreebel: {encounters: ['wild']},
	tentacool: {encounters: ['wild']},
	tentacruel: {encounters: ['wild']},
	geodude: {encounters: ['wild']},
	geodudealola: {encounters: ['wild']},
	graveler: {encounters: ['wild']},
	graveleralola: {encounters: ['wild']},
	golem: {encounters: ['wild']},
	golemalola: {encounters: ['wild']},
	ponyta: {encounters: ['wild']},
	ponytagalar: {encounters: ['wild']},
	rapidash: {encounters: ['wild']},
	rapidashgalar: {encounters: ['wild']},
	slowpoke: {encounters: ['wild']},
	slowpokegalar: {encounters: ['wild']},
	slowbro: {encounters: ['wild']},
	slowbrogalar: {encounters: ['wild']},
	magnemite: {encounters: ['wild']},
	magneton: {encounters: ['wild']},
	farfetchd: {encounters: ['wild']},
	farfetchdgalar: {encounters: ['wild', 'raid', 'research', 'nowildshiny']},
	doduo: {encounters: ['wild']},
	dodrio: {encounters: ['wild']},
	seel: {encounters: ['wild']},
	dewgong: {encounters: ['wild']},
	grimer: {encounters: ['wild']},
	grimeralola: {encounters: ['wild']},
	muk: {encounters: ['wild']},
	mukalola: {encounters: ['wild']},
	shellder: {encounters: ['wild']},
	cloyster: {encounters: ['wild']},
	gastly: {encounters: ['wild']},
	haunter: {encounters: ['wild']},
	gengar: {encounters: ['wild']},
	onix: {encounters: ['wild']},
	drowzee: {encounters: ['wild']},
	hypno: {encounters: ['wild']},
	krabby: {encounters: ['wild']},
	kingler: {encounters: ['wild']},
	voltorb: {encounters: ['wild']},
	voltorbhisui: {encounters: ['wild', 'noshiny']},
	electrode: {encounters: ['wild']},
	electrodehisui: {encounters: ['wild', 'noshiny']},
	exeggcute: {encounters: ['wild']},
	exeggutor: {encounters: ['wild']},
	exeggutoralola: {encounters: ['wild']},
	cubone: {encounters: ['wild']},
	marowak: {encounters: ['wild']},
	marowakalola: {encounters: ['wild']},
	hitmonlee: {encounters: ['wild']},
	hitmonchan: {encounters: ['wild']},
	lickitung: {encounters: ['wild']},
	koffing: {encounters: ['wild']},
	weezing: {encounters: ['wild']},
	weezinggalar: {encounters: ['wild']},
	rhyhorn: {encounters: ['wild']},
	rhydon: {encounters: ['wild']},
	chansey: {encounters: ['wild']},
	tangela: {encounters: ['wild']},
	kangaskhan: {encounters: ['wild']},
	horsea: {encounters: ['wild']},
	seadra: {encounters: ['wild']},
	goldeen: {encounters: ['wild']},
	seaking: {encounters: ['wild']},
	staryu: {encounters: ['wild']},
	starmie: {encounters: ['wild']},
	mrmime: {encounters: ['wild']},
	mrmimegalar: {encounters: ['wild', '7kmegg', 'research', 'no7kmeggshiny', 'nowildshiny']},
	scyther: {encounters: ['wild']},
	jynx: {encounters: ['wild']},
	electabuzz: {encounters: ['wild']},
	magmar: {encounters: ['wild']},
	pinsir: {encounters: ['wild']},
	tauros: {encounters: ['wild']},
	magikarp: {encounters: ['wild']},
	gyarados: {encounters: ['wild']},
	ditto: {encounters: ['wild']},
	eevee: {encounters: ['wild']},
	vaporeon: {encounters: ['wild']},
	jolteon: {encounters: ['wild']},
	flareon: {encounters: ['wild']},
	porygon: {encounters: ['wild']},
	omanyte: {encounters: ['wild']},
	omastar: {encounters: ['wild']},
	kabuto: {encounters: ['wild']},
	kabutops: {encounters: ['wild']},
	aerodactyl: {encounters: ['wild']},
	snorlax: {encounters: ['wild']},
	articuno: {encounters: ['giovanni', 'raid', 'research', 'specialtrade']},
	articunogalar: {encounters: ['wild']},
	zapdos: {encounters: ['giovanni', 'raid', 'research', 'specialtrade']},
	zapdosgalar: {encounters: ['wild']},
	moltres: {encounters: ['giovanni', 'raid', 'research', 'specialtrade']},
	moltresgalar: {encounters: ['wild']},
	dratini: {encounters: ['wild']},
	dragonair: {encounters: ['wild']},
	dragonite: {encounters: ['wild']},
	mewtwo: {encounters: ['raid', 'research', 'specialtrade']},
	mew: {encounters: ['research', 'notrade']},
	chikorita: {encounters: ['wild']},
	bayleef: {encounters: ['wild']},
	meganium: {encounters: ['wild']},
	cyndaquil: {encounters: ['wild']},
	quilava: {encounters: ['wild']},
	typhlosion: {encounters: ['wild']},
	totodile: {encounters: ['wild']},
	croconaw: {encounters: ['wild']},
	feraligatr: {encounters: ['wild']},
	sentret: {encounters: ['wild']},
	furret: {encounters: ['wild']},
	hoothoot: {encounters: ['wild']},
	noctowl: {encounters: ['wild']},
	ledyba: {encounters: ['wild']},
	ledian: {encounters: ['wild']},
	spinarak: {encounters: ['wild']},
	ariados: {encounters: ['wild']},
	crobat: {encounters: ['wild']},
	chinchou: {encounters: ['wild']},
	lanturn: {encounters: ['wild']},
	pichu: {encounters: ['egg']},
	cleffa: {encounters: ['egg']},
	igglybuff: {encounters: ['egg']},
	togepi: {encounters: ['egg']},
	togetic: {encounters: ['wild']},
	natu: {encounters: ['wild']},
	xatu: {encounters: ['wild']},
	mareep: {encounters: ['wild']},
	flaaffy: {encounters: ['wild']},
	ampharos: {encounters: ['wild']},
	bellossom: {encounters: ['wild']},
	marill: {encounters: ['wild']},
	azumarill: {encounters: ['wild']},
	sudowoodo: {encounters: ['wild']},
	politoed: {encounters: ['wild']},
	hoppip: {encounters: ['wild']},
	skiploom: {encounters: ['wild']},
	jumpluff: {encounters: ['wild']},
	aipom: {encounters: ['wild']},
	sunkern: {encounters: ['wild']},
	sunflora: {encounters: ['wild']},
	yanma: {encounters: ['wild']},
	wooper: {encounters: ['wild']},
	quagsire: {encounters: ['wild']},
	espeon: {encounters: ['wild']},
	umbreon: {encounters: ['wild']},
	murkrow: {encounters: ['wild']},
	slowking: {encounters: ['wild']},
	slowkinggalar: {encounters: ['wild']},
	misdreavus: {encounters: ['wild']},
	unown: {encounters: ['wild']},
	unownb: {encounters: ['wild']},
	unownc: {encounters: ['wild']},
	unownd: {encounters: ['wild']},
	unowne: {encounters: ['wild']},
	unownf: {encounters: ['wild']},
	unowng: {encounters: ['wild']},
	unownh: {encounters: ['wild']},
	unowni: {encounters: ['wild']},
	unownj: {encounters: ['wild']},
	unownk: {encounters: ['wild', 'noshiny']},
	unownl: {encounters: ['wild', 'noshiny']},
	unownm: {encounters: ['wild', 'noshiny']},
	unownn: {encounters: ['wild']},
	unowno: {encounters: ['wild']},
	unownp: {encounters: ['wild']},
	unownq: {encounters: ['wild', 'noshiny']},
	unownr: {encounters: ['wild']},
	unowns: {encounters: ['wild']},
	unownt: {encounters: ['wild']},
	unownu: {encounters: ['wild']},
	unownv: {encounters: ['wild']},
	unownw: {encounters: ['wild', 'noshiny']},
	unownx: {encounters: ['wild']},
	unowny: {encounters: ['wild']},
	unownz: {encounters: ['wild', 'noshiny']},
	unownexclamation: {encounters: ['wild', 'noshiny']},
	unownquestion: {encounters: ['wild', 'noshiny']},
	wobbuffet: {encounters: ['wild']},
	girafarig: {encounters: ['wild']},
	pineco: {encounters: ['wild']},
	forretress: {encounters: ['wild']},
	dunsparce: {encounters: ['wild']},
	gligar: {encounters: ['wild']},
	steelix: {encounters: ['wild']},
	snubbull: {encounters: ['wild']},
	granbull: {encounters: ['wild']},
	qwilfish: {encounters: ['wild']},
	qwilfishhisui: {encounters: ['wild', 'noshiny']},
	scizor: {encounters: ['wild']},
	shuckle: {encounters: ['wild']},
	heracross: {encounters: ['wild']},
	sneasel: {encounters: ['wild']},
	sneaselhisui: {encounters: ['wild', 'noshiny']},
	teddiursa: {encounters: ['wild']},
	ursaring: {encounters: ['wild']},
	slugma: {encounters: ['wild']},
	magcargo: {encounters: ['wild']},
	swinub: {encounters: ['wild']},
	piloswine: {encounters: ['wild']},
	corsola: {encounters: ['wild']},
	remoraid: {encounters: ['wild']},
	octillery: {encounters: ['wild']},
	delibird: {encounters: ['wild']},
	mantine: {encounters: ['wild']},
	skarmory: {encounters: ['wild']},
	houndour: {encounters: ['wild']},
	houndoom: {encounters: ['wild']},
	kingdra: {encounters: ['wild']},
	phanpy: {encounters: ['wild']},
	donphan: {encounters: ['wild']},
	porygon2: {encounters: ['wild']},
	stantler: {encounters: ['wild']},
	smeargle: {encounters: ['wild']},
	tyrogue: {encounters: ['egg']},
	hitmontop: {encounters: ['wild']},
	smoochum: {encounters: ['egg', 'research']},
	elekid: {encounters: ['egg', 'research']},
	magby: {encounters: ['egg']},
	miltank: {encounters: ['wild']},
	blissey: {encounters: ['wild']},
	raikou: {encounters: ['wild']},
	entei: {encounters: ['wild']},
	suicune: {encounters: ['wild']},
	larvitar: {encounters: ['wild']},
	pupitar: {encounters: ['wild']},
	tyranitar: {encounters: ['wild']},
	lugia: {encounters: ['giovanni', 'raid', 'research', 'specialtrade']},
	hooh: {encounters: ['giovanni', 'raid', 'research', 'specialtrade']},
	celebi: {encounters: ['research', 'notrade']},
	treecko: {encounters: ['wild']},
	grovyle: {encounters: ['wild']},
	sceptile: {encounters: ['wild']},
	torchic: {encounters: ['wild']},
	combusken: {encounters: ['wild']},
	blaziken: {encounters: ['wild']},
	mudkip: {encounters: ['wild']},
	marshtomp: {encounters: ['wild']},
	swampert: {encounters: ['wild']},
	poochyena: {encounters: ['wild']},
	mightyena: {encounters: ['wild']},
	zigzagoon: {encounters: ['wild']},
	zigzagoongalar: {encounters: ['wild']},
	linoone: {encounters: ['wild']},
	linoonegalar: {encounters: ['wild']},
	wurmple: {encounters: ['wild']},
	silcoon: {encounters: ['wild']},
	beautifly: {encounters: ['wild']},
	cascoon: {encounters: ['wild']},
	dustox: {encounters: ['wild']},
	lotad: {encounters: ['wild']},
	lombre: {encounters: ['wild']},
	ludicolo: {encounters: ['wild']},
	seedot: {encounters: ['wild']},
	nuzleaf: {encounters: ['wild']},
	shiftry: {encounters: ['wild']},
	taillow: {encounters: ['wild']},
	swellow: {encounters: ['wild']},
	wingull: {encounters: ['wild']},
	pelipper: {encounters: ['wild']},
	ralts: {encounters: ['wild']},
	kirlia: {encounters: ['wild']},
	gardevoir: {encounters: ['wild']},
	surskit: {encounters: ['wild']},
	masquerain: {encounters: ['wild']},
	shroomish: {encounters: ['wild']},
	breloom: {encounters: ['wild']},
	slakoth: {encounters: ['wild']},
	vigoroth: {encounters: ['wild']},
	slaking: {encounters: ['wild']},
	nincada: {encounters: ['wild']},
	ninjask: {encounters: ['wild']},
	shedinja: {encounters: ['research']},
	whismur: {encounters: ['wild']},
	loudred: {encounters: ['wild']},
	exploud: {encounters: ['wild']},
	makuhita: {encounters: ['wild']},
	hariyama: {encounters: ['wild']},
	azurill: {encounters: ['egg']},
	nosepass: {encounters: ['wild']},
	skitty: {encounters: ['wild']},
	delcatty: {encounters: ['wild']},
	sableye: {encounters: ['wild']},
	mawile: {encounters: ['wild']},
	aron: {encounters: ['wild']},
	lairon: {encounters: ['wild']},
	aggron: {encounters: ['wild']},
	meditite: {encounters: ['wild']},
	medicham: {encounters: ['wild']},
	electrike: {encounters: ['wild']},
	manectric: {encounters: ['wild']},
	plusle: {encounters: ['wild']},
	minun: {encounters: ['wild']},
	volbeat: {encounters: ['wild']},
	illumise: {encounters: ['wild']},
	roselia: {encounters: ['wild']},
	gulpin: {encounters: ['wild']},
	swalot: {encounters: ['wild']},
	carvanha: {encounters: ['wild']},
	sharpedo: {encounters: ['wild']},
	wailmer: {encounters: ['wild']},
	wailord: {encounters: ['wild']},
	numel: {encounters: ['wild']},
	camerupt: {encounters: ['wild']},
	torkoal: {encounters: ['wild']},
	spoink: {encounters: ['wild']},
	grumpig: {encounters: ['wild']},
	trapinch: {encounters: ['wild']},
	vibrava: {encounters: ['wild']},
	flygon: {encounters: ['wild']},
	cacnea: {encounters: ['wild']},
	cacturne: {encounters: ['wild']},
	swablu: {encounters: ['wild']},
	altaria: {encounters: ['wild']},
	zangoose: {encounters: ['wild']},
	seviper: {encounters: ['wild']},
	lunatone: {encounters: ['wild']},
	solrock: {encounters: ['wild']},
	barboach: {encounters: ['wild']},
	whiscash: {encounters: ['wild']},
	corphish: {encounters: ['wild']},
	crawdaunt: {encounters: ['wild']},
	baltoy: {encounters: ['wild']},
	claydol: {encounters: ['wild']},
	lileep: {encounters: ['wild']},
	cradily: {encounters: ['wild']},
	anorith: {encounters: ['wild']},
	armaldo: {encounters: ['wild']},
	feebas: {encounters: ['wild']},
	milotic: {encounters: ['wild']},
	castform: {encounters: ['wild']},
	kecleon: {encounters: ['wild']},
	shuppet: {encounters: ['wild']},
	banette: {encounters: ['wild']},
	duskull: {encounters: ['wild']},
	dusclops: {encounters: ['wild']},
	tropius: {encounters: ['wild']},
	chimecho: {encounters: ['wild']},
	absol: {encounters: ['wild']},
	wynaut: {encounters: ['egg']},
	snorunt: {encounters: ['wild']},
	glalie: {encounters: ['wild']},
	spheal: {encounters: ['wild']},
	sealeo: {encounters: ['wild']},
	walrein: {encounters: ['wild']},
	clamperl: {encounters: ['wild']},
	gorebyss: {encounters: ['wild']},
	huntail: {encounters: ['wild']},
	relicanth: {encounters: ['wild']},
	luvdisc: {encounters: ['wild']},
	bagon: {encounters: ['wild']},
	shelgon: {encounters: ['wild']},
	salamence: {encounters: ['wild']},
	beldum: {encounters: ['wild']},
	metang: {encounters: ['wild']},
	metagross: {encounters: ['wild']},
	regirock: {encounters: ['giovanni', 'raid', 'research', 'specialtrade']},
	regice: {encounters: ['giovanni', 'raid', 'research', 'specialtrade']},
	registeel: {encounters: ['giovanni', 'raid', 'research', 'specialtrade']},
	latias: {encounters: ['wild']},
	latios: {encounters: ['wild']},
	kyogre: {encounters: ['raid', 'research', 'specialtrade']},
	groudon: {encounters: ['raid', 'research', 'specialtrade']},
	rayquaza: {encounters: ['raid', 'research', 'specialtrade']},
	jirachi: {encounters: ['research', 'notrade']},
	deoxys: {encounters: ['raid', 'specialtrade']},
	turtwig: {encounters: ['wild']},
	grotle: {encounters: ['wild']},
	torterra: {encounters: ['wild']},
	chimchar: {encounters: ['wild']},
	monferno: {encounters: ['wild']},
	infernape: {encounters: ['wild']},
	piplup: {encounters: ['wild']},
	prinplup: {encounters: ['wild']},
	empoleon: {encounters: ['wild']},
	starly: {encounters: ['wild']},
	staravia: {encounters: ['wild']},
	staraptor: {encounters: ['wild']},
	bidoof: {encounters: ['wild']},
	bibarel: {encounters: ['wild']},
	kricketot: {encounters: ['wild']},
	kricketune: {encounters: ['wild']},
	shinx: {encounters: ['wild']},
	luxio: {encounters: ['wild']},
	luxray: {encounters: ['wild']},
	budew: {encounters: ['egg']},
	roserade: {encounters: ['wild']},
	cranidos: {encounters: ['wild']},
	rampardos: {encounters: ['wild']},
	shieldon: {encounters: ['wild']},
	bastiodon: {encounters: ['wild']},
	burmy: {encounters: ['wild']},
	wormadam: {encounters: ['wild']},
	wormadamsandy: {encounters: ['wild']},
	wormadamtrash: {encounters: ['wild']},
	mothim: {encounters: ['wild']},
	combee: {encounters: ['wild']},
	vespiquen: {encounters: ['wild']},
	pachirisu: {encounters: ['wild', 'noshiny']},
	buizel: {encounters: ['wild']},
	floatzel: {encounters: ['wild']},
	cherubi: {encounters: ['wild']},
	shellos: {encounters: ['wild']},
	shelloseast: {encounters: ['wild']},
	gastrodon: {encounters: ['wild']},
	gastrodoneast: {encounters: ['wild']},
	ambipom: {encounters: ['wild']},
	drifloon: {encounters: ['wild']},
	drifblim: {encounters: ['wild']},
	buneary: {encounters: ['wild']},
	lopunny: {encounters: ['wild']},
	mismagius: {encounters: ['wild']},
	honchkrow: {encounters: ['wild']},
	glameow: {encounters: ['wild']},
	purugly: {encounters: ['wild']},
	chingling: {encounters: ['egg', 'noshiny']},
	stunky: {encounters: ['wild', 'noshiny']},
	skuntank: {encounters: ['wild', 'noshiny']},
	bronzor: {encounters: ['wild']},
	bronzong: {encounters: ['wild']},
	bonsly: {encounters: ['egg']},
	mimejr: {encounters: ['egg']},
	happiny: {encounters: ['egg']},
	chatot: {encounters: ['wild', 'noshiny']},
	spiritomb: {encounters: ['research']},
	gible: {encounters: ['wild']},
	gabite: {encounters: ['wild']},
	garchomp: {encounters: ['wild']},
	munchlax: {encounters: ['egg']},
	riolu: {encounters: ['egg']},
	lucario: {encounters: ['egg', 'research']},
	hippopotas: {encounters: ['wild']},
	hippowdon: {encounters: ['wild']},
	skorupi: {encounters: ['wild']},
	drapion: {encounters: ['wild']},
	croagunk: {encounters: ['wild']},
	toxicroak: {encounters: ['wild']},
	carnivine: {encounters: ['wild', 'noshiny']},
	finneon: {encounters: ['wild']},
	lumineon: {encounters: ['wild']},
	mantyke: {encounters: ['egg', '7kmegg', 'noeggshiny']},
	snover: {encounters: ['wild']},
	abomasnow: {encounters: ['wild']},
	weavile: {encounters: ['wild']},
	magnezone: {encounters: ['wild']},
	lickilicky: {encounters: ['wild']},
	rhyperior: {encounters: ['wild']},
	tangrowth: {encounters: ['wild']},
	electivire: {encounters: ['wild']},
	magmortar: {encounters: ['wild']},
	togekiss: {encounters: ['wild']},
	yanmega: {encounters: ['wild']},
	leafeon: {encounters: ['wild']},
	glaceon: {encounters: ['wild']},
	gliscor: {encounters: ['wild']},
	mamoswine: {encounters: ['wild']},
	porygonz: {encounters: ['wild']},
	gallade: {encounters: ['wild']},
	probopass: {encounters: ['wild']},
	dusknoir: {encounters: ['wild']},
	froslass: {encounters: ['wild']},
	rotom: {encounters: ['wild', 'noshiny']},
	uxie: {encounters: ['wild']},
	mesprit: {encounters: ['wild']},
	azelf: {encounters: ['wild']},
	dialga: {encounters: ['raid', 'specialtrade']},
	palkia: {encounters: ['raid', 'specialtrade']},
	heatran: {encounters: ['raid', 'specialtrade']},
	regigigas: {encounters: ['raid', 'research', 'specialtrade']},
	giratina: {encounters: ['raid', 'specialtrade']},
	cresselia: {encounters: ['raid', 'research', 'specialtrade']},
	darkrai: {encounters: ['raid', 'notrade']},
	shaymin: {encounters: ['research', 'noshiny', 'notrade']},
	victini: {encounters: ['research', 'noshiny', 'notrade']},
	snivy: {encounters: ['wild']},
	servine: {encounters: ['wild']},
	serperior: {encounters: ['wild']},
	tepig: {encounters: ['wild']},
	pignite: {encounters: ['wild']},
	emboar: {encounters: ['wild']},
	oshawott: {encounters: ['wild']},
	dewott: {encounters: ['wild']},
	samurott: {encounters: ['wild']},
	patrat: {encounters: ['wild']},
	watchog: {encounters: ['wild']},
	lillipup: {encounters: ['wild']},
	herdier: {encounters: ['wild']},
	stoutland: {encounters: ['wild']},
	purrloin: {encounters: ['wild']},
	liepard: {encounters: ['wild']},
	pansage: {encounters: ['wild']},
	simisage: {encounters: ['wild']},
	pansear: {encounters: ['wild']},
	simisear: {encounters: ['wild']},
	panpour: {encounters: ['wild']},
	simipour: {encounters: ['wild']},
	munna: {encounters: ['wild']},
	musharna: {encounters: ['wild']},
	pidove: {encounters: ['wild']},
	tranquill: {encounters: ['wild']},
	unfezant: {encounters: ['wild']},
	blitzle: {encounters: ['wild']},
	zebstrika: {encounters: ['wild']},
	roggenrola: {encounters: ['wild']},
	boldore: {encounters: ['wild']},
	gigalith: {encounters: ['wild']},
	woobat: {encounters: ['wild']},
	swoobat: {encounters: ['wild']},
	drilbur: {encounters: ['wild']},
	exacdrill: {encounters: ['wild']},
	audino: {encounters: ['wild']},
	timburr: {encounters: ['egg', 'raid']},
	gurdurr: {encounters: ['egg', 'raid']},
	conkeldurr: {encounters: ['egg', 'raid']},
	tympole: {encounters: ['wild']},
	palpitoad: {encounters: ['wild']},
	seismitoad: {encounters: ['wild']},
	throh: {encounters: ['wild']},
	sawk: {encounters: ['wild']},
	sewaddle: {encounters: ['wild']},
	swadloon: {encounters: ['wild']},
	leavanny: {encounters: ['wild']},
	venipede: {encounters: ['wild']},
	whirlipede: {encounters: ['wild']},
	scolipede: {encounters: ['wild']},
	cottonee: {encounters: ['wild']},
	whimsicott: {encounters: ['wild']},
	petilil: {encounters: ['wild']},
	lilligant: {encounters: ['wild']},
	basculin: {encounters: ['wild', 'noshiny']},
	basculinbluestriped: {encounters: ['wild', 'noshiny']},
	sandile: {encounters: ['12kmegg', 'research', 'noshiny']},
	krokorok: {encounters: ['12kmegg', 'research', 'noshiny']},
	krookodile: {encounters: ['12kmegg', 'research', 'noshiny']},
	darumaka: {encounters: ['wild']},
	darumakagalar: {encounters: ['wild']},
	darmanitan: {encounters: ['wild']},
	darmanitangalar: {encounters: ['wild']},
	maractus: {encounters: ['wild', 'noshiny']},
	dwebble: {encounters: ['wild']},
	crustle: {encounters: ['wild']},
	scraggy: {encounters: ['wild', 'noshiny']},
	scrafty: {encounters: ['wild', 'noshiny']},
	sigilyph: {encounters: ['wild', 'noshiny']},
	yamask: {encounters: ['wild']},
	yamaskgalar: {encounters: ['7kmegg', 'raid', 'research']},
	cofagrigus: {encounters: ['wild']},
	tirtouga: {encounters: ['wild']},
	carracosta: {encounters: ['wild']},
	archen: {encounters: ['wild']},
	archeops: {encounters: ['wild']},
	trubbish: {encounters: ['wild']},
	garbodor: {encounters: ['wild']},
	zorua: {encounters: ['wild', 'noshiny']},
	zoroark: {encounters: ['wild', 'noshiny']},
	minccino: {encounters: ['wild']},
	cinccino: {encounters: ['wild']},
	gothita: {encounters: ['wild', 'noshiny']},
	gothorita: {encounters: ['wild', 'noshiny']},
	gothitelle: {encounters: ['wild', 'noshiny']},
	solosis: {encounters: ['wild', 'noshiny']},
	duosion: {encounters: ['wild', 'noshiny']},
	reuniclus: {encounters: ['wild', 'noshiny']},
	ducklett: {encounters: ['wild', 'noshiny']},
	swanna: {encounters: ['wild', 'noshiny']},
	vanillite: {encounters: ['wild', 'noshiny']},
	vanillish: {encounters: ['wild', 'noshiny']},
	vanilluxe: {encounters: ['wild', 'noshiny']},
	deerling: {encounters: ['wild', 'noshiny']},
	deerlingsummer: {encounters: ['wild', 'noshiny']},
	deerlingautumn: {encounters: ['wild', 'noshiny']},
	deerlingwinter: {encounters: ['wild', 'noshiny']},
	sawsbuck: {encounters: ['wild', 'noshiny']},
	sawsbucksummer: {encounters: ['wild', 'noshiny']},
	sawsbuckautumn: {encounters: ['wild', 'noshiny']},
	sawsbuckwinter: {encounters: ['wild', 'noshiny']},
	emolga: {encounters: ['wild', 'noshiny']},
	karrablast: {encounters: ['wild']},
	escavalier: {encounters: ['wild']},
	foongus: {encounters: ['wild']},
	amoonguss: {encounters: ['wild']},
	frillish: {encounters: ['wild']},
	jellicent: {encounters: ['wild']},
	alomomola: {encounters: ['wild']},
	joltik: {encounters: ['wild', 'noshiny']},
	galvantula: {encounters: ['wild', 'noshiny']},
	ferroseed: {encounters: ['wild']},
	ferrothorn: {encounters: ['wild']},
	klink: {encounters: ['wild']},
	klang: {encounters: ['wild']},
	klinklang: {encounters: ['wild']},
	tynamo: {encounters: ['wild', 'noshiny']},
	eelektrik: {encounters: ['wild', 'noshiny']},
	eelektross: {encounters: ['wild', 'noshiny']},
	elgyem: {encounters: ['wild']},
	beheeyem: {encounters: ['wild']},
	litwick: {encounters: ['wild']},
	lampent: {encounters: ['wild']},
	chandelure: {encounters: ['wild']},
	axew: {encounters: ['wild']},
	fraxure: {encounters: ['wild']},
	haxorus: {encounters: ['wild']},
	cubchoo: {encounters: ['wild']},
	beartic: {encounters: ['wild']},
	cryogonal: {encounters: ['wild', 'noshiny']},
	shelmet: {encounters: ['wild']},
	accelgor: {encounters: ['wild']},
	stunfisk: {encounters: ['wild']},
	stunfiskgalar: {encounters: ['wild']},
	mienfoo: {encounters: ['egg', 'raid', 'noshiny']},
	mienshao: {encounters: ['egg', 'raid', 'noshiny']},
	druddigon: {encounters: ['raid', 'research']},
	golett: {encounters: ['wild', 'noshiny']},
	golurk: {encounters: ['wild', 'noshiny']},
	pawniard: {encounters: ['12kmegg', 'research']},
	bisharp: {encounters: ['12kmegg', 'research']},
	bouffalant: {encounters: ['wild', 'noshiny']},
	rufflet: {encounters: ['wild']},
	braviary: {encounters: ['wild']},
	braviaryhisui: {encounters: ['raid']},
	vullaby: {encounters: ['wild']},
	mandibuzz: {encounters: ['wild']},
	heatmor: {encounters: ['wild']},
	durant: {encounters: ['wild']},
	deino: {encounters: ['wild']},
	zweilous: {encounters: ['wild']},
	hydreigon: {encounters: ['wild']},
	larvesta: {encounters: ['egg', 'noshiny']},
	volcarona: {encounters: ['egg', 'noshiny']},
	cobalion: {encounters: ['raid', 'specialtrade']},
	terrakion: {encounters: ['raid', 'specialtrade']},
	virizion: {encounters: ['raid', 'specialtrade']},
	tornadus: {encounters: ['raid', 'specialtrade']},
	thundurus: {encounters: ['raid', 'specialtrade']},
	reshiram: {encounters: ['raid', 'specialtrade']},
	zekrom: {encounters: ['raid', 'specialtrade']},
	landorus: {encounters: ['raid', 'specialtrade']},
	kyurem: {encounters: ['raid', 'specialtrade']},
	// Kyurem-Black/White are not directly obtained from Pokemon GO but should be able to have legal Pokemon GO origin
	kyuremblack: {encounters: ['raid', 'specialtrade']},
	kyuremwhite: {encounters: ['raid', 'specialtrade']},
	keldeo: {encounters: ['research', 'noshiny', 'notrade']},
	meloetta: {encounters: ['research', 'noshiny', 'notrade']},
	genesect: {encounters: ['raid', 'research', 'noresearchshiny', 'notrade']},
	chespin: {encounters: ['wild']},
	quilladin: {encounters: ['wild']},
	chesnaught: {encounters: ['wild']},
	fennekin: {encounters: ['wild']},
	braixen: {encounters: ['wild']},
	delphox: {encounters: ['wild']},
	froakie: {encounters: ['wild', 'noshiny']},
	frogadier: {encounters: ['wild', 'noshiny']},
	greninja: {encounters: ['wild', 'noshiny']},
	bunnelby: {encounters: ['wild']},
	diggersby: {encounters: ['wild']},
	fletchling: {encounters: ['wild']},
	fletchinder: {encounters: ['wild']},
	talonflame: {encounters: ['wild']},
	// Scatterbug is actually obtained in a special type of encounter,
	// but the level and IV floors are the same as research encounters
	scatterbug: {encounters: ['research', 'noshiny']},
	spewpa: {encounters: ['research', 'noshiny']},
	vivillon: {encounters: ['research', 'noshiny']},
	vivillonarchipelago: {encounters: ['research', 'noshiny']},
	vivilloncontinent: {encounters: ['research', 'noshiny']},
	vivillonelegant: {encounters: ['research', 'noshiny']},
	vivillongarden: {encounters: ['research', 'noshiny']},
	vivillonhighplains: {encounters: ['research', 'noshiny']},
	vivillonicysnow: {encounters: ['research', 'noshiny']},
	vivillonjungle: {encounters: ['research', 'noshiny']},
	vivillonmarine: {encounters: ['research', 'noshiny']},
	vivillonmodern: {encounters: ['research', 'noshiny']},
	vivillonmonsoon: {encounters: ['research', 'noshiny']},
	vivillonocean: {encounters: ['research', 'noshiny']},
	vivillonpolar: {encounters: ['research', 'noshiny']},
	vivillonriver: {encounters: ['research', 'noshiny']},
	vivillonsandstorm: {encounters: ['research', 'noshiny']},
	vivillonsavanna: {encounters: ['research', 'noshiny']},
	vivillonsun: {encounters: ['research', 'noshiny']},
	vivillontundra: {encounters: ['research', 'noshiny']},
	litleo: {encounters: ['wild']},
	pyroar: {encounters: ['wild']},
	flabebe: {encounters: ['wild', 'noshiny']},
	flabebeblue: {encounters: ['wild', 'noshiny']},
	flabebeorange: {encounters: ['wild', 'noshiny']},
	flabebewhite: {encounters: ['wild', 'noshiny']},
	flabebeyellow: {encounters: ['wild', 'noshiny']},
	floette: {encounters: ['wild', 'noshiny']},
	floetteblue: {encounters: ['wild', 'noshiny']},
	floetteorange: {encounters: ['wild', 'noshiny']},
	floettewhite: {encounters: ['wild', 'noshiny']},
	floetteyellow: {encounters: ['wild', 'noshiny']},
	florges: {encounters: ['wild', 'noshiny']},
	florgesblue: {encounters: ['wild', 'noshiny']},
	florgesorange: {encounters: ['wild', 'noshiny']},
	florgeswhite: {encounters: ['wild', 'noshiny']},
	florgesyellow: {encounters: ['wild', 'noshiny']},
	pancham: {encounters: ['wild', '12kmegg', 'raid', 'research', 'nowildshiny']},
	pangoro: {encounters: ['wild', '12kmegg', 'raid', 'research', 'nowildshiny']},
	furfrou: {encounters: ['wild']},
	furfroudandy: {encounters: ['wild']},
	furfroudebutante: {encounters: ['wild']},
	furfroudiamond: {encounters: ['wild']},
	furfrouheart: {encounters: ['wild']},
	furfroukabuki: {encounters: ['wild']},
	furfroulareine: {encounters: ['wild']},
	furfroumatron: {encounters: ['wild']},
	furfroupharaoh: {encounters: ['wild']},
	furfroustar: {encounters: ['wild']},
	espurr: {encounters: ['wild']},
	meowstic: {encounters: ['wild']},
	meowsticf: {encounters: ['wild']},
	spritzee: {encounters: ['wild']},
	aromatisse: {encounters: ['wild']},
	swirlix: {encounters: ['wild']},
	slurpuff: {encounters: ['wild']},
	inkay: {encounters: ['wild']},
	malamar: {encounters: ['wild']},
	binacle: {encounters: ['wild']},
	barbaracle: {encounters: ['wild']},
	skrelp: {encounters: ['wild', 'noshiny']},
	dragalge: {encounters: ['wild', 'noshiny']},
	clauncher: {encounters: ['wild']},
	clawitzer: {encounters: ['wild']},
	helioptile: {encounters: ['wild']},
	heliolisk: {encounters: ['wild']},
	tyrunt: {encounters: ['wild', 'noshiny']},
	tyrantrum: {encounters: ['wild', 'noshiny']},
	amaura: {encounters: ['wild', 'noshiny']},
	aurorus: {encounters: ['wild', 'noshiny']},
	sylveon: {encounters: ['wild']},
	hawlucha: {encounters: ['wild', 'noshiny']},
	dedenne: {encounters: ['wild']},
	carbink: {encounters: ['research', 'noshiny']},
	goomy: {encounters: ['wild', 'noshiny']},
	sliggoo: {encounters: ['wild', 'noshiny']},
	goodra: {encounters: ['wild', 'noshiny']},
	klefki: {encounters: ['wild', 'noshiny']},
	phantump: {encounters: ['wild', 'noshiny']},
	trevenant: {encounters: ['wild', 'noshiny']},
	pumpkaboo: {encounters: ['wild']},
	pumpkaboolarge: {encounters: ['wild']},
	pumpkaboosmall: {encounters: ['wild']},
	pumpkaboosuper: {encounters: ['wild']},
	gourgeist: {encounters: ['wild']},
	gourgeistlarge: {encounters: ['wild']},
	gourgeistsmall: {encounters: ['wild']},
	gourgeistsuper: {encounters: ['wild']},
	bergmite: {encounters: ['wild']},
	avalugg: {encounters: ['wild']},
	avalugghisui: {encounters: ['raid']},
	noibat: {encounters: ['wild']},
	noivern: {encounters: ['wild']},
	xerneas: {encounters: ['raid', 'specialtrade']},
	yveltal: {encounters: ['raid', 'specialtrade']},
	hoopa: {encounters: ['raid', 'research', 'noshiny', 'notrade']},
	rowlet: {encounters: ['wild', 'noshiny']},
	dartrix: {encounters: ['wild', 'noshiny']},
	decidueye: {encounters: ['wild', 'noshiny']},
	litten: {encounters: ['wild', 'noshiny']},
	torracat: {encounters: ['wild', 'noshiny']},
	incineroar: {encounters: ['wild', 'noshiny']},
	popplio: {encounters: ['wild', 'noshiny']},
	brionne: {encounters: ['wild', 'noshiny']},
	primarina: {encounters: ['wild', 'noshiny']},
	pikipek: {encounters: ['wild', 'noshiny']},
	trumbeak: {encounters: ['wild', 'noshiny']},
	toucannon: {encounters: ['wild', 'noshiny']},
	yungoos: {encounters: ['wild']},
	gumshoos: {encounters: ['wild']},
	grubbin: {encounters: ['wild', 'noshiny']},
	charjabug: {encounters: ['wild', 'noshiny']},
	vikavolt: {encounters: ['wild', 'noshiny']},
	crabrawler: {encounters: ['wild', 'noshiny']},
	crabominable: {encounters: ['wild', 'noshiny']},
	oricorio: {encounters: ['wild', 'noshiny']},
	cutiefly: {encounters: ['wild', 'noshiny']},
	ribombee: {encounters: ['wild', 'noshiny']},
	rockruff: {encounters: ['wild']},
	lycanroc: {encounters: ['wild']},
	lycanrocmidnight: {encounters: ['wild']},
	mareanie: {encounters: ['wild', 'noshiny']},
	toxapex: {encounters: ['wild', 'noshiny']},
	dewpider: {encounters: ['wild', 'noshiny']},
	araquanid: {encounters: ['wild', 'noshiny']},
	fomantis: {encounters: ['wild']},
	lurantis: {encounters: ['wild']},
	morelull: {encounters: ['wild', 'noshiny']},
	shiinotic: {encounters: ['wild', 'noshiny']},
	salandit: {encounters: ['12kmegg', 'noshiny']},
	salazzle: {encounters: ['12kmegg', 'noshiny']},
	stufful: {encounters: ['wild']},
	bewear: {encounters: ['wild']},
	bounsweet: {encounters: ['wild', 'noshiny']},
	steenee: {encounters: ['wild', 'noshiny']},
	tsareena: {encounters: ['wild', 'noshiny']},
	comfey: {encounters: ['wild', 'noshiny']},
	oranguru: {encounters: ['wild', 'noshiny']},
	wimpod: {encounters: ['wild', 'noshiny']},
	golisopod: {encounters: ['wild', 'noshiny']},
	sandygast: {encounters: ['raid', 'research', 'noshiny']},
	palossand: {encounters: ['raid', 'research', 'noshiny']},
	turtonator: {encounters: ['raid']},
	togedemaru: {encounters: ['wild', 'noshiny']},
	bruxish: {encounters: ['wild', 'noshiny']},
	jangmoo: {encounters: ['wild', 'noshiny']},
	hakamoo: {encounters: ['wild', 'noshiny']},
	kommoo: {encounters: ['wild', 'noshiny']},
	tapukoko: {encounters: ['raid']},
	tapulele: {encounters: ['raid']},
	tapubulu: {encounters: ['raid']},
	tapufini: {encounters: ['raid']},
	cosmog: {encounters: ['research', 'noshiny', 'specialtrade']},
	cosmoem: {encounters: ['research', 'noshiny', 'specialtrade']},
	solgaleo: {encounters: ['research', 'noshiny', 'specialtrade']},
	lunala: {encounters: ['research', 'noshiny', 'specialtrade']},
	nihilego: {encounters: ['raid', 'research', 'specialtrade']},
	buzzwole: {encounters: ['raid', 'research', 'noshiny', 'specialtrade']},
	pheromosa: {encounters: ['raid', 'research', 'noshiny', 'specialtrade']},
	xurkitree: {encounters: ['raid', 'research', 'noshiny', 'specialtrade']},
	celesteela: {encounters: ['raid', 'research', 'noshiny', 'specialtrade']},
	kartana: {encounters: ['raid', 'research', 'noshiny', 'specialtrade']},
	guzzlord: {encounters: ['raid', 'research', 'noshiny', 'specialtrade']},
	meltan: {encounters: ['wild']},
	melmetal: {encounters: ['wild']},
	skwovet: {encounters: ['wild', 'noshiny']},
	greedent: {encounters: ['wild', 'noshiny']},
	obstagoon: {encounters: ['wild']},
	perrserker: {encounters: ['7kmegg', 'raid', 'research']},
	sirfetchd: {encounters: ['wild', 'raid', 'research', 'nowildshiny']},
	mrrime: {encounters: ['wild', '7kmegg', 'research', 'no7kmeggshiny', 'nowildshiny']},
	runerigus: {encounters: ['7kmegg', 'raid', 'research']},
	falinks: {encounters: ['wild', 'noshiny']},
	zacian: {encounters: ['raid', 'noshiny', 'specialtrade']},
	zamazenta: {encounters: ['raid', 'noshiny', 'specialtrade']},
	zarude: {encounters: ['research', 'noshiny', 'notrade']},
	regieleki: {encounters: ['raid', 'noshiny', 'specialtrade']},
	regidrago: {encounters: ['raid', 'noshiny', 'specialtrade']},
	kleavor: {encounters: ['wild']},
	ursaluna: {encounters: ['wild']},
	sneasler: {encounters: ['wild', 'noshiny']},
	overqwil: {encounters: ['wild', 'noshiny']},
	gimmighoulroaming: {encounters: ['wild', 'noshiny']},
	gholdengo: {encounters: ['wild', 'noshiny']},
};
