import { Card } from "../components/ui/Card";

export function MapPlaceholder() {
  return (
    <section className="px-4 py-8 max-w-4xl mx-auto">
      <h1 className="text-3xl font-extrabold text-sky-dark mb-4">Peta Indonesia</h1>
      <Card>
        <p className="text-gray-600">
          Peta interaktif Indonesia akan tersedia pada Fase 2. Saat ini ini adalah placeholder.
        </p>
      </Card>
    </section>
  );
}