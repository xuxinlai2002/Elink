/* Imports: External */
import * as dotenv from 'dotenv'
import Config from 'bcfg'

/* Imports: Internal */
import { DataTransportService } from './main/service'

interface Bcfg {
    load: (options: { env?: boolean; argv?: boolean }) => void
    str: (name: string, defaultValue?: string) => string
    uint: (name: string, defaultValue?: number) => number
    bool: (name: string, defaultValue?: boolean) => boolean
}

;(async () => {
    
    dotenv.config()
    const config: Bcfg = new Config('test-service')
    config.load({
        env: true,
        argv: true,
    })

    const service = new DataTransportService({

        serverHost :  config.str('serverHost', ""),
        serverPort :  config.uint('serverPort', 7789)

    })

    await service.start()


})()
