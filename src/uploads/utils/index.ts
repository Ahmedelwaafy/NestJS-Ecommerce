import * as path from 'path';
import { v4 as uuidv4 } from 'uuid';

//***** Generates a file name ******
export function generateFileName(file: Express.Multer.File) {
  const name = file.originalname.split('.')[0]?.replace(/\s/g, '')?.trim();
  const ext = path.extname(file.originalname);
  const timestamp = new Date().getTime().toString().trim();
  return `${name}-${timestamp}-${uuidv4()}${ext}`;
}
