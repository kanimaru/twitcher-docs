import { defineConfig } from 'vitepress'

// https://vitepress.dev/reference/site-config
export default defineConfig({
  title: "Twitcher Doc",
  description: "Documentation for Twitcher",
  head: [
    [
      'link', { rel: 'preconnect', href: 'https://fonts.googleapis.com' }
    ],
    [
      'link', { rel: 'preconnect', href: 'https://fonts.gstatic.com', crossorigin: '' }
    ],
    [
      'link', { href: "https://fonts.googleapis.com/css2?family=Quicksand:wght@300..700&display=swap", rel: 'stylesheet' }
    ]

  ],
  themeConfig: {
    // https://vitepress.dev/reference/default-theme-config
    nav: [
      { text: 'Home', link: '/' },
      { text: 'Docs', link: '/guide/what-is-it' },
      { text: 'FAQ', link: '/additional/faq' },
    ],

    sidebar: [
      {
        text: 'Introduction',
        items: [
          { text: 'Overview', link: '/guide/what-is-it' },
          { text: 'Getting Started', link: '/guide/getting-started' },
          { text: 'FAQ', link: '/additional/faq.md' }
        ]
      },
      {
        text: 'Core Nodes',
        items: [
          { text: 'Chat', link: '/guide/twitch-chat.md' },
          { text: 'Command', link: '/guide/twitch-command.md' },
          { text: 'EventListener', link: '/guide/twitch-event-listener.md' },
          { text: 'ImageTransformer', link: '/guide/twitch-image-transformer.md' },
          { text: 'MediaLoader', link: '/guide/twitch-media-loader.md' },
          { text: 'Service', link: '/guide/twitch-service.md' },
          { text: 'Irc', link: '/guide/twitch-irc.md' },
          { text: 'IrcChannel', link: '/guide/twitch-irc-channel.md' },
        ]
      },
      {
        text: 'Additional Features',
        items: [
          { text: 'BufferedHttpClient', link: '/additional/buffered-http-client.md' },
          { text: 'Websocket', link: '/additional/websocket.md' },
          { text: 'SpriteFrameEffect', link: '/additional/sprite-frame-effect.md' },
        ]
      },
      {
        text: 'Showcase',
        link: 'showcase'
      }
    ],

    socialLinks: [
      { icon: 'github', link: 'https://github.com/kanimaru/twitcher' }
    ]
  }
})
