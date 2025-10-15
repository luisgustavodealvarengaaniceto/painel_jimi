import multer from 'multer';
import path from 'path';
import fs from 'fs';

// Diretório para uploads - caminho absoluto
const uploadsDir = path.join('/app/uploads');

console.log('📁 [UPLOAD MIDDLEWARE] Diretório de uploads:', uploadsDir);

if (!fs.existsSync(uploadsDir)) {
  console.log('📁 [UPLOAD MIDDLEWARE] Criando diretório de uploads...');
  fs.mkdirSync(uploadsDir, { recursive: true });
  console.log('✅ [UPLOAD MIDDLEWARE] Diretório criado com sucesso');
} else {
  console.log('✅ [UPLOAD MIDDLEWARE] Diretório já existe');
}

// Verificar permissões
try {
  fs.accessSync(uploadsDir, fs.constants.W_OK);
  console.log('✅ [UPLOAD MIDDLEWARE] Diretório tem permissão de escrita');
} catch (error) {
  console.error('❌ [UPLOAD MIDDLEWARE] Diretório NÃO tem permissão de escrita!', error);
}

// Configuração do storage
const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    console.log('📁 [MULTER] Definindo destino do arquivo:', uploadsDir);
    cb(null, uploadsDir);
  },
  filename: (req, file, cb) => {
    const uniqueSuffix = `${Date.now()}-${Math.round(Math.random() * 1E9)}`;
    const ext = path.extname(file.originalname);
    const basename = path.basename(file.originalname, ext);
    const filename = `${basename}-${uniqueSuffix}${ext}`;
    console.log('📁 [MULTER] Nome do arquivo gerado:', filename);
    cb(null, filename);
  }
});

// Filtro de tipos de arquivo
const fileFilter = (req: any, file: Express.Multer.File, cb: multer.FileFilterCallback) => {
  const allowedTypes = ['image/jpeg', 'image/jpg', 'image/png', 'image/gif'];
  
  console.log('📁 [MULTER] Verificando tipo de arquivo:', file.mimetype);
  
  if (allowedTypes.includes(file.mimetype)) {
    console.log('✅ [MULTER] Tipo de arquivo aceito');
    cb(null, true);
  } else {
    console.error('❌ [MULTER] Tipo de arquivo rejeitado:', file.mimetype);
    cb(new Error('Apenas arquivos de imagem são permitidos (jpg, jpeg, png, gif)'));
  }
};

// Configuração do multer
export const upload = multer({
  storage,
  fileFilter,
  limits: {
    fileSize: 5 * 1024 * 1024, // 5MB
  }
});

// Função para deletar arquivo
export const deleteFile = (filePath: string): void => {
  const fullPath = path.join(uploadsDir, filePath);
  if (fs.existsSync(fullPath)) {
    fs.unlinkSync(fullPath);
  }
};
