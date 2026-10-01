export const metadata = {
  title: 'Academic Portal',
  description: 'School Management System',
  manifest: '/manifest.json',
  themeColor: '#000080',
};

export default function RootLayout({ children }) {
  return (
    <html lang="en">
      <body style={{ margin: 0, padding: 0 }}>
        {children}
      </body>
    </html>
  );
}
