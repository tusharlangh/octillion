import Header from "@/components/searchManager/header";
import Result from "@/components/searchManager/result";
import SearchManager from "@/components/searchManager/searchManger";

interface SearchPageProps {
  params: {
    id: string; // Next.js route params are always strings
  };
}

export default async function SearchPage({ params }: SearchPageProps) {
  const id = params.id;

  return (
    <main>
      <SearchManager>
        <Header id={id} />
        <Result />
      </SearchManager>
    </main>
  );
}
