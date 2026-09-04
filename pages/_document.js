import { Html, Head, Main, NextScript } from 'next/document';
export default function Document() {
  return (
    <Html lang="fr">
      <Head>
        <meta charSet="utf-8" />
        <link rel="manifest" href="/manifest.json" />
        <meta name="theme-color" content="#1a1a2e" />
        <link rel="icon" href="/icons/icon-192.svg" />
        <meta name="description" content="Catalogue+ - Catalogue numerique de bibliotheque par QR Code, projet ESPA 2eme annee." />
        <link rel="preconnect" href="https://fonts.googleapis.com" />
        <link href="https://fonts.googleapis.com/css2?family=Poppins:wght@300;400;500;600;700;800&family=Inter:wght@400;500;600;700&display=swap" rel="stylesheet" />
      </Head>
      <body><Main /><NextScript /></body>
    </Html>
  );
}
