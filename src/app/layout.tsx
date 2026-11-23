import "./globals.css";
import Providers from "@/components/Providers";
import Nav from "@/components/Nav";

export const metadata = { title: "EmprendeTech", description: "PMV de la plataforma de emprendedores locales de Bogotá" };

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="es">
      <body>
        <Providers>
          <Nav />
          <main>{children}</main>
        </Providers>
      </body>
    </html>
  );
}
