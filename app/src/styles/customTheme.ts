import {theme, extendTheme} from '@chakra-ui/react';
import {createBreakpoints} from '@chakra-ui/theme-tools';

const breakpoints = createBreakpoints({
    sm: '425px',
    md: '768px',
    lg: '1080px',
    xl: '1280px',
    '2xl': '1440px'
});

const customTheme = extendTheme({
    fonts: {
        ...theme.fonts,
        heading: `'VP', ${
            theme.fonts.heading
        }`,
        body: `'VP', ${
            theme.fonts.body
        }`,
        mono: 'Menlo, monospace'
    },
    global: {
        'html, body': {
            lineHeight: 'tall',
            color: "white"
        }
    },
    fontSizes: {
        xs: '1.25rem',
        sm: '1.375rem',
        md: '1.5rem',
        lg: '1.625rem',
        xl: '1.75rem',
        '2xl': '2rem',
        '3xl': '2.375rem',
        '4xl': '3.75rem',
        '5xl': '3.5rem',
        '6xl': '4.25rem',
        '7xl': '5rem',
        '8xl': '6.5rem',
        '9xl': '8.5rem'
    },
    breakpoints,
    colors: {
        ...theme.colors,
        purple: {
            50: 'rgb(14, 7, 29)',
            100: '#181030',
            200: '#181030',
            300: '#352561',
            400: '#352561',
            500: '#372a70',
            600: '#372a70',
            700: '#7c41ea',
            800: '#B2A8F1',
            900: 'rgb(178, 168, 241)'
        }
    },
    components: {
        Heading: {
            sizes: {
                '4xl': {
                    marginBottom: '1.5rem'
                },
                '2xl': {
                    marginBottom: '1.5rem'
                },
                xl: {
                    marginBottom: '1.5rem'
                },
                lg: {
                    marginBottom: '1.5rem'
                },
                md: {
                    marginBottom: '1rem'
                },
                sm: {
                    marginBottom: '0.5rem'
                },
                xs: {
                    marginBottom: '0.5rem'
                }
            }
        },
        Text: {
            baseStyle: {
                fontSize: 'md'
            }
        },
        Button: {
            sizes: {
                md: {
                    fontSize: 'sm',
                    px: '16px',
                    pt: '1px',
                    pb: '4px',
                    h: '40px'
                }
            },
            variants: {
                solid: {
                    color: 'white',
                    bg: '#7c41ea',
                    boxShadow: '0 -3px 0 0 #703bd3, 0 3px 0 0 #4c2398, -3px 0 0 0 #6331c0, 3px 0 0 0 #6331c0, 0 0 0 3px #0f0c1b, 0 -6px 0 0 #0f0c1b, 0 6px 0 0 #0f0c1b, -6px 0 0 0 #0f0c1b, 6px 0 0 0 #0f0c1b',
                    borderRadius: '1px',
                    _focus: {
                        boxShadow: '0 -3px 0 0 #703bd3, 0 3px 0 0 #4c2398, -3px 0 0 0 #6331c0, 3px 0 0 0 #6331c0, 0 0 0 3px #0f0c1b, 0 -6px 0 0 #0f0c1b, 0 6px 0 0 #0f0c1b, -6px 0 0 0 #0f0c1b, 6px 0 0 0 #0f0c1b'
                    },
                    _active: {
                        bg: '#7c41ea'
                    },
                    _hover: {
                        bg: '#7c41ea',
                        transform: 'scale(1.07)',
                        _disabled: {
                            bg: '#7c41ea',
                            transform: 'none'
                        }
                    },
                    _disabled: {
                        opacity: 1,
                        boxShadow: '0 -3px 0 0 #703bd3, 0 3px 0 0 #4c2398, -3px 0 0 0 #6331c0, 3px 0 0 0 #6331c0, 0 0 0 3px #0f0c1b, 0 -6px 0 0 #0f0c1b, 0 6px 0 0 #0f0c1b, -6px 0 0 0 #0f0c1b, 6px 0 0 0 #0f0c1b'
                    }
                }
            }
        }
    }
});

export default customTheme;
