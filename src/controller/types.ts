import { Request, Response } from 'express';

export type ExpressController = (req: Request, res: Response) => void;