import { PythonEditor } from "@/components/PythonEditor";

export const metadata = { title: "Playground · Diggle Coding Club" };

const STARTER = `# Try me! Press Run.
print("Hello from Python!")

name = "coder"
print("Nice to meet you,", name)

for i in range(1, 4):
    print(i, "cheers!")
`;

export default function PlaygroundPage() {
  return (
    <main className="mx-auto w-full max-w-2xl flex-1 p-5">
      <h1 className="mb-1 text-2xl font-bold">🐍 Python Playground</h1>
      <p className="mb-4 text-sm opacity-70">
        A scratch space for trying things out. Nothing here is saved.
      </p>
      <PythonEditor starter={STARTER} minHeight={260} />
    </main>
  );
}
