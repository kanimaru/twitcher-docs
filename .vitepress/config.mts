import { defineConfig } from 'vitepress'

// https://vitepress.dev/reference/site-config
export default defineConfig({
  title: "Twitcher Doc",
  description: "Documentation for Twitcher",
  themeConfig: {
    // https://vitepress.dev/reference/default-theme-config
    nav: [
      { text: 'Home', link: '/' },
      { text: 'Docs', link: '/guide/what-is-it' }
    ],

    sidebar: [
      {
        text: 'Introduction',
        items: [
          {text: 'Introduction', link: '/guide/what-is-it'},
          {text: 'Getting Started', link: '/guide/getting-started'},
        ]
      },
      {
        text: 'Guide',
        items: [
          { text: 'Authentication', link: '/guide/authentication' },
        ]
      },
      {
        text: 'Core Nodes',
        items: [
          { text: 'Chat', link: '/guide/twitch-chat.md' },
          { text: 'Command', link: '/guide/twitch-command.md' },
          { text: 'EventListener', link: '/guide/twitch-event-listener.md' },
          { text: 'ImageTransformer', link: '/guide/twitch-image-transformer.md' },
          { text: 'Irc', link: '/guide/twitch-irc.md' },
          { text: 'IrcChannel', link: '/guide/twitch-irc-channel.md' },
          { text: 'MediaLoader', link: '/guide/twitch-media-loader.md' },
          { text: 'Service', link: '/guide/twitch-service.md' }
        ]
      }
    ],

    socialLinks: [
      { icon: 'github', link: 'https://github.com/kanimaru/twitcher' }
    ]
  }
})
