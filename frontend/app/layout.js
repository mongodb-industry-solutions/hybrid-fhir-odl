import './globals.css'
import Providers from './providers'

export const metadata = {
  title: 'MongoDB Hybrid FHIR ODL',
  description: "MongoDB's proposed hybrid Operational Data Layer (ODL) for FHIR-based healthcare data integration and interoperability",
};

export default function RootLayout({ children }) {
  return (
    <html lang="en">
      <head>
        <link id="app-favicon" rel="icon" href="/fhir-icon.svg" />
      </head>
      <body>
        <Providers>{children}</Providers>
      </body>
    </html>
  );
}
