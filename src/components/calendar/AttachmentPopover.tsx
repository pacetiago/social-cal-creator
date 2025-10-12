import { useState, useEffect } from 'react';
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover';
import { Button } from '@/components/ui/button';
import { Paperclip, Download, FileText, Image, Video } from 'lucide-react';
import { supabase } from '@/integrations/supabase/client';
import { Badge } from '@/components/ui/badge';

interface Asset {
  id: string;
  name: string;
  file_path?: string;
  file_url?: string;
  mime_type?: string;
  kind: 'image' | 'video' | 'doc';
}

interface AttachmentPopoverProps {
  assets: Asset[];
}

export function AttachmentPopover({ assets }: AttachmentPopoverProps) {
  const [signedUrls, setSignedUrls] = useState<Record<string, string>>({});
  const [loading, setLoading] = useState(false);

  const loadSignedUrls = async () => {
    if (loading || Object.keys(signedUrls).length > 0) return;
    
    setLoading(true);
    const map: Record<string, string> = {};

    for (const asset of assets) {
      try {
        if (asset.file_path) {
          const { data, error } = await supabase.storage
            .from('post-attachments')
            .createSignedUrl(asset.file_path, 60 * 15); // 15 minutes

          if (!error && data?.signedUrl) {
            map[asset.id] = data.signedUrl;
          } else if (asset.file_url) {
            map[asset.id] = asset.file_url;
          }
        } else if (asset.file_url) {
          map[asset.id] = asset.file_url;
        }
      } catch (e) {
        console.error('Error generating signed URL:', e);
        if (asset.file_url) {
          map[asset.id] = asset.file_url;
        }
      }
    }

    setSignedUrls(map);
    setLoading(false);
  };

  const getIcon = (asset: Asset) => {
    if (asset.kind === 'image' || asset.mime_type?.startsWith('image/')) {
      return <Image className="h-4 w-4" />;
    }
    if (asset.kind === 'video' || asset.mime_type?.startsWith('video/')) {
      return <Video className="h-4 w-4" />;
    }
    return <FileText className="h-4 w-4" />;
  };

  const handleDownload = async (asset: Asset) => {
    const url = signedUrls[asset.id];
    if (!url) return;

    try {
      const link = document.createElement('a');
      link.href = url;
      link.download = asset.name || 'download';
      link.target = '_blank';
      link.click();
    } catch (e) {
      console.error('Error downloading file:', e);
    }
  };

  if (!assets || assets.length === 0) return null;

  return (
    <Popover onOpenChange={(open) => { if (open) loadSignedUrls(); }}>
      <PopoverTrigger asChild>
        <Badge 
          variant="secondary" 
          className="text-xs cursor-pointer hover:bg-secondary/80"
          title="Anexos"
        >
          <Paperclip className="h-3 w-3 mr-1" />
          {assets.length}
        </Badge>
      </PopoverTrigger>
      <PopoverContent className="w-80 bg-popover border z-50" align="start">
        <div className="space-y-2">
          <h4 className="font-semibold text-sm">Anexos ({assets.length})</h4>
          
          {loading && (
            <div className="text-xs text-muted-foreground">Carregando...</div>
          )}

          <div className="space-y-2 max-h-64 overflow-y-auto">
            {assets.map((asset) => {
              const url = signedUrls[asset.id];
              const isImage = asset.kind === 'image' || asset.mime_type?.startsWith('image/');

              return (
                <div 
                  key={asset.id} 
                  className="flex items-center gap-2 p-2 rounded-md bg-muted/50 hover:bg-muted"
                >
                  <div className="flex-shrink-0">
                    {isImage && url ? (
                      <img 
                        src={url} 
                        alt={asset.name}
                        className="h-10 w-10 object-cover rounded"
                      />
                    ) : (
                      <div className="h-10 w-10 flex items-center justify-center bg-background rounded">
                        {getIcon(asset)}
                      </div>
                    )}
                  </div>
                  
                  <div className="flex-1 min-w-0">
                    <p className="text-xs font-medium truncate" title={asset.name}>
                      {asset.name}
                    </p>
                    <p className="text-xs text-muted-foreground">
                      {asset.kind}
                    </p>
                  </div>

                  {url && (
                    <Button
                      size="sm"
                      variant="ghost"
                      onClick={() => handleDownload(asset)}
                      className="h-8 w-8 p-0"
                      title="Baixar"
                    >
                      <Download className="h-4 w-4" />
                    </Button>
                  )}
                </div>
              );
            })}
          </div>
        </div>
      </PopoverContent>
    </Popover>
  );
}
