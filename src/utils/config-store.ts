import { go } from '@blackglory/prelude'
import { createBackgroundClient } from '@delight-rpc/webextension'
import { IBackgroundAPI, IConfigStore } from '@src/contract'
import { Store, createStoreContext } from 'extra-react-store'

export class ConfigStore extends Store<IConfigStore> {
  private client = go(() => {
    const [client] = createBackgroundClient<IBackgroundAPI>()
    return client
  })

  constructor() {
    super({ rules: [] })

    go(async () => {
      const config = await this.client.getConfig()
      super.setState(config)
    })
  }

  override setState(state: IConfigStore): void {
    super.setState(state)
    this.client.setConfig(state)
  }
}

export const ConfigStoreContext = createStoreContext<IConfigStore>()
