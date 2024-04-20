import { TextDecoder as ImportedTextDecoder, TextEncoder as ImportedTextEncoder } from 'util';
Object.assign(global, { TextDecoder: ImportedTextDecoder, TextEncoder: ImportedTextEncoder });
