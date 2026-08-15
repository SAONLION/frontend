export type Choice = {
  className?: string
  id: string
  label: string
}

type ChoiceListProps<T extends Choice> = {
  choices: readonly T[]
  onSelect: (choice: T) => void
}

export function ChoiceList<T extends Choice>({ choices, onSelect }: ChoiceListProps<T>) {
  const [pendingChoiceId, setPendingChoiceId] = useState<string | null>(null)

  const handleSelect = (choice: T) => {
    if (pendingChoiceId !== null) {
      return
    }

    setPendingChoiceId(choice.id)
    onSelect(choice)
  }

  return (
    <div className="stage-c-choice-list">
      {choices.map((choice) => (
        <button
          className={`stage-c-choice-button ${choice.className ?? ''}`.trim()}
          data-navigation-pending={pendingChoiceId === choice.id || undefined}
          disabled={pendingChoiceId !== null}
          key={choice.id}
          onClick={() => handleSelect(choice)}
          type="button"
        >
          {choice.label}
        </button>
      ))}
    </div>
  )
}
import { useState } from 'react'
