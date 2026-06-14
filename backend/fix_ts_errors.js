import fs from 'fs';
import path from 'path';

function walk(dir) {
  let results = [];
  const list = fs.readdirSync(dir);
  list.forEach(function(file) {
    file = path.join(dir, file);
    const stat = fs.statSync(file);
    if (stat && stat.isDirectory()) { 
      results = results.concat(walk(file));
    } else { 
      if (file.endsWith('.ts')) results.push(file);
    }
  });
  return results;
}

const files = walk('./src');

files.forEach(file => {
  let content = fs.readFileSync(file, 'utf8');
  let original = content;

  // Fix req.params.id
  content = content.replace(/req\.params\.id(?! as string)/g, 'req.params.id as string');
  content = content.replace(/req\.params\.userId(?! as string)/g, 'req.params.userId as string');

  // Fix crypto
  content = content.replace(/import \{.*encryptSymmetric.*decryptSymmetric.*\} from '..\/..\/utils\/crypto.js';/g, "import { encrypt, decrypt } from '../../utils/crypto.js';");
  content = content.replace(/import \{.*encryptSymmetric.*decryptSymmetric.*\} from '\.\.\/\.\.\/utils\/crypto\.js';/g, "import { encrypt, decrypt } from '../../utils/crypto.js';");
  content = content.replace(/encryptSymmetric\(/g, 'encrypt(');
  content = content.replace(/decryptSymmetric\(/g, 'decrypt(');

  // Fix AuditService
  content = content.replace(/import \{ auditService \} from '\.\.\/audit\/audit\.service\.js';/g, "import { AuditService } from '../audit/audit.service.js';");
  content = content.replace(/auditService\.log\(/g, 'AuditService.log(');

  // Fix notificationQueue
  content = content.replace(/import \{ notificationQueue \} from '\.\.\/notifications\/notification\.service\.js';/g, "import { notificationService } from '../notifications/notification.service.js';");
  // The notificationService.sendEmail is a bit complex, but let's at least change notificationQueue.add('sendEmail', ...)
  // Actually, I'll just change notificationQueue to notificationService. Note: we might need manual fix if it has body vs template.
  
  if (content !== original) {
    fs.writeFileSync(file, content);
    console.log('Fixed', file);
  }
});
