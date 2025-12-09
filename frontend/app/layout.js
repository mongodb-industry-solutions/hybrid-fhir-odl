import './globals.css'

export const metadata = {
  title: 'MongoDB Healthcare Data Lab - FHIR Data Management Platform',
  description: 'FHIR Data Management Platform - MongoDB Healthcare Data Lab for clinical data integration and interoperability',
};

export default function RootLayout({ children }) {
  return (
    <html lang="en">
      <head>
        <link id="app-favicon" rel="icon" href="/fhir-icon.svg" />
      </head>
      <body>
        {children}
      </body>
    </html>
  );
}
