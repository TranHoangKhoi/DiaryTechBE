import axios, { AxiosInstance } from 'axios';

const DEFAULT_FILE_SERVER_BASE_URL = 'https://files.bittechx.cloud';
const DEFAULT_FILE_SERVER_SYSTEM_ID = 'Diarytech_18902';

export interface FileServerClientRegisterPayload {
  external_id: string;
  name: string;
  client_system_id?: string;
  init_folders?: boolean;
  is_master?: boolean;
  user_info?: Record<string, unknown> | null;
}

export interface FileServerClientData {
  id: string | number;
  client_system_id: string;
  external_id: string | number;
  user_alias: string;
  user_info?: unknown;
  name: string;
  key: string;
  is_active: boolean;
}

export interface FileServerItem {
  id: string;
  name: string;
  alias: string;
  path: string;
  type: 'FILE' | 'FOLDER' | string;
  ext: string | null;
  mimeType: string | null;
  sizeInBytes: string;
  accessType: string;
  userMetadata: unknown;
  isAvailable: boolean;
  fileSystem: boolean;
  publicPath: string | null;
  parentId: string;
  clientId: string;
  createdAt: string;
  updatedAt: string;
}

export interface FileServerUploadFile {
  buffer: Buffer;
  filename: string;
  mimeType?: string;
}

export interface FileServerUploadPayload {
  apiKey: string;
  external_id: string;
  files: FileServerUploadFile[];
  alias?: string;
  file_system?: boolean;
  system_id?: string;
}

const normalizeBaseUrl = (url: string) => url.replace(/\/+$/, '');

export const FILE_SERVER_BASE_URL = normalizeBaseUrl(process.env.FILE_SERVER_BASE_URL || DEFAULT_FILE_SERVER_BASE_URL);

export const FILE_SERVER_SYSTEM_ID = process.env.FILE_SERVER_SYSTEM_ID || DEFAULT_FILE_SERVER_SYSTEM_ID;

const client: AxiosInstance = axios.create({
  baseURL: FILE_SERVER_BASE_URL,
  timeout: Number(process.env.FILE_SERVER_TIMEOUT_MS || 60000),
  maxBodyLength: Infinity,
  maxContentLength: Infinity
});

const withApiKey = (apiKey: string) => ({
  headers: {
    'x-api-key': apiKey
  }
});

export const buildFileServerPublicUrl = (publicPath?: string | null) => {
  if (!publicPath) return '';
  return `${FILE_SERVER_BASE_URL}/${publicPath.replace(/^\/+/, '')}`;
};

export const registerFileServerClient = async (payload: FileServerClientRegisterPayload) => {
  const response = await client.post('/api/client-registers', {
    client_system_id: payload.client_system_id || FILE_SERVER_SYSTEM_ID,
    external_id: payload.external_id,
    name: payload.name,
    init_folders: payload.init_folders ?? false,
    is_master: payload.is_master ?? false,
    user_info: payload.user_info ?? null
  });

  return response.data?.data as FileServerClientData;
};

export const createFileServerFolder = async (apiKey: string, name: string, parentId: string | number = 1) => {
  const response = await client.post('/api/files/folder', { name, parentId }, withApiKey(apiKey));
  return response.data?.data as FileServerItem;
};

export const uploadFileServerFiles = async (payload: FileServerUploadPayload) => {
  const formData = new FormData();

  formData.append('system_id', payload.system_id || FILE_SERVER_SYSTEM_ID);
  formData.append('user_id', payload.external_id);
  formData.append('alias', payload.alias || 'home');
  formData.append('file_system', String(payload.file_system ?? false));

  payload.files.forEach((file) => {
    const blob = new Blob([new Uint8Array(file.buffer)], { type: file.mimeType || 'application/octet-stream' });
    formData.append('files', blob, file.filename);
  });

  const response = await client.post('/api/files/upload', formData, withApiKey(payload.apiKey));
  return response.data?.data;
};

export const appendPublicUrlToFile = (file: FileServerItem) => ({
  ...file,
  url: buildFileServerPublicUrl(file.publicPath)
});

export const listFileServerHome = async (
  apiKey: string,
  params: { page?: number; limit?: number; sort?: 'asc' | 'desc' } = {}
) => {
  const response = await client.get('/api/files/home', {
    ...withApiKey(apiKey),
    params: {
      page: params.page ?? 1,
      limit: params.limit ?? 20,
      sort: params.sort ?? 'desc'
    }
  });

  return response.data?.data;
};

export const listFileServerFolder = async (
  apiKey: string,
  alias: string,
  params: { page?: number; limit?: number; sort?: 'asc' | 'desc' } = {}
) => {
  const response = await client.get(`/api/files/${encodeURIComponent(alias)}`, {
    ...withApiKey(apiKey),
    params: {
      page: params.page ?? 1,
      limit: params.limit ?? 20,
      sort: params.sort ?? 'desc'
    }
  });

  return response.data?.data;
};

export const deleteFileServerItemByAlias = async (apiKey: string, alias: string) => {
  const response = await client.delete(`/api/files/item/${encodeURIComponent(alias)}`, withApiKey(apiKey));
  return response.data;
};
