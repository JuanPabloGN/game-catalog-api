import express, { Request, Response } from 'express';

const app = express();
app.use(express.json());

interface Juego {
  id: number;
  titulo: string;
  plataforma: string;
  horasJugadas: number;
  terminado: boolean;
}

const juegos: Juego[] = [
  { id: 1, titulo: 'Elden Ring', plataforma: 'PC', horasJugadas: 87, terminado: true }
];

app.get('/health', (req: Request, res: Response) => {
  res.json({ status: 'ok' });
});

app.get('/juegos', (req: Request, res: Response) => {
  res.json(juegos);
});

app.listen(3000, () => console.log('API corriendo en :3000'));