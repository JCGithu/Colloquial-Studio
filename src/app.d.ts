// See https://kit.svelte.dev/docs/types#app
// for information about these interfaces

// and what to do when importing types
declare namespace App {
	// interface Error {}
	// interface Locals {}
	// interface PageData {}
	// interface Platform {}
}

type ChatterParameters = {
	channel: string;
	font: string;
	fontsize: any;
	align: string;
	chatcolour: string;
	highcolour: string;
	bgcolour: string;
	fontcolour: string;
	bgopacity: number;
	chatopacity: any;
	togglecol: boolean;
	animation: string;
	badges: string | boolean;
	border: any;
	bttv: string | boolean;
	ffz: string | boolean;
	hidebot: any;
	hidecom: any;
	pronouns: string | boolean;
	direction: string;
	animTime: number;
	animEase: string;
	highlight: string | boolean;
	emoteOnly: string | boolean;
	nameCustom: string | boolean;
	bubbleCustom: boolean;
	splitLetters: boolean;
	banner: boolean;
	proFont: string;
	proOutline: number;
	proBG: number;
	proUseCol: boolean | string;
	proOutColour: string,
	proBGColour: string,
	proColour: string;
	replies: boolean | string;
	links: boolean | string;
	removeChats: boolean | string;
	wideEmotes: boolean;
	points: boolean | string;
	removeTime: any;
	version: number;
	intro: boolean;
	shrink: boolean;
	padding: number;
	limit: number;
}

type EmoteDropParameters = {
	channel: string;
	limit: number;
	scale: number;
	bounce: number;
	friction: number;
	gravity: number;
	quality: number;
	shape: number;
	time: number;
	timeon: boolean;
	random: boolean;
	animated: boolean;
	modWipe: boolean;
	version: number;
	intro: boolean
}


//STREAM TOOLS
interface streamToolSelect {
	'chatter': ChatterParameters;
	'emotedrop': EmoteDropParameters;
}
type streamToolNames = keyof streamToolSelect;
type streamToolParameters = streamToolSelect[streamToolNames];
type streamToolCombined = ChatterParameters & EmoteDropParameters

type streamToolTotalStorage = {
	'chatter': streamToolAppStorage['chatter'],
	'emotedrop': streamToolAppStorage['emotedrop'],
}

type streamToolAppStorage<T extends streamToolNames> = {
	'inProgress': streamToolSelect[T];
	[x: number]: streamToolSelect[T];
	'reload': number;
};

// TOAST
type toast = {
	message: string,
	id: number,
	code: string,
}

type toastUpdate = (msg: string, code: string) => void

type Tags = ChatUserstate | SubUserstate;

//CHATTER
type MessageChunk = {
	code?: string;
	text: string;
	num?: number;
}

type Message = {
	pronoun: string | undefined;
	message: Array<MessageChunk>;
	user: string;
	color: string;
	tags: Tags;
	type: string;
	time: number;
}

interface BadgeData {
	[key: string]: BadgeSet
};

interface BadgeSet {
	versions: {
		[key: string]: {
			'last_updated'?: string | null,
			[key: string]: string,
		}
	}
}

interface bttvEmote {
	id: string,
	code: string,
	imageType: string,
	userId: string
}

interface ffzEmote {
	name: string,
	urls: Record<string, string>
}

interface ffzData {
	[x: string]: {
		id: number,
		_type: number,
		icon: null,
		title: string,
		css: null,
		emoticons: Array<ffzEmote>
	}
}

interface appDetails {
	title: string,
	name: streamToolNames,
	description: string,
}

//Emote Drop
type RAPIER = typeof import("@dimforge/rapier2d");
type mappedEmote = { shape: Collider, body: RigidBody, curr: PIXI.Sprite, time: number }

//Games
interface gameSelect {
	twordle: TwordleParameters;
}
interface gameStatSelect {
	twordle: TwordleStats;
}
type gameNames = keyof gameSelect;
type gameParameters = gameSelect[gameNames];
type gameStats = gameStatSelect[gameNames];
//type gameCombined = ChatterParameters & EmoteDropParameters

type gameTotalStorage = {
	twordle: {
		settings: TwordleParameters,
		stats: TwordleStats
	}
}


//TWORDLE
interface TwordleGame {
	round: number,
	letter: number,
	timer: number,
	message: string,
	currentGuess: string,
	guess: Array<Array<string>>,
	answer: string,
	votes: number,
	menu: number,
	state: 'START' | 'OPENING' | 'POLL' | 'RETRY' | 'NEXTROUND' | 'REVEAL' | 'NEXTLINE' | 'SUCCESS' | 'FAIL',
	connected: boolean
}

type TwordleParameters = {
	auto: boolean,
	dark: boolean,
	keyboard: boolean,
	volume: number,
	timer: number,
	channel: string,
	language: string,
	mode: 'words' | 'letters',
	words: 'all' | 'movies' | 'gaming' | 'food',
	version: number
}
type TwordleStats = {
	play: number,
	won: number,
	votes: number,
}

interface FontData {
	family: string,
	fullName: string,
	postscriptName: string,
	style: string
}

interface ParsedFont {
	name: string,
	style: string
}
