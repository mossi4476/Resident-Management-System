import { Injectable } from '@nestjs/common';
import * as fs from 'fs';
import * as fsp from 'fs/promises';
import * as path from 'path';

@Injectable()
export class StorageService {
  private baseDir: string;

  constructor() {
    const configuredDir = process.env.UPLOAD_DIR || path.resolve(process.cwd(), 'uploads');
    this.baseDir = configuredDir;
  }

  private async ensureDir(dirPath: string): Promise<void> {
    await fsp.mkdir(dirPath, { recursive: true });
  }

  async uploadObject(objectName: string, buffer: Buffer, mimeType: string): Promise<string> {
    const fullPath = path.join(this.baseDir, objectName);
    await this.ensureDir(path.dirname(fullPath));
    await fsp.writeFile(fullPath, buffer);
    return objectName;
  }

  async removeObject(objectName: string): Promise<void> {
    const fullPath = path.join(this.baseDir, objectName);
    try {
      await fsp.unlink(fullPath);
    } catch (err: any) {
      if (err.code !== 'ENOENT') throw err;
    }
  }

  getReadStream(objectName: string): fs.ReadStream {
    const fullPath = path.join(this.baseDir, objectName);
    return fs.createReadStream(fullPath);
  }
}
