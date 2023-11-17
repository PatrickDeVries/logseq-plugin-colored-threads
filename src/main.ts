import '@logseq/libs'
import { logseq as PL } from '../package.json'

const onSettingsChange = () => {
  const colors: string[] = logseq.settings?.colors.split(',')
  const maxDepth: number = logseq.settings?.maxDepth
  const shouldFillBars: boolean = logseq.settings?.shouldFillBars

  const vars: [string, string][] = colors.map((color, i) => [
    `--block-thread-color-level-${i + 1}`,
    color,
  ])

  const varsString = vars.map(pair => pair.join(': ') + ';').join('\n')

  const fillBarsString = `
    .block-children-left-border::after {
      content: '';
      position: absolute;
      left: 2px;
      height: 100%;
      width: 30px;

      opacity: .33;
    }

    ${Array.from(
      { length: maxDepth },
      (_, i) => `
      .ls-block[level="${i + 1}"] .block-children-left-border::after {
        background-color: var(--block-thread-color-level-${(i % colors.length) + 1});
      }
  `,
    ).join('\n')}
  `

  const threadColorString = Array.from(
    { length: maxDepth },
    (_, i) => `
    .ls-block[level="${i + 1}"] .block-children {
      border-left-color: var(--block-thread-color-level-${(i % colors.length) + 1});
    }

    .ls-block[level="${i + 1}"] .block-children-left-border::after {
      background-color: var(--block-thread-color-level-${(i % colors.length) + 1});
    }
`,
  ).join('\n')

  logseq.provideStyle({
    key: PL.id + '-threads',
    style: `
    :root { ${varsString} }
    ${threadColorString}
    ${shouldFillBars && fillBarsString}
    `,
  })
}

const main = async () => {
  onSettingsChange()
  logseq.onSettingsChanged(onSettingsChange)
}

logseq
  .useSettingsSchema([
    {
      key: 'colors',
      default: '#008080,#6e0772,#008017,#806600',
      description: 'Comma-separated CSS colors to highlight threads from left to right.',
      title: 'Thread colors',
      type: 'string',
    },
    {
      key: 'shouldFillBars',
      default: true,
      description: 'Whether or not to fill the thread bars',
      title: 'Fill bars',
      type: 'boolean',
    },
    {
      key: 'maxDepth',
      default: 20,
      description: 'Max indentation depth to generate CSS for.',
      title: 'Max depth',
      type: 'number',
    },
  ])
  .ready(main)
  .catch(console.error)
