export const metadata = {
  title: 'TTS App',
  description: 'Text-to-Speech app using Web Speech API',
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="id">
      <body className="min-h-screen bg-gray-50 text-gray-900">
        {children}
      </body>
    </html>
  );
}
