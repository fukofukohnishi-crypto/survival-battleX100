export default function Home() {
  return (
    <div className="flex flex-1 items-center justify-center bg-zinc-50 px-6 font-sans dark:bg-black">
      <main className="flex w-full max-w-2xl flex-col gap-6">
        <p className="font-mono text-sm uppercase tracking-widest text-zinc-500">
          survival-battleX100
        </p>
        <h1 className="text-4xl font-semibold tracking-tight text-black dark:text-zinc-50">
          セットアップ完了
        </h1>
        <p className="text-lg leading-8 text-zinc-600 dark:text-zinc-400">
          Next.js（App Router）+ TypeScript + Tailwind CSS の土台を用意しました。
          Vercel に接続すると、このブランチへの push がそのままデプロイされます。
        </p>
        <p className="text-sm text-zinc-500">
          ここを編集するには{" "}
          <code className="rounded bg-black/[.06] px-1.5 py-0.5 font-mono text-[0.9em] dark:bg-white/[.08]">
            src/app/page.tsx
          </code>
        </p>
      </main>
    </div>
  );
}
