// See https://kit.svelte.dev/docs/types#app
// for information about these interfaces

// and what to do when importing types
declare namespace App {
	// interface Error {}
	// interface Locals {}
	// interface PageData {}
	// interface Platform {}
}

interface svelteInput {
	target:HTMLInputElement
}

interface standardObject {
	[x:string]: any
}

interface streamToolAppStorage {
	'inProgress': standardObject,
	'loaded': standardObject,
	[x:number]: standardObject
}

interface streamToolStorage {
	[x:string]: streamToolAppStorage
}

interface toast {
	message: string,
	id: number,
	code?:string,
}

//CHATTER
interface MessageChunk {
  code?: string;
  text: string;
  num?: number;
}

interface Message {
  pronoun: string | undefined;
	message: Array<MessageChunk>;
	user: string;
	color: string;
	tags: Tags;
	type: string;
}

interface Tags {
  bits?: number | undefined;
  username: string;
  "reply-parent-display-name"?: string | undefined;
  "room-id": string | undefined;
	"display-name": string;
	color: string | undefined;
	id: string;
	"msg-id": string;
	turbo: boolean;
	emotes?:{[key:number]:Array<string>};
	badges:{
		[key:string]:number,
		vip?:number
	};
	'first-msg': boolean,
	mod: boolean,
	"custom-reward-id"?: string
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
	urls:{
		[x:string]:string
	}
}

interface ffzData {
	[x:string]:{
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
	name: string,
	description: string
}


//TWORDLE
interface TwordleStyle{
	[x:string]:{
		[x:string]: string
	}
}

interface TwordlePoll {
	[x:string]: number
}

interface TwordleKeys {
	[x:string]:Array<Array<string>>
}

interface TwordleGame{
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

interface TwordleStorage {
	play: number,
  won: number,
  votes: number,
  auto: boolean,
  dark: boolean,
  keyboard: boolean,
  volume: number,
  timer: number,
  channel: string,
	words: 'all' | 'movies' | 'games' | 'food',
}