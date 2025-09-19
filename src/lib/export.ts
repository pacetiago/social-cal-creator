import { Post, PostWithRelations } from '@/types/multi-tenant';

export interface CSVExportOptions {
  includeHeaders?: boolean;
  dateFormat?: 'ISO' | 'human';
}

export function exportToCSV(posts: PostWithRelations[], options: CSVExportOptions = {}): string {
  const { includeHeaders = true, dateFormat = 'ISO' } = options;

  const formatDate = (dateStr?: string) => {
    if (!dateStr) return '';
    const date = new Date(dateStr);
    return dateFormat === 'ISO' ? date.toISOString() : date.toLocaleDateString();
  };

  const headers = [
    'id',
    'channel',
    'status',
    'title',
    'content',
    'publish_at',
    'persona',
    'theme',
    'tags',
    'utm_source',
    'utm_campaign',
    'utm_content',
    'insights',
    'campaign_name',
    'created_at'
  ];

  const rows = posts.map(post => [
    post.id,
    post.channel?.name || '',
    post.status,
    `"${post.title.replace(/"/g, '""')}"`,
    `"${(post.content || '').replace(/"/g, '""')}"`,
    formatDate(post.publish_at),
    post.persona || '',
    post.theme || '',
    post.tags?.join(';') || '',
    post.utm_source || '',
    post.utm_campaign || '',
    post.utm_content || '',
    `"${(post.insights || '').replace(/"/g, '""')}"`,
    post.campaign?.name || '',
    formatDate(post.created_at)
  ]);

  const csvContent = includeHeaders 
    ? [headers.join(','), ...rows.map(row => row.join(','))].join('\n')
    : rows.map(row => row.join(',')).join('\n');

  return csvContent;
}

export function downloadCSV(content: string, filename: string = 'posts.csv'): void {
  const blob = new Blob([content], { type: 'text/csv;charset=utf-8;' });
  const link = document.createElement('a');
  
  if (link.download !== undefined) {
    const url = URL.createObjectURL(blob);
    link.setAttribute('href', url);
    link.setAttribute('download', filename);
    link.style.visibility = 'hidden';
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    URL.revokeObjectURL(url);
  }
}

export interface ICSEvent {
  uid: string;
  title: string;
  description?: string;
  start: Date;
  end?: Date;
  location?: string;
  url?: string;
}

export function exportToICS(posts: PostWithRelations[], orgName: string = 'Social Media Calendar'): string {
  const events: ICSEvent[] = posts
    .filter(post => post.publish_at && !['idea', 'draft'].includes(post.status))
    .map(post => ({
      uid: `post-${post.id}@socialmedia.calendar`,
      title: post.title,
      description: [
        post.content,
        post.insights && `Insights: ${post.insights}`,
        post.channel?.name && `Canal: ${post.channel.name}`,
        post.campaign?.name && `Campanha: ${post.campaign.name}`
      ].filter(Boolean).join('\\n\\n'),
      start: new Date(post.publish_at!),
      end: new Date(new Date(post.publish_at!).getTime() + 30 * 60 * 1000), // 30 minutes duration
      location: post.channel?.name,
      url: post.utm_source && post.utm_campaign ? 
        `https://${post.utm_source}.com?utm_campaign=${post.utm_campaign}` : undefined
    }));

  return generateICSContent(events, orgName);
}

function generateICSContent(events: ICSEvent[], calendarName: string): string {
  const formatDate = (date: Date): string => {
    return date.toISOString().replace(/[-:]/g, '').split('.')[0] + 'Z';
  };

  const escapeText = (text: string): string => {
    return text.replace(/\n/g, '\\n').replace(/,/g, '\\,').replace(/;/g, '\\;');
  };

  const icsLines = [
    'BEGIN:VCALENDAR',
    'VERSION:2.0',
    'PRODID:-//Social Media Calendar//Multi-Tenant App//EN',
    `X-WR-CALNAME:${escapeText(calendarName)}`,
    'X-WR-TIMEZONE:UTC',
    'CALSCALE:GREGORIAN',
    'METHOD:PUBLISH'
  ];

  events.forEach(event => {
    icsLines.push(
      'BEGIN:VEVENT',
      `UID:${event.uid}`,
      `DTSTAMP:${formatDate(new Date())}`,
      `DTSTART:${formatDate(event.start)}`,
      `DTEND:${formatDate(event.end || new Date(event.start.getTime() + 30 * 60 * 1000))}`,
      `SUMMARY:${escapeText(event.title)}`,
    );

    if (event.description) {
      icsLines.push(`DESCRIPTION:${escapeText(event.description)}`);
    }

    if (event.location) {
      icsLines.push(`LOCATION:${escapeText(event.location)}`);
    }

    if (event.url) {
      icsLines.push(`URL:${event.url}`);
    }

    icsLines.push(
      'STATUS:CONFIRMED',
      'TRANSP:OPAQUE',
      'END:VEVENT'
    );
  });

  icsLines.push('END:VCALENDAR');

  return icsLines.join('\r\n');
}

export function downloadICS(content: string, filename: string = 'calendar.ics'): void {
  const blob = new Blob([content], { type: 'text/calendar;charset=utf-8;' });
  const link = document.createElement('a');
  
  if (link.download !== undefined) {
    const url = URL.createObjectURL(blob);
    link.setAttribute('href', url);
    link.setAttribute('download', filename);
    link.style.visibility = 'hidden';
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    URL.revokeObjectURL(url);
  }
}