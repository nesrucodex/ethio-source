import { InstallApp } from "@/components/shared/pwa";
export const metadata = { title: "Install EthioSource" };
export default function Page() {
  return (
    <article className="prose-page">
      <p className="eyebrow">ALWAYS A LITTLE CLOSER</p>
      <h1>Make room for good things.</h1>
      <InstallApp />
    </article>
  );
}
