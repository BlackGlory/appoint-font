import '@src/globals.css'
import { createRoot } from 'react-dom/client'
import { Options } from '@components/options'
import { assert } from '@blackglory/prelude'
import { ConfigStore, ConfigStoreContext } from '@utils/config-store'

const main = document.querySelector('main')
assert(main, 'The main element not found')

const root = createRoot(main)
root.render(
  <ConfigStoreContext.Provider value={new ConfigStore()}>
    <Options />
  </ConfigStoreContext.Provider>
)
