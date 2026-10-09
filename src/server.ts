import express, { Application } from 'express';
import routes from './routes/index';

class Server {
    public app: Application;
    private port: string;

    constructor() {
        this.app = express();
        this.port = process.env.PORT || '3000';
        
        this.middlewares();
        this.routes();
    }

    private middlewares() {
        this.app.use(express.json());
    }

    private routes() {
        this.app.use('/api/v1', routes);
    }

    public listen() {
        this.app.listen(this.port, () => {
            console.log(`Servidor corriendo en el puerto ${this.port}`);
        });
    }
}

export default Server;