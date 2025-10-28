'use client'

import {
  createContext,
  useContext,
  useRef,
  useState,
  useCallback,
  ReactNode,
} from 'react'

interface DialogData {
  id: string
  title: string
  onConfirm: (id: string) => void
}

interface DialogContextType {
  openDialog: (data: DialogData) => void
  closeDialog: () => void
}

const DialogContext = createContext<DialogContextType>({
  openDialog: () => {},
  closeDialog: () => {},
})

export function DialogProvider({ children }: { children: ReactNode }) {
  const dialogRef = useRef<HTMLDialogElement>(null)
  const [dialogData, setDialogData] = useState<DialogData | null>(null)

  const openDialog = useCallback((data: DialogData) => {
    setDialogData(data)
    // ✅ Only opens when this function is called (e.g. clicking a button)
    dialogRef.current?.showModal()
  }, [])

  const closeDialog = useCallback(() => {
    dialogRef.current?.close()
  }, [])

  const handleConfirm = () => {
    if (dialogData) {
      dialogData.onConfirm(dialogData.id)
      closeDialog()
    }
  }

  return (
    <DialogContext.Provider value={{ openDialog, closeDialog }}>
      {children}

      {/* DaisyUI Modal — hidden by default */}
      <dialog ref={dialogRef} className="modal">
        {/* ⚠️ DO NOT include the `open` attribute here! */}
        <div className="modal-box">
          <h3 className="font-bold text-lg">Deletion Confirmation</h3>
          <p className="py-4">
            Are you sure you want to delete <b>{dialogData?.title ?? 'this'}</b>{' '}
            post?
          </p>
          <div className="modal-action">
            <button
              className="btn btn-error text-white"
              onClick={handleConfirm}
            >
              Delete
            </button>
            <form method="dialog">
              <button className="btn">Cancel</button>
            </form>
          </div>
        </div>

        <form method="dialog" className="modal-backdrop">
          <button>close</button>
        </form>
      </dialog>
    </DialogContext.Provider>
  )
}

export const useDialog = () => useContext(DialogContext)
