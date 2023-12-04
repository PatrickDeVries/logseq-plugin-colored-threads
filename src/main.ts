import '@logseq/libs'
import { logseq as PL } from '../package.json'

enum Mode {
  Default = 'Default',
  Document = 'Document Mode',
}

const DEFAULT_SETTINGS = {
  colors: '#008080,#6e0772,#008017,#806600',
  shouldColorThreads: [Mode.Default],
  shouldFillBars: [Mode.Default],
  shouldColorBullets: [Mode.Default, Mode.Document],
  maxDepth: 20,
}

const onSettingsChange = () => {
  const colors: string[] = logseq.settings?.colors.split(',')
  const maxDepth: number = logseq.settings?.maxDepth
  const shouldColorThreads: string[] = logseq.settings?.shouldColorThreads
  if (Object.prototype.toString.call(shouldColorThreads) !== '[object Array]') {
    logseq.updateSettings({ shouldColorThreads: DEFAULT_SETTINGS.shouldColorThreads })
  }
  const shouldFillBars: string[] = logseq.settings?.shouldFillBars
  if (Object.prototype.toString.call(shouldFillBars) !== '[object Array]') {
    logseq.updateSettings({ shouldFillBars: DEFAULT_SETTINGS.shouldFillBars })
  }
  const shouldColorBullets: string[] = logseq.settings?.shouldColorBullets
  if (Object.prototype.toString.call(shouldColorBullets) !== '[object Array]') {
    logseq.updateSettings({ shouldColorBullets: DEFAULT_SETTINGS.shouldColorBullets })
  }

  let providedStyles: string

  const vars: [string, string][] = colors.map((color, i) => [
    `--block-thread-color-level-${i + 1}`,
    color,
  ])
  const varsString = vars.map(pair => pair.join(': ') + ';').join('\n')
  providedStyles = `:root { ${varsString} }`

  if (shouldColorThreads.length > 0) {
    const contentModeSelector = `.content${
      !shouldColorThreads.includes(Mode.Default)
        ? '.doc-mode'
        : !shouldColorThreads.includes(Mode.Document)
          ? ':not(.doc-mode)'
          : ''
    }`

    const threadColorStyles = `
      ${contentModeSelector} .block-children::after {
        content: '';
        position: absolute;
        top: 0;
        left: 0;
        height: 100%;
        width: 0px;
      }
      
      .content.doc-mode .block-children::after {
        left: 12px;
      }

      .block-children-container > .block-children {
        border-left-color: transparent;
      }

      .content.doc-mode .block-children-container > .block-children-left-border {
        left: 11px;
      }

      ${Array.from(
        { length: maxDepth },
        (_, i) => `
        ${contentModeSelector} .ls-block[level="${
          i + 1
        }"] > .block-children-container > .block-children::after {
            border-left: 1px solid var(--block-thread-color-level-${(i % colors.length) + 1});
          }
          
          ${contentModeSelector} .ls-block[level="${
            i + 1
          }"] > .block-children-container > .block-children-left-border:hover {
            background-color: var(--block-thread-color-level-${(i % colors.length) + 1});
          }
      `,
      ).join('\n')}
    `
    providedStyles = `
      ${providedStyles}
      ${threadColorStyles}
    `
  }

  if (shouldFillBars.length > 0) {
    const contentModeSelector = `.content${
      !shouldFillBars.includes(Mode.Default)
        ? '.doc-mode'
        : !shouldFillBars.includes(Mode.Document)
          ? ':not(.doc-mode)'
          : ''
    }`

    const fillBarsStyles = `
      ${contentModeSelector} .block-children::before {
        content: '';
        position: absolute;
        top: 0;
        height: 100%;
        width: 29px;

        opacity: 0.33;
      }

      .content.doc-mode .block-children::before {
        width: 18px;
        left: 12px;
      }

      ${Array.from(
        { length: maxDepth },
        (_, i) => `
          ${contentModeSelector} .ls-block[level="${
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

  if (shouldColorBullets.length > 0) {
    const contentModeSelector = `.content${
      !shouldColorBullets.includes(Mode.Default)
        ? '.doc-mode'
        : !shouldColorBullets.includes(Mode.Document)
          ? ':not(.doc-mode)'
          : ''
    }`

    const colorBulletsStyles = `
      ${Array.from(
        { length: maxDepth },
        (_, i) => `
        ${contentModeSelector} .ls-block[level="${i + 1}"] .bullet-container .bullet {
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
      default: DEFAULT_SETTINGS.colors,
      description: 'Comma-separated CSS colors to highlight threads from left to right.',
      title: 'Thread colors',
      type: 'string',
    },
    {
      key: 'shouldColorThreads',
      default: DEFAULT_SETTINGS.shouldColorThreads,
      description: 'Whether or not to color threads',
      title: 'Color threads',
      enumPicker: 'checkbox',
      enumChoices: Object.values(Mode),
      type: 'enum',
    },
    {
      key: 'shouldFillBars',
      default: DEFAULT_SETTINGS.shouldFillBars,
      description: 'Whether or not to fill the thread bars',
      title: 'Fill bars',
      enumPicker: 'checkbox',
      enumChoices: Object.values(Mode),
      type: 'enum',
    },
    {
      key: 'shouldColorBullets',
      default: DEFAULT_SETTINGS.shouldColorBullets,
      description: 'Whether or not to color bullets',
      title: 'Color bullets',
      enumPicker: 'checkbox',
      enumChoices: Object.values(Mode),
      type: 'enum',
    },
    {
      key: 'maxDepth',
      default: DEFAULT_SETTINGS.maxDepth,
      description: 'Max indentation depth to generate CSS for.',
      title: 'Max depth',
      type: 'number',
    },
  ])
  .ready(main)
  .catch(console.error)
