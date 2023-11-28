import '@logseq/libs'
import { logseq as PL } from '../package.json'

const onSettingsChange = () => {
  const colors: string[] = logseq.settings?.colors.split(',')
  const maxDepth: number = logseq.settings?.maxDepth
  const shouldColorThreads: boolean = logseq.settings?.shouldColorThreads
  const shouldFillBars: boolean = logseq.settings?.shouldFillBars
  const shouldColorBullets: boolean = logseq.settings?.shouldColorBullets

  let providedStyles: string

  const vars: [string, string][] = colors.map((color, i) => [
    `--block-thread-color-level-${i + 1}`,
    color,
  ])
  const varsString = vars.map(pair => pair.join(': ') + ';').join('\n')
  providedStyles = `:root { ${varsString} }`

  if (shouldColorThreads) {
    const threadColorStyles = Array.from(
      { length: maxDepth },
      (_, i) => `
      .ls-block[level="${i + 1}"] > .block-children-container > .block-children {
        border-left-color: var(--block-thread-color-level-${(i % colors.length) + 1});
      }
      
      .ls-block[level="${i + 1}"] > .block-children-container > .block-children-left-border:hover {
        background-color: var(--block-thread-color-level-${(i % colors.length) + 1});
      }
    `,
    ).join('\n')
    providedStyles = `
    ${providedStyles}
    ${threadColorStyles}
    `
  }

  if (shouldFillBars) {
    const fillBarsStyles = `
      .block-children::before {
        content: '';
        position: absolute;
        top: 0;
        height: 100%;
        width: 29px;

        opacity: .33;
      }

      ${Array.from(
        { length: maxDepth },
        (_, i) => `
          .ls-block[level="${
            i + 1
          }"] > .block-children-container > .block-children::before {
            background-color: var(--block-thread-color-level-${(i % colors.length) + 1});
          }
        `,
      ).join('\n')}
    `
    providedStyles = `
      ${providedStyles}
      ${fillBarsStyles}
    `
  }

  if (shouldColorBullets) {
    const colorBulletsStyles = `
      ${Array.from(
        { length: maxDepth },
        (_, i) => `
          .ls-block[level="${i + 1}"] .bullet-container .bullet {
            background-color: var(--block-thread-color-level-${(i % colors.length) + 1});
          }
        `,
      ).join('\n')}
    `
    providedStyles = `
      ${providedStyles}
      ${colorBulletsStyles}
    `
  }

  logseq.provideStyle({
    key: PL.id,
    style: providedStyles,
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
      key: 'shouldColorThreads',
      default: true,
      description: 'Whether or not to color threads',
      title: 'Color threads',
      type: 'boolean',
    },
    {
      key: 'shouldFillBars',
      default: true,
      description: 'Whether or not to fill the thread bars',
      title: 'Fill bars',
      type: 'boolean',
    },
    {
      key: 'shouldColorBullets',
      default: true,
      description: 'Whether or not to color bullets',
      title: 'Color bullets',
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
