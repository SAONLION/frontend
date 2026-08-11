export type Choice = {
  id: string
  label: string
}

type ChoiceListProps<T extends Choice> = {
  choices: readonly T[]
  onSelect: (choice: T) => void
}

export function ChoiceList<T extends Choice>({ choices, onSelect }: ChoiceListProps<T>) {
  return (
    <div className="stage-c-choice-list">
      {choices.map((choice) => (
        <button className="stage-c-choice-button" key={choice.id} onClick={() => onSelect(choice)} type="button">
          {choice.label}
        </button>
      ))}
    </div>
  )
}
