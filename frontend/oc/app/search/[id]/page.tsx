import Header from "@/components/searchManager/header";
interface SearchPageProps {
  params: {
    id: string; // Next.js route params are always strings
  };
}

export default async function SearchPage({ params }: SearchPageProps) {
  const id = await params.id;

  return (
    <main>
      <Header id={id} />
    </main>
  );
}
