import type { Request, Response } from 'express';
import { eq } from 'drizzle-orm';
import path from 'path';

import { db } from '../db';
import { slideAttachments, slides } from '../db/schema';
import { deleteFile } from '../middleware/upload';

export const uploadSlideAttachment = async (req: Request, res: Response) => {
  try {
    console.log('📤 [UPLOAD] Iniciando upload de imagem...');
    console.log('📤 [UPLOAD] SlideId:', req.params.slideId);
    console.log('📤 [UPLOAD] File received:', req.file ? 'YES' : 'NO');
    
    const slideId = Number(req.params.slideId);

    if (Number.isNaN(slideId)) {
      console.error('❌ [UPLOAD] ID de slide inválido:', req.params.slideId);
      return res.status(400).json({ message: 'ID de slide inválido' });
    }

    // Verificar se o slide existe
    const [slide] = await db.select().from(slides).where(eq(slides.id, slideId)).limit(1);

    if (!slide) {
      console.error('❌ [UPLOAD] Slide não encontrado:', slideId);
      return res.status(404).json({ message: 'Slide não encontrado' });
    }

    if (!req.file) {
      console.error('❌ [UPLOAD] Nenhum arquivo foi enviado');
      return res.status(400).json({ message: 'Nenhum arquivo foi enviado' });
    }

    console.log('📤 [UPLOAD] Arquivo recebido:', {
      originalName: req.file.originalname,
      filename: req.file.filename,
      size: req.file.size,
      mimetype: req.file.mimetype,
      path: req.file.path,
    });

    console.log('📤 [UPLOAD] Arquivo recebido:', {
      originalName: req.file.originalname,
      filename: req.file.filename,
      size: req.file.size,
      mimetype: req.file.mimetype,
      path: req.file.path,
    });

    // Obter a contagem atual de attachments para definir a ordem
    const existingAttachments = await db
      .select()
      .from(slideAttachments)
      .where(eq(slideAttachments.slideId, slideId));

    console.log('📤 [UPLOAD] Salvando no banco de dados...');

    const [attachment] = await db
      .insert(slideAttachments)
      .values({
        slideId,
        fileName: req.file.originalname,
        fileUrl: `/uploads/${req.file.filename}`,
        fileSize: req.file.size,
        mimeType: req.file.mimetype,
        order: existingAttachments.length,
      })
      .returning();

    console.log('✅ [UPLOAD] Imagem salva com sucesso!', {
      id: attachment.id,
      fileName: attachment.fileName,
      fileUrl: attachment.fileUrl,
    });

    return res.status(201).json({
      message: 'Imagem anexada com sucesso',
      attachment: {
        id: attachment.id.toString(),
        fileName: attachment.fileName,
        fileUrl: attachment.fileUrl,
        fileSize: attachment.fileSize,
        mimeType: attachment.mimeType,
        order: attachment.order,
        createdAt: attachment.createdAt.toISOString(),
      },
    });
  } catch (error) {
    console.error('❌ [UPLOAD] Erro ao fazer upload:', error);
    console.error('❌ [UPLOAD] Stack trace:', error instanceof Error ? error.stack : 'N/A');
    
    // Deletar o arquivo se houve erro ao salvar no banco
    if (req.file) {
      deleteFile(req.file.filename);
    }
    
    return res.status(500).json({ message: 'Erro ao fazer upload da imagem' });
  }
};

export const getSlideAttachments = async (req: Request, res: Response) => {
  try {
    const slideId = Number(req.params.slideId);

    if (Number.isNaN(slideId)) {
      return res.status(400).json({ message: 'ID de slide inválido' });
    }

    const attachments = await db
      .select()
      .from(slideAttachments)
      .where(eq(slideAttachments.slideId, slideId))
      .orderBy(slideAttachments.order);

    // Retornar array diretamente, não dentro de objeto
    return res.json(attachments.map((att) => ({
      id: att.id.toString(),
      fileName: att.fileName,
      fileUrl: att.fileUrl,
      fileSize: att.fileSize,
      mimeType: att.mimeType,
      order: att.order,
      createdAt: att.createdAt.toISOString(),
    })));
  } catch (error) {
    console.error('Get attachments error:', error);
    return res.status(500).json({ message: 'Erro ao buscar anexos' });
  }
};

export const deleteSlideAttachment = async (req: Request, res: Response) => {
  try {
    const attachmentId = Number(req.params.id);

    if (Number.isNaN(attachmentId)) {
      return res.status(400).json({ message: 'ID de anexo inválido' });
    }

    const [attachment] = await db
      .select()
      .from(slideAttachments)
      .where(eq(slideAttachments.id, attachmentId))
      .limit(1);

    if (!attachment) {
      return res.status(404).json({ message: 'Anexo não encontrado' });
    }

    // Deletar arquivo físico
    const fileName = path.basename(attachment.fileUrl);
    deleteFile(fileName);

    // Deletar do banco
    await db.delete(slideAttachments).where(eq(slideAttachments.id, attachmentId));

    return res.status(204).send();
  } catch (error) {
    console.error('Delete attachment error:', error);
    return res.status(500).json({ message: 'Erro ao deletar anexo' });
  }
};

export const getArchivedSlides = async (_req: Request, res: Response) => {
  try {
    const archivedSlides = await db
      .select()
      .from(slides)
      .where(eq(slides.isArchived, true))
      .orderBy(slides.updatedAt);

    return res.json({
      slides: archivedSlides.map((slide) => ({
        id: slide.id.toString(),
        title: slide.title,
        content: slide.content,
        duration: slide.duration,
        order: slide.order,
        isActive: slide.isActive,
        expiresAt: slide.expiresAt?.toISOString() ?? null,
        isArchived: slide.isArchived,
        createdAt: slide.createdAt.toISOString(),
        updatedAt: slide.updatedAt.toISOString(),
      })),
    });
  } catch (error) {
    console.error('Get archived slides error:', error);
    return res.status(500).json({ message: 'Erro ao buscar slides arquivados' });
  }
};
