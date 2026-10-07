import Sidebar from "@/components/_common/sidebar/sidebar";
import Shell from "@/components/shell";

export default function Home() {
  return (
    <main className="flex h-dvh max-w-full overflow-hidden">
      <Sidebar />
      <Shell />
    </main>
  );
}
