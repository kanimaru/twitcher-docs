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
      { text: 'Docs', link: '/core-nodes/what-is-it' },
      { text: 'FAQ', link: '/additional/faq' },
    ],

    sidebar: [
      {
        text: 'Introduction',
        items: [
          { text: 'Overview', link: '/introduction/what-is-it' },
          { text: 'Getting Started', link: '/introduction/getting-started' },
          { text: 'FAQ', link: '/introduction/faq.md' }
        ]
      },
      {
        text: 'Core Nodes',
        items: [
          { text: 'Chat', link: '/core-nodes/twitch-chat.md' },
          { text: 'Command', link: '/core-nodes/twitch-command.md' },
          { text: 'EventListener', link: '/core-nodes/twitch-event-listener.md' },
          { text: 'ImageTransformer', link: '/core-nodes/twitch-image-transformer.md' },
          { text: 'MediaLoader', link: '/core-nodes/twitch-media-loader.md' },
          { text: 'Service', link: '/core-nodes/twitch-service.md' },
          { text: 'Irc', link: '/core-nodes/twitch-irc.md' },
          { text: 'IrcChannel', link: '/core-nodes/twitch-irc-channel.md' },
        ]
      },
      {
        text: 'Editor Support',
        items: [
          { text: 'Editor Authorization', link: '/editor/editor-authorization.md' },
          { text: 'Twitch User', link: '/editor/twitch-user.md' },
          { text: 'Eventsub', link: '/editor/editor-eventsub.md' },
          { text: 'Scopes', link: '/editor/editor-scopes.md' },
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
  },
  ignoreDeadLinks: [
    /^https?:\/\/localhost/,
  ]
})
