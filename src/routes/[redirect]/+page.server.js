const links = {
	donate: 'https://ko-fi.com/colloquial'
};

export function load({ params }) {
	return {url: links[params.redirect]};
}