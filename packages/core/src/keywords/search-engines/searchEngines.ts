export type SearchEngine = {
  readonly name: string
  readonly hostFragment: string
  readonly hostPattern: RegExp
  readonly pathPattern: RegExp
  readonly queryParameters: readonly string[]
}

const ANY_PATH = /^\//
const VERTICAL_SEARCH_PATH = /^\/(search|images|videos|news)\/?$/

export const SEARCH_ENGINES: readonly SearchEngine[] = [
  {
    name: 'Google',
    hostFragment: 'google.',
    hostPattern: /^([a-z0-9-]+\.)?google\.[a-z]{2,3}(\.[a-z]{2})?$/,
    pathPattern: /^\/search\/?$/,
    queryParameters: ['q'],
  },
  {
    name: 'Bing',
    hostFragment: 'bing.com',
    hostPattern: /^([a-z0-9-]+\.)?bing\.com$/,
    pathPattern: /^(\/(images|videos|news|maps))?\/search\/?$/,
    queryParameters: ['q'],
  },
  {
    name: 'DuckDuckGo',
    hostFragment: 'duckduckgo.com',
    hostPattern: /^(www\.|html\.|lite\.)?duckduckgo\.com$/,
    pathPattern: ANY_PATH,
    queryParameters: ['q'],
  },
  {
    name: 'Yahoo',
    hostFragment: 'search.yahoo.com',
    hostPattern: /^([a-z-]+\.)?search\.yahoo\.com$/,
    pathPattern: /^\/search(\/|$)/,
    queryParameters: ['p', 'q'],
  },
  {
    name: 'Brave',
    hostFragment: 'search.brave.com',
    hostPattern: /^search\.brave\.com$/,
    pathPattern: VERTICAL_SEARCH_PATH,
    queryParameters: ['q'],
  },
  {
    name: 'Ecosia',
    hostFragment: 'ecosia.org',
    hostPattern: /^(www\.)?ecosia\.org$/,
    pathPattern: VERTICAL_SEARCH_PATH,
    queryParameters: ['q'],
  },
  {
    name: 'YouTube',
    hostFragment: 'youtube.com',
    hostPattern: /^(www\.|m\.|music\.)?youtube\.com$/,
    pathPattern: /^\/(results|search)\/?$/,
    queryParameters: ['search_query', 'q'],
  },
  {
    name: 'Yandex',
    hostFragment: 'yandex.',
    hostPattern: /^(www\.)?yandex\.[a-z]{2,3}(\.[a-z]{2})?$/,
    pathPattern: /^\/(search|images|video)(\/|$)/,
    queryParameters: ['text'],
  },
  {
    name: 'Startpage',
    hostFragment: 'startpage.com',
    hostPattern: /^(www\.)?startpage\.com$/,
    pathPattern: /^\/(sp\/)?search\/?$/,
    queryParameters: ['query', 'q'],
  },
  {
    name: 'Qwant',
    hostFragment: 'qwant.com',
    hostPattern: /^(www\.)?qwant\.com$/,
    pathPattern: ANY_PATH,
    queryParameters: ['q'],
  },
  {
    name: 'Baidu',
    hostFragment: 'baidu.com',
    hostPattern: /^(www\.|m\.)?baidu\.com$/,
    pathPattern: /^\/s\/?$/,
    queryParameters: ['wd', 'word'],
  },
]
