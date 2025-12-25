import { Fraunces, Space_Grotesk, Quicksand } from 'next/font/google';

export const quicksand = Quicksand({
  subsets: ['latin'],
  display: 'swap',
  variable: '--font-script',
});

export const spaceGrotesk = Space_Grotesk({
  subsets: ['latin'],
  display: 'swap',
  variable: '--font-sans',
});



export const fraunces = Fraunces({
  subsets: ['latin'],
  display: 'swap',
  variable: '--font-display',
});

export const appFonts = {
  sans: spaceGrotesk,
  display: fraunces,
  script: quicksand,
};

export const fontFamily = {
  sans: spaceGrotesk.style.fontFamily,
  display: fraunces.style.fontFamily,
  script: quicksand.style.fontFamily,
};