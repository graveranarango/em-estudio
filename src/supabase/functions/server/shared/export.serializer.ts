// Export serialization utilities for Chat Maestro
import { 
  ProcessedThread, 
  ProcessedMessage, 
  ExportFormat, 
  CleanupOpts,
  ExportRange 
} from './export.types.ts';
import { sanitizeContent, maskUsernames } from './export.pii.ts';

/**
 * Serializes thread to Markdown format
 */
export function serializeToMarkdown(
  thread: ProcessedThread,
  cleanup: CleanupOpts = {},
  range: ExportRange = 'thread',
  selectionIds?: string[]
): string {
  const messages = filterMessagesByRange(thread.messages, range, selectionIds);
  
  // Generate frontmatter
  const frontmatter = [
    '---',
    `title: "${thread.title}"`,
    `exported_at: ${new Date().toISOString()}`,
    `thread_id: ${thread.id}`,
    `message_count: ${messages.length}`,
    ...(range === 'selection' ? [`selection_count: ${selectionIds?.length || 0}`] : []),
    '---',
    ''
  ].join('\n');
  
  // Generate content
  const content = messages.map(message => {
    let messageContent = sanitizeContent(message.content, cleanup);
    
    if (cleanup.hideUsernames && message.role === 'user') {
      messageContent = maskUsernames(messageContent);
    }
    
    const timestamp = new Date(message.timestamp).toLocaleString();
    const roleIcon = getRoleIcon(message.role);
    
    let output = `## ${roleIcon} ${capitalizeRole(message.role)}`;
    
    if (!cleanup.hideMeta) {
      output += ` (${timestamp})`;
    }
    
    output += '\n\n';
    output += messageContent;
    
    // Add brand guard findings if not hidden
    if (!cleanup.hideChips && message.brandGuardFindings?.length) {
      output += '\n\n### 🛡️ Brand Guard Findings\n\n';
      message.brandGuardFindings.forEach(finding => {
        output += `- **${finding.severity}**: ${finding.message}\n`;
      });
    }
    
    return output;
  }).join('\n\n---\n\n');
  
  return frontmatter + content;
}

/**
 * Serializes thread to HTML format
 */
export function serializeToHTML(
  thread: ProcessedThread,
  cleanup: CleanupOpts = {},
  range: ExportRange = 'thread',
  selectionIds?: string[]
): string {
  const messages = filterMessagesByRange(thread.messages, range, selectionIds);
  
  const title = escapeHtml(thread.title);
  const exportDate = new Date().toLocaleString();
  
  const htmlContent = messages.map(message => {
    let messageContent = sanitizeContent(message.content, cleanup);
    messageContent = escapeHtml(messageContent);
    messageContent = formatTextToHTML(messageContent);
    
    if (cleanup.hideUsernames && message.role === 'user') {
      messageContent = maskUsernames(messageContent);
    }
    
    const timestamp = new Date(message.timestamp).toLocaleString();
    const roleClass = `message-${message.role}`;
    const roleIcon = getRoleIcon(message.role);
    
    let output = `<div class="message ${roleClass}">`;
    output += `<div class="message-header">`;
    output += `<span class="role-icon">${roleIcon}</span>`;
    output += `<span class="role-name">${capitalizeRole(message.role)}</span>`;
    
    if (!cleanup.hideMeta) {
      output += `<span class="timestamp">${timestamp}</span>`;
    }
    
    output += `</div>`;
    output += `<div class="message-content">${messageContent}</div>`;
    
    // Add brand guard findings if not hidden
    if (!cleanup.hideChips && message.brandGuardFindings?.length) {
      output += `<div class="brand-guard-findings">`;
      output += `<h4>🛡️ Brand Guard Findings</h4>`;
      output += `<ul>`;
      message.brandGuardFindings.forEach(finding => {
        output += `<li class="finding-${finding.severity}">`;
        output += `<strong>${finding.severity}:</strong> ${escapeHtml(finding.message)}`;
        output += `</li>`;
      });
      output += `</ul></div>`;
    }
    
    output += `</div>`;
    return output;
  }).join('\n');
  
  return `<!DOCTYPE html>
<html lang="es">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>${title} - Chat Export</title>
    <style>
        body {
            font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif;
            line-height: 1.6;
            max-width: 800px;
            margin: 0 auto;
            padding: 2rem;
            color: #333;
        }
        .header {
            border-bottom: 2px solid #eee;
            padding-bottom: 1rem;
            margin-bottom: 2rem;
        }
        .message {
            margin-bottom: 2rem;
            padding: 1.5rem;
            border-radius: 8px;
            background: #f8f9fa;
        }
        .message-user { background: #e3f2fd; }
        .message-assistant { background: #f3e5f5; }
        .message-system { background: #fff3e0; }
        .message-header {
            display: flex;
            align-items: center;
            gap: 0.5rem;
            margin-bottom: 1rem;
            font-weight: 600;
        }
        .timestamp {
            margin-left: auto;
            font-size: 0.875rem;
            color: #666;
            font-weight: normal;
        }
        .message-content {
            white-space: pre-wrap;
            word-wrap: break-word;
        }
        .brand-guard-findings {
            margin-top: 1rem;
            padding: 1rem;
            background: #fff;
            border-radius: 4px;
            border-left: 4px solid #ff9800;
        }
        .brand-guard-findings h4 {
            margin: 0 0 0.5rem 0;
            color: #ff9800;
        }
        .brand-guard-findings ul {
            margin: 0;
            padding-left: 1.5rem;
        }
        .finding-high { color: #d32f2f; }
        .finding-medium { color: #f57c00; }
        .finding-low { color: #388e3c; }
        .footer {
            margin-top: 3rem;
            padding-top: 1rem;
            border-top: 1px solid #eee;
            font-size: 0.875rem;
            color: #666;
            text-align: center;
        }
    </style>
</head>
<body>
    <div class="header">
        <h1>${title}</h1>
        <p>Exportado el ${exportDate} | ${messages.length} mensajes</p>
    </div>
    
    ${htmlContent}
    
    <div class="footer">
        <p>Generado por AI Content Studio - Chat Maestro</p>
    </div>
</body>
</html>`;
}

/**
 * Filters messages based on export range
 */
function filterMessagesByRange(
  messages: ProcessedMessage[],
  range: ExportRange,
  selectionIds?: string[]
): ProcessedMessage[] {
  switch (range) {
    case 'selection':
      return selectionIds 
        ? messages.filter(msg => selectionIds.includes(msg.id))
        : messages;
    case 'current':
      // Return last message and its context
      return messages.slice(-2);
    case 'thread':
    default:
      return messages;
  }
}

/**
 * Gets icon for message role
 */
function getRoleIcon(role: string): string {
  switch (role) {
    case 'user': return '👤';
    case 'assistant': return '🤖';
    case 'system': return '⚙️';
    default: return '💬';
  }
}

/**
 * Capitalizes role name
 */
function capitalizeRole(role: string): string {
  switch (role) {
    case 'user': return 'Usuario';
    case 'assistant': return 'Asistente';
    case 'system': return 'Sistema';
    default: return role;
  }
}

/**
 * Escapes HTML characters
 */
function escapeHtml(text: string): string {
  const div = document.createElement('div');
  div.textContent = text;
  return div.innerHTML;
}

/**
 * Converts plain text formatting to HTML
 */
function formatTextToHTML(text: string): string {
  return text
    .replace(/\*\*(.*?)\*\*/g, '<strong>$1</strong>')
    .replace(/\*(.*?)\*/g, '<em>$1</em>')
    .replace(/`(.*?)`/g, '<code>$1</code>')
    .replace(/\n/g, '<br>');
}

/**
 * Generates filename for export
 */
export function generateFilename(
  title: string,
  format: ExportFormat,
  range: ExportRange
): string {
  const sanitizedTitle = title
    .replace(/[^a-zA-Z0-9\s-]/g, '')
    .replace(/\s+/g, '-')
    .toLowerCase()
    .slice(0, 50);
  
  const timestamp = new Date().toISOString().slice(0, 19).replace(/[:-]/g, '');
  const rangePrefix = range === 'thread' ? '' : `${range}-`;
  
  return `${rangePrefix}${sanitizedTitle}-${timestamp}.${format}`;
}