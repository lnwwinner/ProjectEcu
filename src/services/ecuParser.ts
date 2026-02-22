import fs from 'fs/promises';

export type DataType = '8bit' | '16bit_hi_lo' | '16bit_lo_hi';

export interface MapDefinition {
  name: string;
  address: number;
  columns: number;
  rows: number;
  dataType: DataType;
  isSigned: boolean;
  factor: number;
}

/**
 * BinaryECUParser handles reading and extracting map data from raw ECU binary files.
 * It uses external definitions to drive the parsing logic dynamically.
 */
export class BinaryECUParser {
  /**
   * Safely loads raw binary ECU files.
   */
  async readBinary(filepath: string): Promise<Buffer> {
    try {
      return await fs.readFile(filepath);
    } catch (error) {
      throw new Error(`Failed to read binary file at ${filepath}: ${error}`);
    }
  }

  /**
   * Parses raw bytes into a 2D array based on map dimensions and data type.
   * Handles memory out-of-bounds exceptions gracefully.
   */
  extractMapData(
    binaryData: Buffer,
    startAddress: number,
    columns: number,
    rows: number,
    dataType: DataType = '16bit_hi_lo',
    isSigned: boolean = false,
    conversionFactor: number = 1.0
  ): number[][] {
    const data: number[][] = [];
    let currentPos = startAddress;

    for (let r = 0; r < rows; r++) {
      const row: number[] = [];
      for (let c = 0; c < columns; c++) {
        let value = 0;

        if (currentPos < 0 || currentPos >= binaryData.length) {
          throw new Error(`Memory out-of-bounds at address 0x${currentPos.toString(16)}`);
        }

        try {
          if (dataType === '8bit') {
            value = isSigned ? binaryData.readInt8(currentPos) : binaryData.readUInt8(currentPos);
            currentPos += 1;
          } else if (dataType === '16bit_hi_lo') {
            // Big Endian (Common in Bosch ECUs)
            if (currentPos + 1 >= binaryData.length) throw new Error('Incomplete 16-bit word at end of file');
            value = isSigned ? binaryData.readInt16BE(currentPos) : binaryData.readUInt16BE(currentPos);
            currentPos += 2;
          } else if (dataType === '16bit_lo_hi') {
            // Little Endian
            if (currentPos + 1 >= binaryData.length) throw new Error('Incomplete 16-bit word at end of file');
            value = isSigned ? binaryData.readInt16LE(currentPos) : binaryData.readUInt16LE(currentPos);
            currentPos += 2;
          }
        } catch (e) {
          throw new Error(`Error parsing data at 0x${currentPos.toString(16)}: ${e}`);
        }

        row.push(value * conversionFactor);
      }
      data.push(row);
    }
    return data;
  }

  /**
   * Loads map metadata from a JSON file to update the engine dynamically.
   */
  async loadDefinitionsFromJson(jsonFilepath: string): Promise<MapDefinition[]> {
    try {
      const content = await fs.readFile(jsonFilepath, 'utf-8');
      return JSON.parse(content);
    } catch (error) {
      throw new Error(`Failed to load definitions from ${jsonFilepath}: ${error}`);
    }
  }
}
