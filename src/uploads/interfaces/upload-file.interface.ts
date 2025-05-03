import { fileTypes } from '../enums/file-types.enum';

export interface IUploadedFile {
  name: string;
  path: string;
  type: fileTypes;
  mime: string;
  size: number;
}
