import { ThemeProvider } from "@/components/layout/theme-provider";

export default function EditorLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return <ThemeProvider>{children}</ThemeProvider>;
}
