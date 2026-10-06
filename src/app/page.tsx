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
          움직임으로 이야기를 전하는 모션그래픽 디자이너입니다.
          <br />
          브랜드의 메시지를 감각적인 영상으로 만듭니다. 🎬
        </p>
      </section>
    </main>
  );
}
