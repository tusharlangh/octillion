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
    <main className="bg-[#F5F5F7] dark:bg-[#0B0B0C] h-full w-full">
      <section
        about="central"
        className="flex flex-col relative h-full bg-white dark:bg-[#0B0B0C] w-full md:rounded-[10px] shadow-sm pt-10 md:pt-0"
      >
        <SearchManager>
          <Header id={id} />
          <Result />
        </SearchManager>
      </section>
    </main>
  );
}
