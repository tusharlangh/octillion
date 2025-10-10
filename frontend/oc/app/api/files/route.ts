export async function POST(request: Request) {
  try {
    const { files } = await request.json();

    const res = await fetch(`${process.env.BACKEND_URL}/parse-files`, {
      method: "POST",
      headers: { "Content-type": "application/json" },
      body: JSON.stringify({ files }),
    });

    const data = await res.json();

    if (!data) console.log("Nothing appeared");
    //console.log("it worked from next api");

    return Response.json({ message: "it worked" });
  } catch (error) {
    console.error(error);
    return Response.json({ message: "did not work" });
  }
}
