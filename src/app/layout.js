import { Inter } from "next/font/google";
import "./globals.css";
import "bootstrap/dist/css/bootstrap.css";
import "react-datepicker/dist/react-datepicker.css";
import "leaflet-draw/dist/leaflet.draw.css";
import "../bootstrap-extension.css";
import "../index.css";

const inter = Inter({ subsets: ["latin"] });

export const metadata = {
  title: "Met Data Portal",
  description: "Station data download tool",
};

export default function RootLayout({ children }) {
  return (
    <html lang="en">
      <body className={inter.className}>{children}</body>
    </html>
  );
}
