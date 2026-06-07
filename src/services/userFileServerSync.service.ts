import User, { IUser, IUserFileServerFolder } from '~/models/User.model';
import {
  createFileServerFolder,
  FileServerClientData,
  FileServerItem,
  registerFileServerClient
} from '~/services/fileServer.service';

const DEFAULT_FILE_SERVER_FOLDERS = ['vật tư', 'nhật ký', 'hồ sơ'];
const MAX_ERROR_LENGTH = 500;

const getErrorMessage = (error: unknown) => {
  if (error instanceof Error) return error.message.slice(0, MAX_ERROR_LENGTH);
  return String(error).slice(0, MAX_ERROR_LENGTH);
};

const mapClientMetadata = (data: FileServerClientData) => ({
  client_system_id: data.client_system_id,
  external_id: String(data.external_id),
  user_alias: data.user_alias,
  name: data.name,
  key: data.key,
  client_id: String(data.id),
  is_active: data.is_active
});

const mapFolderMetadata = (folder: FileServerItem): IUserFileServerFolder => ({
  name: folder.name,
  alias: folder.alias,
  id: String(folder.id),
  parentId: String(folder.parentId),
  path: folder.path
});

const hasReadyFileServer = (user: IUser) => {
  const folderNames = new Set((user.file_server_folders || []).map((folder) => folder.name));

  return Boolean(
    user.file_server_client?.key &&
      user.file_server_sync_status === 'synced' &&
      DEFAULT_FILE_SERVER_FOLDERS.every((folderName) => folderNames.has(folderName))
  );
};

export const syncUserFileServer = async (userId: string) => {
  let user: IUser | null = null;

  try {
    user = await User.findById(userId).select('+file_server_client.key');
    if (!user || hasReadyFileServer(user)) return;

    if (!user.external_id) {
      await user.save();
    }

    if (!user.file_server_client?.key) {
      const client = await registerFileServerClient({
        external_id: user.external_id,
        name: user.name,
        init_folders: false,
        is_master: false
      });

      user.file_server_client = mapClientMetadata(client);
    }

    const apiKey = user.file_server_client?.key;
    if (!apiKey) {
      throw new Error('Missing file server api key');
    }

    const currentFolders = user.file_server_folders || [];
    const currentFolderNames = new Set(currentFolders.map((folder) => folder.name));
    const missingFolderNames = DEFAULT_FILE_SERVER_FOLDERS.filter((folderName) => !currentFolderNames.has(folderName));

    if (missingFolderNames.length) {
      const results = await Promise.allSettled(
        missingFolderNames.map((folderName) => createFileServerFolder(apiKey, folderName))
      );

      const createdFolders = results
        .filter((result): result is PromiseFulfilledResult<FileServerItem> => result.status === 'fulfilled')
        .map((result) => mapFolderMetadata(result.value));

      user.file_server_folders = [...currentFolders, ...createdFolders];

      const failedFolders = results.filter((result) => result.status === 'rejected');
      if (failedFolders.length) {
        throw new Error(`Cannot create default file server folders: ${failedFolders.length}`);
      }
    }

    user.file_server_sync_status = 'synced';
    user.file_server_last_error = '';
    user.file_server_synced_at = new Date();
    await user.save();
  } catch (error) {
    if (!user) return;

    try {
      user.file_server_sync_status = 'failed';
      user.file_server_last_error = getErrorMessage(error);
      await user.save();
    } catch (saveError) {
      console.error('Cannot save file server sync status', saveError);
    }
  }
};
