/* Imports: External */
import { BaseService } from '@eth-optimism/service-base';
import express, { json, Request, Response } from 'express'
import cors from 'cors'


interface DBConf{
  host:     string
  user:     string
  password: string
  name:     string
  port:     number
}

export interface DataTransportServiceOptions {

    //host
    serverHost:        string
    serverPort:        number

}

export class DataTransportService extends BaseService<DataTransportServiceOptions> {
    
    protected name = 'Data Transport Service'
    protected cross_id_random_length = 3
    public repeatNum = 0;
    public lastRandom = "0";
  
    private state: {
        web3:any,
        db:any,
        dbConf:DBConf,
        app: express.Express,
        server: any
    } = {} as any
  
    protected async _init(): Promise<void> {

      //initialize App
      this._initializeApp()

    }

  
    protected async _start(): Promise<void> {
      
      console.log("dts come to _start");

      this.state.server = this.state.app.listen(
        this.options.serverPort,
        this.options.serverHost
      )

      this.logger.info('Server started and listening', {
        port: this.options.serverPort,
        host: this.options.serverHost
      })

    }
    
    protected async _stop(): Promise<void> {

      console.log("dts come to _stop");
      //data backup

    }

    /**
     * Initializes the server application.
     * Do any sort of initialization here that you want. Mostly just important that
     * `_registerAllRoutes` is called at the end.
     */
     private _initializeApp() {
      // TODO: Maybe pass this in as a parameter instead of creating it here?
      this.state.app = express()
      this.state.app.use(cors())
      this.state.app.use(json())
      this._registerAllRoutes()
    }


  /**
   * Registers a route on the server.
   * @param method Http method type.
   * @param route Route to register.
   * @param handler Handler called and is expected to return a JSON response.
   */
     private _registerRoute(
      method: string, // Just handle GET for now, but could extend this with whatever.
      route: string,
      handler: (req?: Request, res?: Response) => Promise<any>
    ): void {
     
      this.state.app[method](route, async (req, res) => {
        const start = Date.now()
        try {

          const json = await handler(req, res)
          const elapsed = Date.now() - start

          this.logger.info('Served HTTP Request', {
            method: req.method,
            url: req.url,
            elapsed,
          })

          return res.json(json)
        } catch (e) {
          const elapsed = Date.now() - start
          this.logger.info('Failed HTTP Request', {
            method: req.method,
            url: req.url,
            elapsed,
            msg: e.toString(),
          })
          return res.status(400).json({
            error: e.toString(),
          })
        }
      })
    }

  /** 
   * Registers all of the server routes we want to expose.
   * TODO: Link to our API spec.
   */
  private _registerAllRoutes(): void {
    // TODO: Maybe add doc-like comments to each of these routes?
    this._registerRoute(
        'post',
        '/test',
        async (req): Promise<any> => {

        
        let base10 = "12345678901234567890";
        let num = 3200;
        let vReturn;
        for(var i = 0 ;i < num ;i ++){
          vReturn +=  base10;
        }

        //return vReturn.substr(0,10*num - 2);
        return 1;
        
    })

  }

  
  
}
    