import Header from "@/components/Header";
import "@/styles/globals.css";
import type { AppProps } from "next/app";
import { AuthProvider } from "@/context/authContext";
import { Toaster } from "react-hot-toast";
export default function App({ Component, pageProps }: AppProps) {
  return (
    <AuthProvider>
      <Header />
      <Component {...pageProps} />
      <Toaster
        position="top-center"
        reverseOrder={false}
        toastOptions={{
          duration: 2000,
          style: {
            fontSize: "1.5rem",
          },
        }}
      />
    </AuthProvider>
  );
}
