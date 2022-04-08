export const title = 'Raid Party Death roll'
const description = 'Raid Party Death roll is a mini-game where you play with your hard-earned CFTI.'
const url = 'https://raid.party'

const SEO = {
    title,
    description,
    canonical: url,
    openGraph: {
        type: 'website',
        url,
        title,
        description,
        images: [
            {
                url: `https://raid.party/images/logo.png`,
                alt: title,
                width: 660,
                height: 190
            },
        ]
    },
    twitter: {
        cardType: 'summary_large_image',
        handle: '@xanecrypto',
        site: '@xanecrypto'
    },
    additionalLinkTags: [
        {
            rel: 'icon',
            href: '/favicon.png'
        }
    ]
}

export default SEO
