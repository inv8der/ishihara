import { useMemo } from 'react'
import { generateConfusionLines } from '../lib'

const protan = generateConfusionLines('protan', 6)
const deutan = generateConfusionLines('deutan', 6)
const tritan = generateConfusionLines('tritan', 6)

interface ConfusionLineProps {
  line: (percentage: number) => string
  steps: number
}

function ConfusionLine({ line, steps }: ConfusionLineProps) {
  const colors = useMemo(() => {
    return Array.from(new Array(steps), (_, v) => line(v / (steps - 1)))
  }, [line, steps])

  return (
    <div className="row">
      {colors.map((color) => (
        <div
          key={color}
          className="color-box"
          style={{ backgroundColor: color }}
        />
      ))}
    </div>
  )
}

export default function ConfusionLines() {
  return (
    <div>
      <section>
        <h1>Protan</h1>
        {protan.map((line, i) => (
          <ConfusionLine key={i} line={line} steps={9} />
        ))}
      </section>
      <section>
        <h1>Deutan</h1>
        {deutan.map((line, i) => (
          <ConfusionLine key={i} line={line} steps={9} />
        ))}
      </section>
      <section>
        <h1>Tritan</h1>
        {tritan.map((line, i) => (
          <ConfusionLine key={i} line={line} steps={9} />
        ))}
      </section>
    </div>
  )
}
