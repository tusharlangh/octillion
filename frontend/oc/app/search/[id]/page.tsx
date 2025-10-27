import Header from "@/components/searchManager/header";

interface SearchPageProps {
  params: {
    id: string; // Next.js route params are always strings
  };
}

export default async function SearchPage({ params }: SearchPageProps) {
  const id = params.id;

  const originalUrl =
    "https://octillion-s3-bucket.s3.ca-central-1.amazonaws.com/98576953-7a15-4e2b-9471-963e9227912c-0-sample.pdf?X-Amz-Algorithm=AWS4-HMAC-SHA256&X-Amz-Content-Sha256=UNSIGNED-PAYLOAD&X-Amz-Credential=AKIAYSVAPBFRTI3IKNGE%2F20251026%2Fca-central-1%2Fs3%2Faws4_request&X-Amz-Date=20251026T194039Z&X-Amz-Expires=86400&X-Amz-Signature=d3b2d992393fc6c322bab387c7500aa6c1411b1e28371b6e308b98bc7f342443&X-Amz-SignedHeaders=host&x-amz-checksum-mode=ENABLED&x-id=GetObject";

  return (
    <main>
      <Header id={id} />
    </main>
  );
}
