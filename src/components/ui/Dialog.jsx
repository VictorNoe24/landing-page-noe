import * as Dialog from "@radix-ui/react-dialog";

export default function MyDialog() {
  return (
    <Dialog.Root>
      <Dialog.Trigger className="rounded bg-black px-4 py-2 text-white">
        Open Modal
      </Dialog.Trigger>

      <Dialog.Portal>
        <Dialog.Overlay className="fixed inset-0 bg-black/50" />
        <Dialog.Content className="fixed left-1/2 top-1/2 rounded-xl bg-white p-6 -translate-x-1/2 -translate-y-1/2">
          <Dialog.Title>Hola 👋</Dialog.Title>
        </Dialog.Content>
      </Dialog.Portal>
    </Dialog.Root>
  );
}
