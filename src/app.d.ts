// See https://kit.svelte.dev/docs/types#app
// for information about these interfaces

// and what to do when importing types
declare namespace App {
	// interface Error {}
	// interface Locals {}
	// interface PageData {}
	// interface Platform {}
}

interface MessageChunk {
  code: string | null;
  text: string;
  num?: number | undefined;
}

interface Message {
  pronoun: string | undefined;
	message: string | Array<MessageChunk>;
	user: string;
	color: string;
	tags: Tags;
	type: string;
}

interface Tags {
  bits?: number | undefined;
  testing: boolean;
  username: string | undefined;
  "reply-parent-display-name"?: string | undefined;
  "room-id": string | undefined;
	"display-name": string;
	color: string | undefined;
	id: string;
	emotes:{[key:number]:Array<string>} | null;
	badges:{[key:string]:number};
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

interface bttvEmoteIndividual {
	id: string,
	code: string,
	imageType: string,
	userId: string
}

interface appDetails {
	title: string,
	name: string,
	description: string
}