export default function Home() {
  return (
    <main className="flex flex-1 items-center justify-center bg-zinc-50 px-6 dark:bg-black">
      <section className="flex w-full max-w-sm flex-col items-center text-center">
        <div className="flex h-24 w-24 items-center justify-center rounded-full bg-zinc-900 text-3xl font-bold text-white dark:bg-zinc-100 dark:text-zinc-900">
          이
        </div>
        <h1 className="mt-6 text-3xl font-bold tracking-tight text-zinc-900 dark:text-zinc-50">
          이대건
        </h1>
        <p className="mt-3 text-base leading-7 text-zinc-600 dark:text-zinc-400">
          안녕하세요! 바이브 코딩을 배우고 있는 대학생입니다.
        </p>
      </section>
    </main>
  );
}
