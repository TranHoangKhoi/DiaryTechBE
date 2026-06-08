import { Request, Response } from 'express';
import User from '~/models/User.model';
import Farm from '~/models/Farm.model';
import {
  appendPublicUrlToFile,
  deleteFileServerItemByAlias,
  listFileServerFolder,
  listFileServerHome,
  uploadFileServerFiles
} from '~/services/fileServer.service';
import { syncUserFileServer } from '~/services/userFileServerSync.service';

const FOLDER_ALIAS_BY_KEY: Record<string, string> = {
  home: 'home',
  'vat-tu': 'vật tư',
  material: 'vật tư',
  diary: 'nhật ký',
  'nhat-ky': 'nhật ký',
  profile: 'hồ sơ',
  'ho-so': 'hồ sơ'
};

const getFolderName = (folder?: string) => FOLDER_ALIAS_BY_KEY[folder || 'home'] || folder || 'home';

const getUserWithFileServer = async (userId: string) => {
  await syncUserFileServer(userId);
  return User.findById(userId).select('+file_server_client.key');
};

const getFileServerContext = async (userId?: string) => {
  if (!userId) return null;

  const user = await getUserWithFileServer(userId);
  if (!user?.file_server_client?.key || !user.external_id) return null;

  return {
    user,
    apiKey: user.file_server_client.key,
    externalId: user.external_id
  };
};

const resolveFolderAlias = (user: any, folder?: string) => {
  const normalizedFolder = String(folder || 'home').trim();
  if (normalizedFolder === 'home') return 'home';

  const existingFolders = user.file_server_folders || [];
  const directAliasMatch = existingFolders.find((item: any) => item.alias === normalizedFolder);
  if (directAliasMatch?.alias) return directAliasMatch.alias;

  const folderName = getFolderName(normalizedFolder);
  const matchedFolder = existingFolders.find(
    (item: any) => item.name === folderName || item.alias === folderName,
  );

  return matchedFolder?.alias || 'home';
};

const appendPublicUrlsToList = (data: any): any => {
  if (Array.isArray(data)) {
    return data.map(appendPublicUrlsToList);
  }

  if (!data || typeof data !== 'object') return data;

  if ('publicPath' in data) {
    return appendPublicUrlToFile(data);
  }

  return Object.fromEntries(Object.entries(data).map(([key, value]) => [key, appendPublicUrlsToList(value)]));
};

export const uploadFiles = async (req: Request, res: Response): Promise<void> => {
  try {
    let targetUserId = req.user?.id;
    const { farm_id } = req.body;

    if (farm_id) {
      const farm = await Farm.findById(farm_id).select('user_id');
      if (farm?.user_id) {
        targetUserId = farm.user_id.toString();
      }
    }

    const context = await getFileServerContext(targetUserId);
    if (!context) {
      res.status(503).json({ success: false, message: 'File server is not ready for this user' });
      return;
    }

    const files = (req.files as Express.Multer.File[]) || [];
    if (!files.length) {
      res.status(400).json({ success: false, message: 'Missing files' });
      return;
    }

    const folderAlias = resolveFolderAlias(context.user, String(req.body.folder || 'home'));
    const uploadResult = await uploadFileServerFiles({
      apiKey: context.apiKey,
      external_id: context.externalId,
      alias: folderAlias,
      file_system: false,
      files: files.map((file) => ({
        buffer: file.buffer,
        filename: file.originalname,
        mimeType: file.mimetype
      }))
    });

    const results = (uploadResult?.results || []).map((item: any) => ({
      ...item,
      file: item.file ? appendPublicUrlToFile(item.file) : item.file
    }));

    res.status(201).json({
      success: true,
      data: {
        ...uploadResult,
        results
      }
    });
  } catch (error) {
    console.error('Upload file server error:', error);
    res.status(500).json({ success: false, message: 'Upload failed' });
  }
};

export const listFiles = async (req: Request, res: Response): Promise<void> => {
  try {
    const context = await getFileServerContext(req.user?.id);
    if (!context) {
      res.status(503).json({ success: false, message: 'File server is not ready for this user' });
      return;
    }

    const folderAlias = resolveFolderAlias(context.user, String(req.params.alias || 'home'));
    const listParams = {
      page: Number(req.query.page || 1),
      limit: Number(req.query.limit || 20),
      sort: req.query.sort === 'asc' ? 'asc' : 'desc'
    } as const;
    const data =
      folderAlias === 'home'
        ? await listFileServerHome(context.apiKey, listParams)
        : await listFileServerFolder(context.apiKey, folderAlias, listParams);

    res.json({ success: true, data: appendPublicUrlsToList(data) });
  } catch (error) {
    console.error('List file server error:', error);
    res.status(500).json({ success: false, message: 'Cannot list files' });
  }
};

export const deleteFile = async (req: Request, res: Response): Promise<void> => {
  try {
    const context = await getFileServerContext(req.user?.id);
    if (!context) {
      res.status(503).json({ success: false, message: 'File server is not ready for this user' });
      return;
    }

    const { alias } = req.params;
    if (!alias) {
      res.status(400).json({ success: false, message: 'Missing alias' });
      return;
    }

    const data = await deleteFileServerItemByAlias(context.apiKey, alias);
    res.json({ success: true, data });
  } catch (error) {
    console.error('Delete file server error:', error);
    res.status(500).json({ success: false, message: 'Cannot delete file' });
  }
};
