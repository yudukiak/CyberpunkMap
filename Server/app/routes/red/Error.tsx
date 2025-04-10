import { HumanDinosaur } from "react-kawaii";

export default function Error() {
  return (
    <main className="text-white">
      <section className="h-screen flex flex-col justify-center items-center text-center">
        <HumanDinosaur size={200} mood="sad" color="#ffb3ba" />
        <h1 className="text-7xl tracking-tight font-extrabold text-indigo-400 ">
          Oops!
        </h1>
        <h2 className="text-3xl tracking-tight font-bold  mt-4">
          なにかがおかしいようです……
        </h2>
      </section>
    </main>
  );
}