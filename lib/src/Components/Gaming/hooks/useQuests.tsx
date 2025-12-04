import { useCallback, useState, createContext, useContext } from 'react'

type UseQuestManagerResult = ReturnType<typeof useQuestsManager>

const QuestContext = createContext<UseQuestManagerResult>({
  open: false,
  setQuestsOpen: () => {},
})

function useQuestsManager(initialOpen: boolean): {
  open: boolean
  setQuestsOpen: (open: boolean) => void
} {
  const [open, setOpen] = useState<boolean>(initialOpen)

  const setQuestsOpen = useCallback((questOpen: boolean) => {
    setOpen(questOpen)
  }, [])

  return { open, setQuestsOpen }
}

interface QuestProviderProps {
  initialOpen: boolean
  children?: React.ReactNode
}

export const QuestsProvider: React.FunctionComponent<QuestProviderProps> = ({
  initialOpen,
  children,
}: QuestProviderProps) => (
  <QuestContext.Provider value={useQuestsManager(initialOpen)}>{children}</QuestContext.Provider>
)

export const useQuestsOpen = (): boolean => {
  const { open } = useContext(QuestContext)
  return open
}

export const useSetQuestOpen = (): UseQuestManagerResult['setQuestsOpen'] => {
  const { setQuestsOpen } = useContext(QuestContext)
  return setQuestsOpen
}
